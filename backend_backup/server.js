const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure data dir
const dbFile = path.join(__dirname, 'data.db');
const dbExists = fs.existsSync(dbFile);
const db = new sqlite3.Database(dbFile);

// Initialize tables
db.serialize(() => {
  if (!dbExists) {
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      profile TEXT
    )`);
    console.log('Created users table.');
  }
});

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Signup
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email+password required' });

  const stmt = db.prepare('INSERT INTO users (email, password, profile) VALUES (?, ?, ?)');
  stmt.run(email, password, JSON.stringify({}), function(err){
    if(err){
      if(err.message && err.message.includes('UNIQUE')) return res.status(400).json({ error: 'user exists' });
      console.error(err);
      return res.status(500).json({ error: 'db error' });
    }
    res.json({ ok:true, userId: this.lastID });
  });
  stmt.finalize();
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id,email,password, name, profile FROM users WHERE email = ?', [email], (err,row)=>{
    if(err){ console.error(err); return res.status(500).json({ error:'db' }); }
    if(!row || row.password !== password) return res.status(401).json({ error:'invalid' });
    res.json({ ok:true, userId: row.id, name: row.name, profile: JSON.parse(row.profile || '{}') });
  });
});

// Onboard - save profile
app.post('/api/onboard', (req, res) => {
  const { userId, profile } = req.body;
  if(!userId) return res.status(400).json({ error: 'no userId' });
  const stmt = db.prepare('UPDATE users SET profile = ?, name = ? WHERE id = ?');
  stmt.run(JSON.stringify(profile || {}), (profile && profile.fullName) || null, userId, function(err){
    if(err){ console.error(err); return res.status(500).json({ error: 'db' }); }
    res.json({ ok:true });
  });
  stmt.finalize();
});

// Get user
app.get('/api/user/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT id,email,name,profile FROM users WHERE id = ?', [id], (err,row)=>{
    if(err){ console.error(err); return res.status(500).json({ error:'db' }); }
    if(!row) return res.status(404).json({ error:'not found' });
    row.profile = JSON.parse(row.profile || '{}');
    res.json({ ok:true, user: row });
  });
});

// Chat endpoint - forwards to Flask model service
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    // Proxy to Flask model service (assumed running on port 5001)
    const resp = await axios.post('http://127.0.0.1:5001/model', { message });
    return res.json({ reply: resp.data.reply });
  } catch (err) {
    console.error('model error', err.message);
    // fallback reply
    return res.json({ reply: "Sorry, the model service is unavailable. For now — I hear you: " + (message||'') });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend listening on', PORT));
