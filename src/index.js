const express = require('express');

const app = express();
const http = require('http');

const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server);

const getAvatar = () => {
  const number = Math.floor(Math.random() * 9) + 1;
  return `https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_0${number}.jpg`;
};

const users = [];
const onlineUsers = [];

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('display users', users);
  socket.on('disconnect', () => {
    console.log('user disconnected');
    console.log(onlineUsers[socket.id]);
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id].status = 'Offline';
      // users.push(onlineUsers[socket.id]);
      delete onlineUsers[socket.id];
      io.emit('display users', users);
    }
  });
});

io.on('connection', (socket) => {
  socket.on('new user', (userName) => {
    const result = users.findIndex((item) => item.userName === userName);
    if (result === -1) {
      const status = 'Online';
      const avatar = getAvatar();
      onlineUsers[socket.id] = { userName, avatar, status };
      users.push(onlineUsers[socket.id]);
      // socket.broadcast.emit('get user', { userName, avatar, status });
      io.emit('display users', users);
      socket.emit('get my info', onlineUsers[socket.id]);
    } else {
      users[result].status = 'Online';
      io.emit('display users', users);
      socket.emit('get my info', users[result]);
    }
    console.log(users);
    console.log(onlineUsers);
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
