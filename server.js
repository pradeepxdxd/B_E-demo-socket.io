const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

const token = true;
// for authentication
io.use((socket, next) => {
    if (!token) {
        return next(new Error('Authentication Error'))
    }
    else next()
})

io.on('connection', (socket) => {
    console.log('Connection established successfully');
    // socket.emit('welcome', `Connected id :- ${socket.id}`)
    socket.emit('welcome', socket.id)
    // socket.broadcast.emit('welcome', `${socket.id} joined the server`)

    // one-to-one
    socket.on('message', ({ text, id }) => {
        // socket.broadcast.emit('receive-message', {text, id})
        socket.to(id).emit('receive-message', text)
    })

    // group
    socket.on('join-room', ({ room, userId }) => {
        socket.join(room);
        socket.broadcast.emit('group-join-msg', `${userId} joined the room ${room}`)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    })
});

server.listen(4000, () => console.log('Server connected successfully on port 4000'));
