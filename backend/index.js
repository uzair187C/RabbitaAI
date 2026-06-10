require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('RabbitaAI backend is running');
});

require('./config/firebaseAdmin');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/test', require('./routes/test'));
app.use('/webhook', require('./routes/webhook'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'rabbitaai-backend' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  socket.on('join-request', (requestId) => {
    if (requestId) socket.join(String(requestId));
  });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);
      console.error('Fix: Atlas → Network Access → 0.0.0.0/0, confirm cluster is running, verify password in .env');
    }
  }

  httpServer.listen(PORT, () => {
    console.log(`RabbitaAI backend listening on http://localhost:${PORT}`);
  });
}

start();

module.exports = { app, httpServer, io }; // Trigger restart 2
