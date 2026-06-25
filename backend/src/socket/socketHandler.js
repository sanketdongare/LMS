const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // User joins with their userId
    socket.on('user:join', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`);
        // Broadcast online count
        io.emit('users:online', onlineUsers.size);
        console.log(`👤 User ${userId} joined. Online: ${onlineUsers.size}`);
      }
    });

    // Join admin room
    socket.on('admin:join', () => {
      socket.join('admin');
      console.log(`🛡️  Admin joined room`);
    });

    // Mark notification as read
    socket.on('notification:read', (notificationId) => {
      // Handle server-side if needed
      socket.emit('notification:read:ack', { notificationId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('users:online', onlineUsers.size);
        console.log(`👤 User ${socket.userId} left. Online: ${onlineUsers.size}`);
      }
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io handlers initialized');
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());
const getOnlineCount = () => onlineUsers.size;

module.exports = { initializeSocket, getOnlineUsers, getOnlineCount };
