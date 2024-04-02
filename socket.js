// socket.js

const socketIO = require('socket.io');

let io;

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:5173",
        }
    });

    io.on('connection', (socket) => {
        console.log('A client connected');
    });

    return io;
}

function getSocketInstance() {
    if (!io) {
        throw new Error('Socket has not been initialized. Call initializeSocket(server) first.');
    }
    return io;
}

module.exports = {
    initializeSocket,
    getSocketInstance
};
