// socketService.js
import io from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io("http://192.168.0.101:8080", { transports: ["websocket"] });
        console.log("Socket initialized");
        
        // Example global event listener
        socket.on("connect", () => console.log("Connected to Socket.io Server"));
    }
    return socket;
};

export const initializeSocket = () => {
    getSocket(); // Ensures socket is initialized upon app start
};

export const disconnectSocket = () => {
    if (socket) {
        console.log("Disconnecting socket...");
        socket.disconnect();
        socket = null; // Resets the socket to null after disconnect
    }
};
