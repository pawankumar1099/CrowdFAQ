const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

async function enrichQuestion(q) {
  const [answerCount, votes] = await Promise.all([
    Answer.countDocuments({ questionId: q._id }),
    Vote.find({ targetType: 'question', targetId: q._id })
  ]);
  const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
  const author = await User.findById(q.userId).select('name reputation');
  const obj = q.toObject();
  return { ...obj, id: obj._id.toString(), answerCount, score, author };
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { tag, sort = 'newest', page = 1, limit = 10 } = req.query;
    const filter = tag ? { tags: tag } : {};
    let questions = await Question.find(filter);

    const enriched = await Promise.all(questions.map(enrichQuestion));

    let sorted;
    if (sort === 'top') sorted = enriched.sort((a, b) => b.score - a.score);
    else if (sort === 'unanswered') sorted = enriched.filter(q => q.answerCount === 0).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = sorted.length;
    const skip = (Number(page) - 1) * Number(limit);
    res.json({ questions: sorted.slice(skip, skip + Number(limit)), total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/check-duplicate', async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) return res.json({ similar: [] });
    const questions = await Question.find({});
    const similar = questions
      .map(q => ({ ...q.toObject(), sim: similarity(title, q.title) }))
      .filter(q => q.sim > 0.5)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);
    res.json({ similar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!q) return res.status(404).json({ message: 'Not found' });
    res.json(await enrichQuestion(q));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
    const question = await Question.create({ title, description, tags: tags || [], userId: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { $inc: { reputation: 5 } });
    res.status(201).json(await enrichQuestion(question));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    if (q.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, description, tags } = req.body;
    if (title) q.title = title;
    if (description) q.description = description;
    if (tags) q.tags = tags;
    await q.save();
    res.json(await enrichQuestion(q));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    if (q.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
