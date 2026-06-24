const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const FAQ = require('../models/FAQ');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ questions: [], faqs: [] });

    const regex = new RegExp(q, 'i');
    const [rawQuestions, faqs] = await Promise.all([
      Question.find({ $or: [{ title: regex }, { description: regex }, { tags: regex }] }).limit(10),
      FAQ.find({ $or: [{ question: regex }, { answer: regex }, { category: regex }] }).limit(5)
    ]);

    const questions = await Promise.all(rawQuestions.map(async question => {
      const [answerCount, votes] = await Promise.all([
        Answer.countDocuments({ questionId: question._id }),
        Vote.find({ targetType: 'question', targetId: question._id })
      ]);
      const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
      return { ...question.toObject(), answerCount, score };
    }));

    res.json({ questions, faqs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
