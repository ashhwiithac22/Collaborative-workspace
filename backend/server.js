const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
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
    
    socket.to(projectId).emit('user-joined', { userId, socketId: socket.id });
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-change', { code, senderId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
console.log('Server file loaded successfully');
console.log('PORT value:', process.env.PORT);
console.log('MONGODB_URI value:', process.env.MONGODB_URI ? 'Set' : 'Not set');