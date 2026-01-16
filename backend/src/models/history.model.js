import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: String, // same as your Ride model (user IDs are stored as string)
      required: true,
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    role: {
      type: String,
      enum: ["driver", "participant"],
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
    },
    completionStatus: {
      type: String,
      enum: ["pending", "completed_safely", "issue_reported"],
      default: "pending",
    },
    issueDescription: {
      type: String,
      default: null,
    },
    issueReportedAt: {
      type: Date,
      default: null,
    },
    participants: {
      type: [String], // Array of participant user IDs
      default: [],
    },
    participantsInfo: {
      type: [{
        _id: String,
        fullName: String,
        whatsappNumber: String
      }],
      default: [],
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
historySchema.index({ userId: 1 });
historySchema.index({ rideId: 1 });
historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ participants: 1 });

export default mongoose.model("History", historySchema);
