// Simple authentication middleware for WebSocket connections
// In a production environment, you might want to verify JWT tokens or use Clerk authentication

export const authenticateSocket = async (socket, next) => {
  try {
    // For now, we'll accept any connection and assign a temporary user ID
    // In production, you should verify the authentication token here
    
    // Get user ID from handshake auth or query params
    const userId = socket.handshake.auth?.userId || 
                   socket.handshake.query?.userId || 
                   `temp_user_${socket.id}`;

    if (!userId) {
      return next(new Error("Authentication failed: No user ID provided"));
    }

    // Attach user ID to socket for use in handlers
    socket.userId = userId;
    
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
};
