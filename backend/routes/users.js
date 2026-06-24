const express = require('express');
const DB = require('../store/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', (req, res) => {
  const top = DB.users
    .map(u => ({ id: u.id, name: u.name, reputation: u.reputation || 0, role: u.role }))
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 10);
  res.json(top);
});

router.get('/:id/stats', (req, res) => {
  const user = DB.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const questions = DB.questions.filter(q => q.userId === req.params.id);
  const answers = DB.answers.filter(a => a.userId === req.params.id);
  const accepted = answers.filter(a => a.isAccepted).length;
  const { password: _, ...safe } = user;
  res.json({ ...safe, questionsCount: questions.length, answersCount: answers.length, acceptedAnswers: accepted, questions, answers });
});

router.get('/admin/dashboard', auth, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') return res.status(403).json({ message: 'Forbidden' });
  res.json({
    totalUsers: DB.users.length,
    totalQuestions: DB.questions.length,
    totalAnswers: DB.answers.length,
    totalFaqs: DB.faqs.length,
    recentUsers: DB.users.slice(-5).map(u => { const { password: _, ...s } = u; return s; }),
    trendingTags: getTrendingTags()
  });
});

function getTrendingTags() {
  const tagCount = {};
  DB.questions.forEach(q => q.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
}

module.exports = router;
