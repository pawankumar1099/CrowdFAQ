const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, 'localhost', () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;
