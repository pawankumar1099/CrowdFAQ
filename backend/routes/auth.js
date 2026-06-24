const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const DB = require('../store/db');
const { auth } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'crowdfaq-secret-2024';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (DB.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuid(), name, email, password: hashed, role: 'user', reputation: 0, createdAt: new Date().toISOString() };
  DB.users.push(user);
  DB.save();

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = user;
  res.json({ token, user: safe });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = user;
  res.json({ token, user: safe });
});

router.get('/me', auth, (req, res) => {
  const user = DB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

module.exports = router;
