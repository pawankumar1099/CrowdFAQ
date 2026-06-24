const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Vote = require('../models/Vote');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function enrichAnswer(a) {
  const votes = await Vote.find({ targetType: 'answer', targetId: a._id });
  const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
  const author = await User.findById(a.userId).select('name reputation');
  return { ...a.toObject(), score, author };
}

router.get('/question/:questionId', optionalAuth, async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId });
    const enriched = await Promise.all(answers.map(enrichAnswer));
    enriched.sort((a, b) => {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      return b.score - a.score;
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    if (!questionId || !content) return res.status(400).json({ message: 'questionId and content required' });
    const q = await Question.findById(questionId);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const answer = await Answer.create({ questionId, userId: req.user.id, content });
    await User.findByIdAndUpdate(req.user.id, { $inc: { reputation: 10 } });

    const [answerCount, votes] = await Promise.all([
      Answer.countDocuments({ questionId }),
      Vote.find({ targetType: 'question', targetId: questionId })
    ]);
    const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
    if (q.views >= 50 && answerCount >= 1 && score >= 5) {
      const exists = await FAQ.findOne({ sourceQuestionId: questionId });
      if (!exists) await FAQ.create({ question: q.title, answer: content, category: q.tags[0] || 'General', sourceQuestionId: questionId });
    }

    res.status(201).json(await enrichAnswer(answer));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    if (a.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    if (req.body.content) { a.content = req.body.content; await a.save(); }
    res.json(await enrichAnswer(a));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    if (a.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await Answer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/accept', auth, async (req, res) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    const q = await Question.findById(a.questionId);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    if (q.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Only question owner can accept' });

    await Answer.updateMany({ questionId: a.questionId }, { isAccepted: false });
    a.isAccepted = true;
    await a.save();
    q.acceptedAnswerId = a._id;
    await q.save();
    await User.findByIdAndUpdate(a.userId, { $inc: { reputation: 15 } });

    const votes = await Vote.find({ targetType: 'question', targetId: q._id });
    const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
    if (q.views >= 10 || score >= 3) {
      const exists = await FAQ.findOne({ sourceQuestionId: q._id });
      if (!exists) await FAQ.create({ question: q.title, answer: a.content, category: q.tags[0] || 'General', sourceQuestionId: q._id });
    }

    res.json(await enrichAnswer(a));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
