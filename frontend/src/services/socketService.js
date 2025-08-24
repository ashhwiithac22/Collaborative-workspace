import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.isConnected = false;
    this.eventListeners = new Map(); // Track event listeners for cleanup
  }

  connect(projectId, userId) {
    // Prevent multiple connections
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Clean up existing connection
    this.disconnect();

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      timeout: 10000,
    });
    
    this.roomId = projectId;
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.socket.emit('join-project', { projectId, userId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  onCodeChange(callback) {
    this._addEventListener('code-change', callback);
  }

  emitCodeChange(newCode) {
    if (this.socket && this.isConnected) {
      this.socket.emit('code-change', { 
        roomId: this.roomId, 
        code: newCode 
      });
    }
  }

  onUserJoined(callback) {
    this._addEventListener('user-joined', callback);
  }

  onUserLeft(callback) {
    this._addEventListener('user-left', callback);
  }

  // Helper method to manage event listeners
  _addEventListener(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      // Store for cleanup
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    if (this.socket) {
      for (const [event, callbacks] of this.eventListeners) {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      }
      this.eventListeners.clear();
    }
  }

  disconnect() {
    this.removeAllListeners();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.roomId = null;
    this.isConnected = false;
  }
}

export default new SocketService();