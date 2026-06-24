const express = require('express');
const DB = require('../store/db');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let faqs = [...DB.faqs];
  if (category) faqs = faqs.filter(f => f.category === category);
  faqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(faqs);
});

router.get('/categories', (req, res) => {
  const cats = [...new Set(DB.faqs.map(f => f.category).filter(Boolean))];
  res.json(cats);
});

module.exports = router;
