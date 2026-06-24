const express = require('express');
const { v4: uuid } = require('uuid');
const DB = require('../store/db');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function enrichAnswer(a) {
  const votes = DB.votes.filter(v => v.targetType === 'answer' && v.targetId === a.id);
  const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
  const author = DB.users.find(u => u.id === a.userId);
  return { ...a, score, author: author ? { id: author.id, name: author.name, reputation: author.reputation } : null };
}

router.get('/question/:questionId', optionalAuth, (req, res) => {
  const answers = DB.answers.filter(a => a.questionId === req.params.questionId).map(enrichAnswer);
  answers.sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return b.score - a.score;
  });
  res.json(answers);
});

router.post('/', auth, (req, res) => {
  const { questionId, content } = req.body;
  if (!questionId || !content) return res.status(400).json({ message: 'questionId and content required' });
  const q = DB.questions.find(q => q.id === questionId);
  if (!q) return res.status(404).json({ message: 'Question not found' });
  const answer = { id: uuid(), questionId, userId: req.user.id, content, isAccepted: false, createdAt: new Date().toISOString() };
  DB.answers.push(answer);
  const user = DB.users.find(u => u.id === req.user.id);
  if (user) { user.reputation = (user.reputation || 0) + 10; }

  const answers = DB.answers.filter(a => a.questionId === questionId);
  const votes = DB.votes.filter(v => v.targetType === 'question' && v.targetId === questionId);
  const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
  if (q.views >= 50 && answers.length >= 1 && score >= 5) {
    const existing = DB.faqs.find(f => f.sourceQuestionId === questionId);
    if (!existing) {
      DB.faqs.push({ id: uuid(), question: q.title, answer: answer.content, category: q.tags[0] || 'General', sourceQuestionId: questionId, createdAt: new Date().toISOString() });
    }
  }

  DB.save();
  res.status(201).json(enrichAnswer(answer));
});

router.put('/:id', auth, (req, res) => {
  const a = DB.answers.find(a => a.id === req.params.id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  if (a.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  if (req.body.content) a.content = req.body.content;
  DB.save();
  res.json(enrichAnswer(a));
});

router.delete('/:id', auth, (req, res) => {
  const idx = DB.answers.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  const a = DB.answers[idx];
  if (a.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  DB.answers.splice(idx, 1);
  DB.save();
  res.json({ message: 'Deleted' });
});

router.post('/:id/accept', auth, (req, res) => {
  const a = DB.answers.find(a => a.id === req.params.id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  const q = DB.questions.find(q => q.id === a.questionId);
  if (!q) return res.status(404).json({ message: 'Question not found' });
  if (q.userId !== req.user.id) return res.status(403).json({ message: 'Only question owner can accept' });

  DB.answers.forEach(ans => { if (ans.questionId === a.questionId) ans.isAccepted = false; });
  a.isAccepted = true;
  q.acceptedAnswerId = a.id;

  const answerAuthor = DB.users.find(u => u.id === a.userId);
  if (answerAuthor) { answerAuthor.reputation = (answerAuthor.reputation || 0) + 15; }

  const votes = DB.votes.filter(v => v.targetType === 'question' && v.targetId === q.id);
  const score = votes.filter(v => v.type === 'up').length - votes.filter(v => v.type === 'down').length;
  if (q.views >= 10 || score >= 3) {
    const existing = DB.faqs.find(f => f.sourceQuestionId === q.id);
    if (!existing) {
      DB.faqs.push({ id: uuid(), question: q.title, answer: a.content, category: q.tags[0] || 'General', sourceQuestionId: q.id, createdAt: new Date().toISOString() });
    }
  }

  DB.save();
  res.json(enrichAnswer(a));
});

module.exports = router;
