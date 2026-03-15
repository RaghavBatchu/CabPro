import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import app from "./src/app.js";
import { initializeSocketHandlers } from "./src/websocket/socketHandlers.js";

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5174",
        ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Initialize WebSocket handlers
initializeSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});
