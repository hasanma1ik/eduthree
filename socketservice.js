import io from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io("http://192.168.0.102:8080", { transports: ["websocket"] });
        console.log("Socket initialized");
        
        // Example global event listener
        socket.on("connect", () => console.log("Connected to Socket.io Server"));
    }
    return socket;
};

export const onNotificationReceived = (callback) => {
    socket.on('newNotification', notification => {
        console.log("Received new notification via socket:", notification);
        callback(notification);
    });
};

export const disconnectSocket = () => {
    if (socket) {
        console.log("Disconnecting socket...");
        socket.disconnect();
        socket = null; // Resets the socket to null after disconnect
    }
};
