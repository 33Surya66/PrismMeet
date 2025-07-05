const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'prismmeet.db'), (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if not exist
const userTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

const meetingTable = `CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  host_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  location TEXT,
  calendar_event_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(host_id) REFERENCES users(id)
);`;

const meetingParticipantsTable = `CREATE TABLE IF NOT EXISTS meeting_participants (
  meeting_id TEXT,
  user_id INTEGER,
  PRIMARY KEY (meeting_id, user_id),
  FOREIGN KEY(meeting_id) REFERENCES meetings(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);`;

const logTable = `CREATE TABLE IF NOT EXISTS meeting_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT,
  user_id INTEGER,
  event TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(meeting_id) REFERENCES meetings(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);`;

const aiNotesTable = `CREATE TABLE IF NOT EXISTS ai_notes (
  meeting_id TEXT,
  speaker TEXT,
  notes TEXT,
  PRIMARY KEY (meeting_id, speaker)
);`;

const chatMessagesTable = `CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT NOT NULL,
  user TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

const meetingDocumentsTable = `CREATE TABLE IF NOT EXISTS meeting_documents (
  meeting_id TEXT PRIMARY KEY,
  raw_ideas TEXT,
  structured_doc TEXT,
  minutes TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(meeting_id) REFERENCES meetings(id)
);`;

const meetingIdeasTable = `CREATE TABLE IF NOT EXISTS meeting_ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  idea TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(meeting_id) REFERENCES meetings(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);`;

db.serialize(() => {
  db.run(userTable);
  db.run(meetingTable);
  db.run(meetingParticipantsTable);
  db.run(logTable);
  db.run(aiNotesTable);
  db.run(chatMessagesTable);
  db.run(meetingDocumentsTable);
  db.run(meetingIdeasTable);
  
  // Migration: Add name column to existing users table if it doesn't exist
  db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error('Error checking table schema:', err);
      return;
    }
    
    if (!rows || !Array.isArray(rows)) {
      console.log('No table info returned, skipping migration');
      return;
    }
    
    const hasNameColumn = rows.some(row => row.name === 'name');
    if (!hasNameColumn) {
      console.log('Adding name column to users table...');
      db.run("ALTER TABLE users ADD COLUMN name TEXT", (err) => {
        if (err) {
          console.error('Error adding name column:', err);
        } else {
          console.log('Successfully added name column to users table');
          // Update existing users to use email as name
          db.run("UPDATE users SET name = email WHERE name IS NULL", (err) => {
            if (err) {
              console.error('Error updating existing users:', err);
            } else {
              console.log('Updated existing users with email as name');
            }
          });
        }
      });
    } else {
      console.log('Name column already exists in users table');
    }
  });
});

module.exports = db; 