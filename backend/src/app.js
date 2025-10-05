import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import connectDB from "../Database/mongodb.js";

const app = express();

// Middlewares
app.use(cors());
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


