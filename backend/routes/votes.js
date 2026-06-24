const express = require('express');
const { v4: uuid } = require('uuid');
const DB = require('../store/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, (req, res) => {
  const { targetType, targetId, type } = req.body;
  if (!['question', 'answer'].includes(targetType) || !['up', 'down'].includes(type))
    return res.status(400).json({ message: 'Invalid vote' });

  const existing = DB.votes.find(v => v.userId === req.user.id && v.targetId === targetId && v.targetType === targetType);
  if (existing) {
    if (existing.type === type) {
      const idx = DB.votes.indexOf(existing);
      DB.votes.splice(idx, 1);
      DB.save();
      return res.json({ message: 'Vote removed' });
    } else {
      existing.type = type;
      DB.save();
      return res.json({ message: 'Vote updated' });
    }
  }

  DB.votes.push({ id: uuid(), userId: req.user.id, targetType, targetId, type, createdAt: new Date().toISOString() });
  const target = targetType === 'question'
    ? DB.questions.find(q => q.id === targetId)
    : DB.answers.find(a => a.id === targetId);
  if (target) {
    const owner = DB.users.find(u => u.id === target.userId);
    if (owner && type === 'up') owner.reputation = (owner.reputation || 0) + 2;
  }
  DB.save();
  res.json({ message: 'Vote recorded' });
});

router.get('/my', auth, (req, res) => {
  const votes = DB.votes.filter(v => v.userId === req.user.id);
  res.json(votes);
});

module.exports = router;
