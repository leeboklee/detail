#!/usr/bin/env node
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket client disconnected:', socket.id));
});

// HTTP endpoint to emit messages to connected clients
app.post('/emit', (req, res) => {
  const { title, message, extra } = req.body || {};
  console.log('Emit request:', title);
  io.emit('agent-notify', { title, message, extra, timestamp: new Date().toISOString() });
  res.json({ ok: true });
});

const PORT = process.env.SOCKET_SERVER_PORT || 4001;
server.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});


