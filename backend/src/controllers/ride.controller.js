import Ride from "../models/ride.model.js";
import User from "../models/user.model.js";
import History from "../models/history.model.js";

// Simple in-memory cache for user data
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Simple rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 1000; // max requests per minute per IP (increased for development)

const getCachedUser = async (userId) => {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const user = await User.findById(userId).select("fullName whatsappNumber gender");
  if (user) {
    userCache.set(userId, { data: user, timestamp: Date.now() });
  }
  return user;
};

// @desc    Get all rides (with filters)
// @route   GET /api/rides
export const getRides = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Rate limiting disabled for development
    // TODO: Re-enable in production with proper configuration
    
    const { origin, destination, date, time, genderPreference, minSeats, userGender } = req.query;

    const filter = {};

    if (origin && origin !== "All") filter.origin = origin;
    if (destination && destination !== "All") filter.destination = destination;
    if (date) filter.date = new Date(date);
    if (genderPreference && genderPreference !== "All") filter.genderPreference = genderPreference;
    if (minSeats) filter.availableSeats = { $gte: Number(minSeats) };
    if (time) filter.time = time;

    const rides = await Ride.find(filter).sort({ date: 1, time: 1 });

    // Filter rides based on gender preference compatibility
    let filteredRides = rides;
    if (userGender) {
      filteredRides = rides.filter(ride => {
        // If ride genderPreference is "All", show to everyone
        if (ride.genderPreference === "All") return true;
        
        // If ride genderPreference matches user gender, show the ride
        if (ride.genderPreference === userGender) return true;
        
        // Otherwise, don't show the ride
        return false;
      });
    }

    // Optimize: Get all unique participant IDs first, then do a single query
    const allParticipantIds = [...new Set(
      filteredRides.flatMap(ride => ride.participants || [])
    )];
    
    // Single query to get all participants (with caching)
    const allParticipants = allParticipantIds.length > 0 
      ? await User.find({ _id: { $in: allParticipantIds } }).select("fullName whatsappNumber gender")
      : [];
    
    // Create a map for O(1) lookup
    const participantMap = new Map();
    allParticipants.forEach(participant => {
      participantMap.set(participant._id.toString(), participant);
    });

    // Enrich rides with participant details
    const enrichedRides = filteredRides.map(ride => {
      const participants = ride.participants || [];
      const participantsInfo = participants.map(id => participantMap.get(id.toString())).filter(Boolean);
      const rideObj = ride.toObject();
      return { ...rideObj, participantsInfo };
    });

    const endTime = Date.now();
    console.log(`getRides took ${endTime - startTime}ms for ${enrichedRides.length} rides`);
    
    res.status(200).json(enrichedRides);
  } catch (error) {
    console.error("getRides error:", error);
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

    // Add to history for the driver
    try {
      await History.create({
        userId: driverId,
        rideId: ride._id,
        role: "driver",
        origin: ride.origin,
        destination: ride.destination,
        date: ride.date,
        time: ride.time,
        driverName: ride.driverName,
        participants: ride.participants,
        status: "completed", // Will be auto-updated based on date
      });
    } catch (historyError) {
      console.error("Failed to add ride to history:", historyError);
      // Don't fail the create operation if history fails
    }

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

    // Check gender compatibility
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // If ride has gender preference other than "All", check compatibility
    if (ride.genderPreference !== "All" && ride.genderPreference !== user.gender) {
      return res.status(400).json({ 
        message: `This ride is only for ${ride.genderPreference} participants. You are ${user.gender}.` 
      });
    }

    ride.participants.push(userId);
    ride.availableSeats -= 1;
    await ride.save();

    // Add to history for the participant
    try {
      const existingHistory = await History.findOne({ userId, rideId: ride._id });
      if (!existingHistory) {
        await History.create({
          userId,
          rideId: ride._id,
          role: "participant",
          origin: ride.origin,
          destination: ride.destination,
          date: ride.date,
          time: ride.time,
          driverName: ride.driverName,
          participants: ride.participants,
          status: "completed", // Will be auto-updated based on date
        });
      }
    } catch (historyError) {
      console.error("Failed to add ride to history:", historyError);
      // Don't fail the join operation if history fails
    }

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

    // Remove from history or mark as cancelled
    try {
      await History.findOneAndDelete({ userId, rideId: ride._id });
    } catch (historyError) {
      console.error("Failed to remove ride from history:", historyError);
      // Don't fail the leave operation if history fails
    }

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
    // Only allow the ride driver (leader) to delete/cancel the ride
    const requestingUserId = req.query.userId;
    if (!requestingUserId) {
      return res.status(400).json({ message: "Missing userId in query" });
    }

    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.driverId !== String(requestingUserId)) {
      return res.status(403).json({ message: "Only the ride leader can cancel this ride" });
    }

    // Delete the ride now
    await Ride.findByIdAndDelete(req.params.id);

    // Mark all history entries for this ride as cancelled
    try {
      await History.updateMany(
        { rideId: ride._id },
        { status: "cancelled" }
      );
    } catch (historyError) {
      console.error("Failed to update history for deleted ride:", historyError);
      // Don't fail the delete operation if history fails
    }

    res.status(200).json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ride", error: error.message });
  }
};
