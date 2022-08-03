const express = require('express');

const app = express();
const http = require('http');

const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server);

const users = [];

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('display users', users);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

io.on('connection', (socket) => {
  socket.on('new user', (user) => {
    users.push(user);
    // io.emit('display users', users);
    socket.broadcast.emit('add user', user);
    console.log(users);
  });
  socket.on('typing', (data) => {
    socket.broadcast.emit('add typing', data);
  });
  socket.on('chat message', (data) => {
    // io.emit('chat message', msg);
    socket.broadcast.emit('other message', data);
    socket.emit('my message', data);
    console.log(`message from ${data.name}: ${data.msg}`);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
