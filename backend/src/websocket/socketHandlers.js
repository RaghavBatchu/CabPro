import { authenticateSocket } from "./middleware/auth.js";

// Store connected users and their socket IDs
const connectedUsers = new Map(); // userId -> socketId
const socketToUser = new Map(); // socketId -> userId

export const initializeSocketHandlers = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Store user connection
    connectedUsers.set(userId, socket.id);
    socketToUser.set(socket.id, userId);

    // Join user to their personal room for notifications
    socket.join(`user:${userId}`);

    // Handle joining ride rooms
    socket.on("join_ride", (rideId) => {
      socket.join(`ride:${rideId}`);
      console.log(`User ${userId} joined ride room: ${rideId}`);
    });

    // Handle leaving ride rooms
    socket.on("leave_ride", (rideId) => {
      socket.leave(`ride:${rideId}`);
      console.log(`User ${userId} left ride room: ${rideId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
      connectedUsers.delete(userId);
      socketToUser.delete(socket.id);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  // Make io instance available for event emitters
  global.io = io;
};

// Helper functions for broadcasting events
export const broadcastToRide = (rideId, event, data) => {
  if (global.io) {
    global.io.to(`ride:${rideId}`).emit(event, data);
  }
};

export const broadcastToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data);
  }
};

export const broadcastToAll = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
  }
};

// Get connected users count
export const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

// Check if user is connected
export const isUserConnected = (userId) => {
  return connectedUsers.has(userId);
};

// Get socket ID for user
export const getUserSocketId = (userId) => {
  return connectedUsers.get(userId);
};
