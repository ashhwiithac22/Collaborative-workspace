const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // Add this import
const socketIo = require('socket.io'); // Add this import
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, { // Initialize Socket.IO
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-workspace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-project', ({ projectId, userId }) => {
    socket.join(projectId);
    console.log(`User ${userId} joined project ${projectId}`);
    
    // Notify others in the room
    socket.to(projectId).emit('user-joined', { userId, socketId: socket.id });
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-change', { code, senderId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify others that user left (we'll implement this later)
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server with server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});