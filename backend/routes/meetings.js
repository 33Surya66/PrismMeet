const express = require('express');
const { v4: uuidv4 } = require('uuid');
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

// Create meeting (with scheduling and participants)
router.post('/', auth, (req, res) => {
  const id = uuidv4();
  const host_id = req.user.id;
  const { title, description, start_time, end_time, location, participants } = req.body;
  db.run(
    'INSERT INTO meetings (id, host_id, title, description, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, host_id, title, description, start_time, end_time, location],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not create meeting' });
      // Add host as participant
      db.run('INSERT INTO meeting_participants (meeting_id, user_id) VALUES (?, ?)', [id, host_id]);
      // Add other participants
      if (Array.isArray(participants)) {
        participants.forEach(user_id => {
          db.run('INSERT INTO meeting_participants (meeting_id, user_id) VALUES (?, ?)', [id, user_id]);
        });
      }
      // Fetch the full meeting object to return
      db.get('SELECT * FROM meetings WHERE id = ?', [id], (err, meeting) => {
        if (err || !meeting) return res.status(500).json({ error: 'Could not fetch created meeting' });
        res.json(meeting);
      });
    }
  );
});

// List meetings for user
router.get('/', auth, (req, res) => {
  db.all(
    `SELECT m.* FROM meetings m
     JOIN meeting_participants mp ON m.id = mp.meeting_id
     WHERE mp.user_id = ?
     ORDER BY m.start_time DESC`,
    [req.user.id],
    (err, meetings) => {
      if (err) return res.status(500).json({ error: 'Could not fetch meetings' });
      res.json(meetings);
    }
  );
});

// Get meeting details (with participants)
router.get('/:id', auth, (req, res) => {
  db.get('SELECT * FROM meetings WHERE id = ?', [req.params.id], (err, meeting) => {
    if (err || !meeting) return res.status(404).json({ error: 'Meeting not found' });
    // Check if user is a participant
    db.get('SELECT 1 FROM meeting_participants WHERE meeting_id = ? AND user_id = ?', [req.params.id, req.user.id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Could not check participant' });
      if (!row) {
        // Add user as participant if not already
        db.run('INSERT INTO meeting_participants (meeting_id, user_id) VALUES (?, ?)', [req.params.id, req.user.id], (err) => {
          if (err) return res.status(500).json({ error: 'Could not add participant' });
          db.all('SELECT user_id FROM meeting_participants WHERE meeting_id = ?', [req.params.id], (err, participants) => {
            if (err) return res.status(500).json({ error: 'Could not fetch participants' });
            meeting.participants = participants.map(p => p.user_id);
            res.json(meeting);
          });
        });
      } else {
        db.all('SELECT user_id FROM meeting_participants WHERE meeting_id = ?', [req.params.id], (err, participants) => {
          if (err) return res.status(500).json({ error: 'Could not fetch participants' });
          meeting.participants = participants.map(p => p.user_id);
          res.json(meeting);
        });
      }
    });
  });
});

// Update meeting
router.put('/:id', auth, (req, res) => {
  const { title, description, start_time, end_time, location, participants } = req.body;
  db.run(
    'UPDATE meetings SET title = ?, description = ?, start_time = ?, end_time = ?, location = ? WHERE id = ?',
    [title, description, start_time, end_time, location, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not update meeting' });
      // Update participants
      db.run('DELETE FROM meeting_participants WHERE meeting_id = ?', [req.params.id], () => {
        if (Array.isArray(participants)) {
          participants.forEach(user_id => {
            db.run('INSERT INTO meeting_participants (meeting_id, user_id) VALUES (?, ?)', [req.params.id, user_id]);
          });
        }
        // TODO: Google Calendar update here (stub)
        res.json({ message: 'Meeting updated' });
      });
    }
  );
});

// Delete meeting
router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM meetings WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Could not delete meeting' });
    db.run('DELETE FROM meeting_participants WHERE meeting_id = ?', [req.params.id], () => {
      // TODO: Google Calendar delete here (stub)
      res.json({ message: 'Meeting deleted' });
    });
  });
});

// Join meeting
router.post('/:id/join', auth, (req, res) => {
  db.get('SELECT * FROM meetings WHERE id = ?', [req.params.id], (err, meeting) => {
    if (err || !meeting) return res.status(404).json({ error: 'Meeting not found' });
    db.run('INSERT INTO meeting_logs (meeting_id, user_id, event) VALUES (?, ?, ?)', [req.params.id, req.user.id, 'User joined'], () => {
      res.json({ message: 'Joined meeting' });
    });
  });
});

// AI agent logs event
router.post('/:id/ai-log', (req, res) => {
  const { event } = req.body;
  db.run('INSERT INTO meeting_logs (meeting_id, user_id, event) VALUES (?, NULL, ?)', [req.params.id, event], (err) => {
    if (err) return res.status(500).json({ error: 'Could not log event' });
    res.json({ message: 'Event logged' });
  });
});

// Instant meeting link generation
router.post('/instant', auth, (req, res) => {
  const id = uuidv4();
  const host_id = req.user.id;
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO meetings (id, host_id, title, description, start_time, end_time, location, calendar_event_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, host_id, 'Instant Meeting', '', now, now, '', null],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not create instant meeting' });
      db.run('INSERT INTO meeting_participants (meeting_id, user_id) VALUES (?, ?)', [id, host_id]);
      db.get('SELECT * FROM meetings WHERE id = ?', [id], (err, meeting) => {
        if (err || !meeting) return res.status(500).json({ error: 'Could not fetch created meeting' });
        res.json(meeting);
      });
    }
  );
});

module.exports = router; 