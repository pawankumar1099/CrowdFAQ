const express = require('express');
const { v4: uuid } = require('uuid');
const DB = require('../store/db');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

function enrichQuestion(q) {
  const answers = DB.answers.filter(a => a.questionId === q.id);
  const votes = DB.votes.filter(v => v.targetType === 'question' && v.targetId === q.id);
  const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
  const author = DB.users.find(u => u.id === q.userId);
  return { ...q, answerCount: answers.length, score, author: author ? { id: author.id, name: author.name, reputation: author.reputation } : null };
}

router.get('/', optionalAuth, (req, res) => {
  const { tag, sort = 'newest', page = 1, limit = 10 } = req.query;
  let qs = [...DB.questions];
  if (tag) qs = qs.filter(q => q.tags.includes(tag));

  qs = qs.map(enrichQuestion);
  if (sort === 'top') qs.sort((a, b) => b.score - a.score);
  else if (sort === 'unanswered') qs = qs.filter(q => q.answerCount === 0).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else qs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = qs.length;
  const skip = (Number(page) - 1) * Number(limit);
  res.json({ questions: qs.slice(skip, skip + Number(limit)), total, page: Number(page) });
});

router.get('/check-duplicate', (req, res) => {
  const { title } = req.query;
  if (!title) return res.json({ similar: [] });
  const similar = DB.questions
    .map(q => ({ ...q, sim: similarity(title, q.title) }))
    .filter(q => q.sim > 0.5)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3);
  res.json({ similar });
});

router.get('/:id', optionalAuth, (req, res) => {
  const q = DB.questions.find(q => q.id === req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  q.views = (q.views || 0) + 1;
  DB.save();
  res.json(enrichQuestion(q));
});

router.post('/', auth, (req, res) => {
  const { title, description, tags } = req.body;
  if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
  const question = { id: uuid(), title, description, tags: tags || [], userId: req.user.id, views: 0, acceptedAnswerId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  DB.questions.push(question);
  const user = DB.users.find(u => u.id === req.user.id);
  if (user) { user.reputation = (user.reputation || 0) + 5; }
  DB.save();
  res.status(201).json(enrichQuestion(question));
});

router.put('/:id', auth, (req, res) => {
  const q = DB.questions.find(q => q.id === req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  if (q.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { title, description, tags } = req.body;
  if (title) q.title = title;
  if (description) q.description = description;
  if (tags) q.tags = tags;
  q.updatedAt = new Date().toISOString();
  DB.save();
  res.json(enrichQuestion(q));
});

router.delete('/:id', auth, (req, res) => {
  const idx = DB.questions.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  const q = DB.questions[idx];
  if (q.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  DB.questions.splice(idx, 1);
  DB.save();
  res.json({ message: 'Deleted' });
});

module.exports = router;
