import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please provide your full name"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [100, "Name must be at most 100 characters"],
  },
  personalEmail: {
    type: String,
    required: [true, "Please provide your personal email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  collegeEmail: {
    type: String,
    required: [true, "Please provide your college email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid college email address"],
  },
  whatsappNumber: {
    type: String,
    required: [true, "Please provide your WhatsApp number"],
    match: [/^\d{10,15}$/, "Please enter a valid WhatsApp number"],
  },
  gender: {
    type: String,
    required: [true, "Please specify your gender"],
    enum: ["Male", "Female", "Other"],
  },
}, { timestamps: true });

// model name should be singular and capitalized
const User = mongoose.model("User", userSchema);

export default User;
