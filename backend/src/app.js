import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";
import rideRouter from "./routes/ride.routes.js";
import rideRequestsRouter from "./routes/ride_requests.routes.js";
import historyRouter from "./routes/history.routes.js";
import connectDB from "../Database/database.js";

const app = express();

// Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
app.use("/api/reviews", reviewRouter);
app.use("/api/rides", rideRouter);
app.use("/api/ride-requests", rideRequestsRouter);
app.use("/api/history", historyRouter);

// Initialize DB connection on import
connectDB();

export default app;


