const express = require('express');
const DB = require('../store/db');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ questions: [], faqs: [] });
  const term = q.toLowerCase();

  const questions = DB.questions.filter(question => {
    return (
      question.title.toLowerCase().includes(term) ||
      question.description.toLowerCase().includes(term) ||
      question.tags.some(t => t.toLowerCase().includes(term))
    );
  }).slice(0, 10).map(question => {
    const answers = DB.answers.filter(a => a.questionId === question.id);
    const votes = DB.votes.filter(v => v.targetType === 'question' && v.targetId === question.id);
    const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
    return { ...question, answerCount: answers.length, score };
  });

  const faqs = DB.faqs.filter(f => {
    return f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term) || (f.category && f.category.toLowerCase().includes(term));
  }).slice(0, 5);

  res.json({ questions, faqs });
});

module.exports = router;
