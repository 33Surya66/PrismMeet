const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Add an idea to the meeting's document, with user info
router.post('/:meetingId/ideas', auth, (req, res) => {
  const { idea } = req.body;
  const userId = req.user.id;
  const username = req.user.email; // or req.user.name if available
  if (!idea) return res.status(400).json({ error: 'Missing idea' });
  db.run('INSERT INTO meeting_ideas (meeting_id, user_id, username, idea, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)', [req.params.meetingId, userId, username, idea], (err) => {
    if (err) return res.status(500).json({ error: 'Could not save idea' });
    res.json({ message: 'Idea added' });
  });
});

// Get all ideas for a meeting (for sticky notes display)
router.get('/:meetingId/ideas', auth, (req, res) => {
  db.all('SELECT user_id, username, idea, created_at FROM meeting_ideas WHERE meeting_id = ? ORDER BY created_at ASC', [req.params.meetingId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not fetch ideas' });
    res.json(rows);
  });
});

// Get the current meeting document
router.get('/:meetingId/document', (req, res) => {
  db.get('SELECT * FROM meeting_documents WHERE meeting_id = ?', [req.params.meetingId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Could not fetch document' });
    if (!row) return res.status(404).json({ error: 'No document found' });
    res.json(row);
  });
});

// Stub: Structure and summarize the document using Gemini (to be implemented)
router.post('/:meetingId/structure', (req, res) => {
  // TODO: Integrate Gemini API
  res.status(501).json({ error: 'Gemini integration not implemented yet' });
});

// Stub: Add minutes of meeting (MoM)
router.post('/:meetingId/minutes', (req, res) => {
  const { minutes } = req.body;
  if (!minutes) return res.status(400).json({ error: 'Missing minutes' });
  db.run('UPDATE meeting_documents SET minutes = ?, last_updated = CURRENT_TIMESTAMP WHERE meeting_id = ?', [minutes, req.params.meetingId], (err) => {
    if (err) return res.status(500).json({ error: 'Could not save minutes' });
    res.json({ message: 'Minutes saved' });
  });
});

module.exports = router; 