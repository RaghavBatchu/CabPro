import Ride from "../models/ride.model.js";
import User from "../models/user.model.js";

// @desc    Get all rides (with filters)
// @route   GET /api/rides
export const getRides = async (req, res) => {
  try {
    const { origin, destination, date, time, genderPreference, minSeats } = req.query;

    const filter = {};

    if (origin && origin !== "All") filter.origin = origin;
    if (destination && destination !== "All") filter.destination = destination;
    if (date) filter.date = new Date(date);
    if (genderPreference && genderPreference !== "All") filter.genderPreference = genderPreference;
    if (minSeats) filter.availableSeats = { $gte: Number(minSeats) };
    if (time) filter.time = time;

    const rides = await Ride.find(filter).sort({ date: 1, time: 1 });

    // Enrich rides with participant details for leader view on frontend
    const enrichedRides = await Promise.all(
      rides.map(async (ride) => {
        const participants = ride.participants || [];
        const users = participants.length
          ? await User.find({ _id: { $in: participants } }).select(
              "fullName whatsappNumber"
            )
          : [];
        const rideObj = ride.toObject();
        return { ...rideObj, participantsInfo: users };
      })
    );

    res.status(200).json(enrichedRides);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rides", error: error.message });
  }
};

// @desc    Create a new ride
// @route   POST /api/rides
export const createRide = async (req, res) => {
  try {
    const { 
      driverId, 
      driverName, 
      driverPhone, 
      origin, 
      destination, 
      date, 
      time, 
      genderPreference, 
      totalSeats 
    } = req.body;

    if (!driverId || !driverName || !driverPhone || !origin || !destination || !date || !time || !totalSeats) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ride = await Ride.create({
      driverId,
      driverName,
      driverPhone,
      origin,
      destination,
      date,
      time,
      genderPreference: genderPreference || "All",
      totalSeats,
      availableSeats: totalSeats,
      participants: [],
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: "Failed to create ride", error: error.message });
  }
};

// @desc    Get a ride by ID
// @route   GET /api/rides/:id
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    const users = ride.participants.length
      ? await User.find({ _id: { $in: ride.participants } }).select(
          "fullName whatsappNumber"
        )
      : [];
    const rideObj = ride.toObject();
    res.status(200).json({ ...rideObj, participantsInfo: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to get ride", error: error.message });
  }
};

// @desc    Join a ride
// @route   POST /api/rides/:id/join
export const joinRide = async (req, res) => {
  try {
    const { userId } = req.body;
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.availableSeats <= 0) return res.status(400).json({ message: "Ride is full" });
    if (ride.participants.includes(userId)) return res.status(400).json({ message: "Already joined this ride" });
    if (ride.driverId === userId) return res.status(400).json({ message: "Driver cannot join their own ride" });

    ride.participants.push(userId);
    ride.availableSeats -= 1;
    await ride.save();

    const users = ride.participants.length
      ? await User.find({ _id: { $in: ride.participants } }).select(
          "fullName whatsappNumber"
        )
      : [];
    const rideObj = ride.toObject();
    res.status(200).json({ ...rideObj, participantsInfo: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to join ride", error: error.message });
  }
};

// @desc    Leave a ride
// @route   POST /api/rides/:id/leave
export const leaveRide = async (req, res) => {
  try {
    const { userId } = req.body;
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (!ride.participants.includes(userId)) return res.status(400).json({ message: "Not a participant of this ride" });

    ride.participants = ride.participants.filter(id => id !== userId);
    ride.availableSeats += 1;
    await ride.save();

    const users = ride.participants.length
      ? await User.find({ _id: { $in: ride.participants } }).select(
          "fullName whatsappNumber"
        )
      : [];
    const rideObj = ride.toObject();
    res.status(200).json({ ...rideObj, participantsInfo: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to leave ride", error: error.message });
  }
};

// @desc    Delete a ride
// @route   DELETE /api/rides/:id
export const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ride", error: error.message });
  }
};
