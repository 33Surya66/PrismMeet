const express = require('express');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const { google } = require('googleapis');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:8080',
  'https://prism-meet.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'calendar_secret',
  resave: false,
  saveUninitialized: true,
}));

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:4000/api/google/callback'
);

app.get('/api/google/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
  res.redirect(url);
});

app.get('/api/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.googleTokens = tokens;
    res.send('Google Calendar connected! You can close this window.');
  } catch (err) {
    res.status(500).send('OAuth error');
  }
});

const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');
const aiNotesRoutes = require('./routes/aiNotes');
const meetingDocumentsRoutes = require('./routes/meetingDocuments');

app.get('/', (req, res) => {
  res.send('PrismMeet Backend API');
});

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/ai', aiNotesRoutes);
app.use('/api/docs', meetingDocumentsRoutes);

// Socket.io logic
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);
  
  socket.on('join-meeting', ({ meetingId, user }) => {
    console.log('👥 User joining meeting:', { socketId: socket.id, meetingId, user });
    socket.join(meetingId);
    socket.data.user = user;
    socket.data.meetingId = meetingId;
    
    // Send all previous chat messages to the user
    db.all('SELECT user, text, timestamp FROM chat_messages WHERE meeting_id = ? ORDER BY timestamp ASC', [meetingId], (err, rows) => {
      if (!err && rows) {
        rows.forEach(msg => {
          socket.emit('chat-message', msg);
        });
      }
    });
    
    const participants = Array.from(io.sockets.adapter.rooms.get(meetingId) || []);
    console.log('📊 Meeting participants:', participants);
    io.to(meetingId).emit('participant-list', participants);
    
    socket.to(meetingId).emit('chat-message', { 
      user: 'System', 
      text: `${user.name || user.email || 'A user'} joined the meeting.`, 
      timestamp: new Date().toISOString() 
    });
    
    // Notify others of new participant for WebRTC
    console.log('📡 Broadcasting new-participant event:', { socketId: socket.id, user });
    socket.to(meetingId).emit('new-participant', { socketId: socket.id, user });
  });
  
  socket.on('chat-message', ({ meetingId, text }) => {
    const user = socket.data.user || { name: 'Anonymous', email: '' };
    const timestamp = new Date().toISOString();
    console.log('💬 Chat message:', { socketId: socket.id, user: user.name, text });
    db.run('INSERT INTO chat_messages (meeting_id, user, text, timestamp) VALUES (?, ?, ?, ?)', [meetingId, user.name || user.email || 'Anonymous', text, timestamp]);
    io.to(meetingId).emit('chat-message', { user: user.name || user.email || 'Anonymous', text, timestamp });
  });
  
  socket.on('raise-hand', ({ meetingId }) => {
    const user = socket.data.user || { name: 'Anonymous', email: '' };
    console.log('✋ Hand raised:', { socketId: socket.id, user: user.name });
    io.to(meetingId).emit('hand-raised', { user: user.name || user.email || 'Anonymous' });
  });
  
  // WebRTC signaling relay
  socket.on('signal', ({ meetingId, to, from, data }) => {
    console.log('📡 WebRTC signal:', { 
      socketId: socket.id, 
      meetingId, 
      to, 
      from, 
      signalType: data.type 
    });
    // Relay the signal to the intended recipient
    io.to(to).emit('signal', { from, data });
  });
  
  socket.on('disconnect', () => {
    const meetingId = socket.data.meetingId;
    const user = socket.data.user || { name: 'Anonymous', email: '' };
    console.log('🔌 Socket disconnected:', { socketId: socket.id, meetingId, user: user.name });
    
    if (meetingId) {
      const participants = Array.from(io.sockets.adapter.rooms.get(meetingId) || []);
      io.to(meetingId).emit('participant-list', participants);
      io.to(meetingId).emit('chat-message', { 
        user: 'System', 
        text: `${user.name || user.email || 'A user'} left the meeting.`, 
        timestamp: new Date().toISOString() 
      });
      // Notify others that this participant left (for WebRTC cleanup)
      console.log('📡 Broadcasting participant-left event:', { socketId: socket.id });
      socket.to(meetingId).emit('participant-left', { socketId: socket.id });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 