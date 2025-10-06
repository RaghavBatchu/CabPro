import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import connectDB from "../Database/mongodb.js";

const app = express();

// Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/users", userRouter);

// Initialize DB connection on import
connectDB();

export default app;


