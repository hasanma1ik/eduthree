const express = require('express');
const http = require('http'); // Import HTTP module
const socketIo = require('socket.io'); // Import Socket.IO
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const startScheduledTasks = require('./scheduledTasks');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create an HTTP server for Express
const io = socketIo(server); // Attach Socket.IO to the server

// Set up Socket.IO
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get('/api/v1/', (req, res) => {
  res.send('API V1 Home');
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", require("./routes/userRoutes"));
app.use("/api/v1/post", require('./routes/postRoutes'));

const PORT = process.env.PORT || 8080;

// Replace 'app.listen' with 'server.listen'
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgGreen.white);
  startScheduledTasks(io); // Pass the io instance to your scheduled tasks
});
