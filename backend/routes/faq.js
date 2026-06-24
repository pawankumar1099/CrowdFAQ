const express = require('express');
const FAQ = require('../models/FAQ');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const faqs = await FAQ.find(filter).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const cats = await FAQ.distinct('category');
    res.json(cats.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
