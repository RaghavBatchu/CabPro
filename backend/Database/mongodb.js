import mongoose from "mongoose";
import { DB_URI } from "../src/config/env.js";

const connectDB = async () => {
  if (!DB_URI) {
    console.error("Missing DB_URI. Please set it in your environment.");
    process.exit(1);
  }
  try {
    await mongoose.connect(DB_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;