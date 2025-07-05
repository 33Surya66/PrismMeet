const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Register
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const displayName = name || email; // Use provided name or email as fallback
  const hash = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hash, displayName], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    
    const user = {
      id: this.lastID,
      email: email,
      name: displayName
    };
    
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
    
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name || user.email // Use name if available, otherwise email
    };
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userData });
  });
});

// Get current user profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 