//socketserv.js
const socketIo = require('socket.io');
let ioInstance;

exports.init = (server) => {
    if (!ioInstance) {
        ioInstance = socketIo(server);
        ioInstance.on('connection', (socket) => {
            console.log(`New client connected: ${socket.id}`);
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }
    return ioInstance;
};

exports.getIo = () => {
    if (!ioInstance) {
        throw new Error("Socket.io has not been initialized!");
    }
    return ioInstance;
};

