const express = require('express');
const http = require('http');
const path = require('path');
const formatMessage = require('./helpers/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./helpers/users');

const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// статичная папка с данными
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatBot';

// listener когда клиент подключился
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Приветсвие при подключении
        socket.emit('message', formatMessage(botName, 'Welcome to Socket.io chat app'));

        // broadcast вещание всем кроме user
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `A ${user.username} has joined the chat`));

        // отправить информацию о юзерах и комнате
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    // listener chatMessage от клиента
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // listener disconnect client
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat`));

            // отправить информацию о юзерах и комнате
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));