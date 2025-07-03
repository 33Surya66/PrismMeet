const express = require('express');
const db = require('../db');

const router = express.Router();

// Save or update notes for a meeting
router.post('/:meetingId/notes', (req, res) => {
  const { notes, speaker } = req.body;
  if (!notes || !speaker) {
    console.error('Missing notes or speaker:', req.body);
    return res.status(400).json({ error: 'Missing notes or speaker' });
  }
  db.run(
    'INSERT OR REPLACE INTO ai_notes (meeting_id, speaker, notes) VALUES (?, ?, ?)',
    [req.params.meetingId, speaker, notes],
    (err) => {
      if (err) {
        console.error('DB error on saving notes:', err.message);
        return res.status(500).json({ error: 'Could not save notes', details: err.message });
      }
      res.json({ message: 'Notes saved' });
    }
  );
});

// Get summary for a meeting (simple summary for MVP)
router.get('/:meetingId/summary', (req, res) => {
  const { meetingId } = req.params;
  db.get('SELECT notes FROM ai_notes WHERE meeting_id = ?', [meetingId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'No notes found' });
    // Simple summary: first 40 words
    const words = row.notes.split(/\s+/).slice(0, 40).join(' ');
    res.json({ summary: words + (row.notes.split(/\s+/).length > 40 ? '...' : '') });
  });
});

module.exports = router; 