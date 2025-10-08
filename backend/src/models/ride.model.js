import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: [true, "Driver ID is required"],
    },
    driverName: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    driverPhone: {
      type: String,
      required: [true, "Driver phone is required"],
      trim: true,
    },
    origin: {
      type: String,
      required: [true, "Origin is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String, // e.g. "09:30"
      required: [true, "Time is required"],
    },
    genderPreference: {
      type: String,
      enum: ["All", "Male", "Female"],
      default: "All",
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats required"],
      min: 1,
      max: 8,
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats required"],
      min: 0,
    },
    participants: [{
      type: String, // User IDs
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);
