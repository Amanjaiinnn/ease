// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_therapist';
// const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(()=> console.log('Connected to MongoDB'))
//   .catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

// const UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   passwordHash: { type: String, required: true },
//   name: { type: String },
//   profile: { type: Object, default: {} },
//   createdAt: { type: Date, default: Date.now }
// });

// const User = mongoose.model('User', UserSchema);

// app.get('/api/health', (req,res)=> res.json({status:'ok'}));

// app.post('/api/signup', async (req,res)=>{
//   const { email, password } = req.body;
//   if(!email || !password) return res.status(400).json({ error: 'email+password required' });
//   try{
//     const existing = await User.findOne({ email });
//     if(existing) return res.status(400).json({ error: 'user exists' });
//     const hash = await bcrypt.hash(password, 10);
//     const user = await User.create({ email, passwordHash: hash, profile: {} });
//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
//     return res.json({ ok:true, token, userId: user._id });
//   }catch(err){
//     console.error(err);
//     return res.status(500).json({ error: 'server error' });
//   }
// });

// app.post('/api/login', async (req,res)=>{
//   const { email, password } = req.body;
//   if(!email || !password) return res.status(400).json({ error: 'email+password required' });
//   try{
//     const user = await User.findOne({ email });
//     if(!user) return res.status(401).json({ error: 'invalid' });
//     const ok = await bcrypt.compare(password, user.passwordHash);
//     if(!ok) return res.status(401).json({ error: 'invalid' });
//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
//     return res.json({ ok:true, token, userId: user._id, name: user.name });
//   }catch(err){
//     console.error(err);
//     return res.status(500).json({ error: 'server error' });
//   }
// });

// // auth middleware
// function auth(req,res,next){
//   const h = req.headers.authorization;
//   if(!h) return res.status(401).json({ error:'missing auth' });
//   const parts = h.split(' ');
//   if(parts.length!==2) return res.status(401).json({ error:'bad auth' });
//   const token = parts[1];
//   try{
//     const data = jwt.verify(token, JWT_SECRET);
//     req.userId = data.userId;
//     next();
//   }catch(err){ return res.status(401).json({ error:'invalid token' }); }
// }

// // onboard save profile (requires auth)
// app.post('/api/onboard', auth, async (req,res)=>{
//   const profile = req.body.profile || {};
//   try{
//     const user = await User.findById(req.userId);
//     if(!user) return res.status(404).json({ error:'not found' });
//     user.profile = {...user.profile, ...profile};
//     if(profile.fullName) user.name = profile.fullName;
//     await user.save();
//     return res.json({ ok:true });
//   }catch(err){ console.error(err); return res.status(500).json({ error:'db' }); }
// });

// app.get('/api/user/me', auth, async (req,res)=>{
//   try{
//     const user = await User.findById(req.userId).select('-passwordHash');
//     if(!user) return res.status(404).json({ error:'not found' });
//     return res.json({ ok:true, user });
//   }catch(err){ console.error(err); return res.status(500).json({ error:'db' }); }
// });

// // Chat endpoint proxies to model service
// app.post('/api/chat', auth, async (req,res)=>{
//   const { message } = req.body;
//   try{
//     const modelUrl = process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:5001/model';
//     const resp = await axios.post(modelUrl, { message });
//     return res.json({ reply: resp.data.reply });
//   }catch(err){
//     console.error('model error', err.message);
//     return res.json({ reply: "Sorry, the model service is unavailable. I hear you: " + (message||'') });
//   }
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, ()=> console.log('Backend listening on', PORT));


// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// config
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_therapist';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const MODEL_BASE = (process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:5001').replace(/\/$/, ''); // no trailing slash
const PORT = process.env.PORT || 4000;

console.log('Using MODEL_BASE =', MODEL_BASE);

// Mongoose / DB
mongoose.set('strictQuery', false);
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

// --- Schemas & Models ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  profile: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- Helpers ---
function generateToken(userId){
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// auth middleware
function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error:'missing auth' });
  const parts = h.split(' ');
  if(parts.length!==2) return res.status(401).json({ error:'bad auth' });
  const token = parts[1];
  try{
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.userId;
    next();
  }catch(err){ return res.status(401).json({ error:'invalid token' }); }
}

// --- Health ---
app.get('/api/health', (req,res)=> res.json({status:'ok'}));

// --- Auth routes ---
app.post('/api/signup', async (req,res)=>{
  const { email, password, name } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email+password required' });
  try{
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ error: 'user exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash, name, profile: {} });
    const token = generateToken(user._id);
    return res.json({ ok:true, token, userId: user._id, name: user.name });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/login', async (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email+password required' });
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ error: 'invalid' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({ error: 'invalid' });
    const token = generateToken(user._id);
    return res.json({ ok:true, token, userId: user._id, name: user.name });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// onboard save profile (requires auth)
app.post('/api/onboard', auth, async (req,res)=>{
  const profile = req.body.profile || {};
  try{
    const user = await User.findById(req.userId);
    if(!user) return res.status(404).json({ error:'not found' });
    user.profile = {...user.profile, ...profile};
    if(profile.fullName) user.name = profile.fullName;
    await user.save();
    return res.json({ ok:true });
  }catch(err){ console.error(err); return res.status(500).json({ error:'db' }); }
});

app.get('/api/user/me', auth, async (req,res)=>{
  try{
    const user = await User.findById(req.userId).select('-passwordHash');
    if(!user) return res.status(404).json({ error:'not found' });
    return res.json({ ok:true, user });
  }catch(err){ console.error(err); return res.status(500).json({ error:'db' }); }
});

// --- Model integration endpoints ---
// 1) /api/chat (text) -> forward to Flask POST /chat_text
app.post('/api/chat', auth, async (req,res)=>{
  const { message, session_id } = req.body;
  if(!message) return res.status(400).json({ error: 'missing message' });

  try{
    const modelUrl = `${MODEL_BASE}/chat_text`;
    const payload = { input: message };
    if(session_id) payload.session_id = session_id;
    const resp = await axios.post(modelUrl, payload, { timeout: 20000 });
    // The Flask route returns { response: ... } from your code; normalize to { reply }
    const reply = resp?.data?.response || resp?.data?.reply || "Sorry, no reply from model.";
    return res.json({ reply });
  }catch(err){
    console.error('model/text error', err.message || err);
    // graceful fallback
    return res.json({ reply: "Sorry, the model service is unavailable. I hear you: " + (message||'') });
  }
});

// 2) /api/chat_voice -> forward to Flask GET /chat_voice which does speech flow (listen->respond->tts)
app.get('/api/chat_voice', auth, async (req,res)=>{
  try{
    const modelUrl = `${MODEL_BASE}/chat_voice`;
    const resp = await axios.get(modelUrl, { timeout: 60000 });
    // Expected response: { user_input, response, audio_file }
    return res.json(resp.data);
  }catch(err){
    console.error('model/voice error', err.message || err);
    return res.status(500).json({ error: 'model unavailable' });
  }
});

// If you want: an endpoint to fetch the TTS audio file from the Flask server (proxy)
app.get('/api/model/audio', auth, async (req,res)=>{
  const { path } = req.query;
  if(!path) return res.status(400).json({ error: 'missing path' });
  try{
    const audioUrl = `${MODEL_BASE}/${path.replace(/^\//,'')}`; // ensure no double slash
    const resp = await axios.get(audioUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', resp.headers['content-type'] || 'audio/mpeg');
    resp.data.pipe(res);
  }catch(err){
    console.error('audio proxy error', err.message || err);
    res.status(500).json({ error: 'cannot fetch audio' });
  }
});

// start server only when mongoose connection is ready
mongoose.connection.once('open', () => {
  app.listen(PORT, ()=> console.log('Backend listening on', PORT));
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
