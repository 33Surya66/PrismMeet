const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fetch = require('node-fetch');

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
router.post('/:meetingId/structure', auth, async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not set' });
  try {
    // Fetch all ideas for this meeting
    db.all('SELECT idea, username FROM meeting_ideas WHERE meeting_id = ? ORDER BY created_at ASC', [req.params.meetingId], async (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not fetch ideas' });
      if (!rows || rows.length === 0) return res.status(400).json({ error: 'No ideas to structure' });
      // Build prompt
      const ideasText = rows.map((row, i) => `${i + 1}. ${row.username}: ${row.idea}`).join('\n');
      const prompt = `These are the ideas from a meeting. Please structure, group, and summarize them, and suggest optimal next steps for the team.\n\n${ideasText}`;
      // Call Gemini API
      const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: prompt } ] }
          ]
        })
      });
      const geminiData = await geminiRes.json();
      const structuredDoc = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No structured output from Gemini.';
      // Save structured doc
      db.run('UPDATE meeting_documents SET structured_doc = ?, last_updated = CURRENT_TIMESTAMP WHERE meeting_id = ?', [structuredDoc, req.params.meetingId], (err) => {
        if (err) return res.status(500).json({ error: 'Could not save structured document' });
        res.json({ structured_doc: structuredDoc });
      });
    });
  } catch (e) {
    res.status(500).json({ error: 'Gemini integration failed', details: e.message });
  }
});

// Add Gemini-powered MoM generation to the minutes endpoint
router.post('/:meetingId/minutes', auth, async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not set' });
  try {
    // Fetch all ideas for this meeting
    db.all('SELECT idea, username FROM meeting_ideas WHERE meeting_id = ? ORDER BY created_at ASC', [req.params.meetingId], async (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not fetch ideas' });
      if (!rows || rows.length === 0) return res.status(400).json({ error: 'No ideas to summarize for minutes' });
      // Build prompt for MoM
      const ideasText = rows.map((row, i) => `${i + 1}. ${row.username}: ${row.idea}`).join('\n');
      const prompt = `Based on the following meeting ideas and discussion, generate concise, actionable Minutes of Meeting (MoM) with key decisions, action items, and next steps.\n\n${ideasText}`;
      // Call Gemini API
      const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: prompt } ] }
          ]
        })
      });
      const geminiData = await geminiRes.json();
      const minutes = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No minutes generated by Gemini.';
      // Save minutes
      db.run('UPDATE meeting_documents SET minutes = ?, last_updated = CURRENT_TIMESTAMP WHERE meeting_id = ?', [minutes, req.params.meetingId], (err) => {
        if (err) return res.status(500).json({ error: 'Could not save minutes' });
        res.json({ minutes });
      });
    });
  } catch (e) {
    res.status(500).json({ error: 'Gemini MoM integration failed', details: e.message });
  }
});

module.exports = router; 