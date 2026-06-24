const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const FAQ = require('../models/FAQ');
const Vote = require('../models/Vote');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}).select('name reputation role').sort({ reputation: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/dashboard', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator')
    return res.status(403).json({ message: 'Forbidden' });
  try {
    const [totalUsers, totalQuestions, totalAnswers, totalFaqs, recentUsers, trendingTags] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      FAQ.countDocuments(),
      User.find({}).select('-password').sort({ createdAt: -1 }).limit(5),
      getTrendingTags()
    ]);
    res.json({ totalUsers, totalQuestions, totalAnswers, totalFaqs, recentUsers, trendingTags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getTrendingTags() {
  const questions = await Question.find({}, 'tags');
  const tagCount = {};
  questions.forEach(q => q.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
}

router.get('/:id/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Not found' });
    const [questions, answers] = await Promise.all([
      Question.find({ userId: req.params.id }).sort({ createdAt: -1 }),
      Answer.find({ userId: req.params.id }).sort({ createdAt: -1 })
    ]);
    const acceptedAnswers = answers.filter(a => a.isAccepted).length;
    res.json({ ...user.toObject(), questionsCount: questions.length, answersCount: answers.length, acceptedAnswers, questions, answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
