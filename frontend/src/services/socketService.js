import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
  }

  connect(projectId, userId) {
    this.socket = io('http://localhost:5000');
    this.roomId = projectId;
    
    this.socket.emit('join-project', { projectId, userId });
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  onCodeChange(callback) {
    if (this.socket) {
      this.socket.on('code-change', callback);
    }
  }

  emitCodeChange(newCode) {
    if (this.socket) {
      this.socket.emit('code-change', { 
        roomId: this.roomId, 
        code: newCode 
      });
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
    }
  }
}

export default new SocketService();