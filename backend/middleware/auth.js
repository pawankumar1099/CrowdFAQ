const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'crowdfaq-secret-2024';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header) {
    const token = header.split(' ')[1];
    try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'crowdfaq-secret-2024'); } catch {}
  }
  next();
}

module.exports = { auth, optionalAuth };
