import express from "express";
import nodemailer from "nodemailer";
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
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "https://cab-pro.vercel.app",
      ],
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

// Test email endpoint
app.get("/api/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"CabPro Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email from Render",
      text: "If you are reading this, the deployed mail service is working!",
    });

    res.status(200).json({ 
      success: true, 
      message: "Test email sent successfully", 
      messageId: info.messageId,
      env: {
        user: process.env.EMAIL_USER ? "Set" : "Not Set",
        pass: process.env.EMAIL_PASS ? "Set" : "Not Set"
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message, 
      stack: error.stack,
      env: {
        user: process.env.EMAIL_USER ? "Set" : "Not Set",
        pass: process.env.EMAIL_PASS ? "Set" : "Not Set"
      }
    });
  }
});

// Initialize DB connection on import
connectDB();

export default app;
