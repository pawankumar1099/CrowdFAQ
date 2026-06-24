const express = require('express');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, type } = req.body;
    if (!['question', 'answer'].includes(targetType) || !['up', 'down'].includes(type))
      return res.status(400).json({ message: 'Invalid vote' });

    const existing = await Vote.findOne({ userId: req.user.id, targetType, targetId });
    if (existing) {
      if (existing.type === type) {
        await Vote.findByIdAndDelete(existing._id);
        return res.json({ message: 'Vote removed' });
      } else {
        existing.type = type;
        await existing.save();
        return res.json({ message: 'Vote updated' });
      }
    }

    await Vote.create({ userId: req.user.id, targetType, targetId, type });

    if (type === 'up') {
      const target = targetType === 'question'
        ? await Question.findById(targetId)
        : await Answer.findById(targetId);
      if (target) await User.findByIdAndUpdate(target.userId, { $inc: { reputation: 2 } });
    }

    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.user.id });
    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
