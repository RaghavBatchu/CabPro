import History from "../models/history.model.js";
import Ride from "../models/ride.model.js";
import User from "../models/user.model.js";

// @desc    Get all ride history of a user
// @route   GET /api/history/:userId
export const getRideHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching history for userId:", userId);
    const history = await History.find({ userId })
      .populate("rideId", "origin destination date time driverName participants")
      .sort({ createdAt: -1 });
    console.log("Found history entries:", history.length);

    // Optimize: Get all unique participant IDs first, then do a single query
    const allParticipantIds = [...new Set(
      history.flatMap(entry => entry.participants || [])
    )];
    
    // Single query to get all participants
    const allParticipants = allParticipantIds.length > 0 
      ? await User.find({ _id: { $in: allParticipantIds } }).select("fullName whatsappNumber")
      : [];
    
    // Create a map for O(1) lookup
    const participantMap = new Map();
    allParticipants.forEach(participant => {
      participantMap.set(participant._id.toString(), participant);
    });

    // Enrich history entries with participant details
    const enrichedHistory = history.map(entry => {
      if (entry.participants && entry.participants.length > 0) {
        const participantsInfo = entry.participants
          .map(id => participantMap.get(id.toString()))
          .filter(Boolean);
        const entryObj = entry.toObject();
        return { ...entryObj, participantsInfo };
      }
      return entry;
    });

    // Auto-mark past rides as completed
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const updatePromises = enrichedHistory.map(async (entry) => {
      const rideDate = new Date(entry.date);
      rideDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // If the ride date has passed and status is not already cancelled, mark as completed
      if (rideDate < today && entry.status !== "cancelled") {
        return History.findByIdAndUpdate(
          entry._id,
          { status: "completed" },
          { new: true }
        );
      }
      return entry;
    });

    const updatedHistory = await Promise.all(updatePromises);

    res.status(200).json(updatedHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ride history", error: error.message });
  }
};

// @desc    Add a ride to history (driver or participant)
// @route   POST /api/history
export const addRideToHistory = async (req, res) => {
  try {
    const { userId, rideId, role, status } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const existingEntry = await History.findOne({ userId, rideId });
    if (existingEntry) {
      return res.status(400).json({ message: "Ride already exists in history" });
    }

    const history = await History.create({
      userId,
      rideId,
      role,
      origin: ride.origin,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      driverName: ride.driverName,
      status: status || "completed",
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to add ride to history", error: error.message });
  }
};

// @desc    Delete a specific history entry
// @route   DELETE /api/history/:id
export const deleteHistory = async (req, res) => {
  try {
    const deleted = await History.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "History not found" });
    res.status(200).json({ message: "History entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete history entry", error: error.message });
  }
};

// @desc    Backfill history for existing rides
// @route   POST /api/history/backfill/:userId
export const backfillHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all rides where user is driver
    const driverRides = await Ride.find({ driverId: userId });
    
    // Find all rides where user is participant
    const participantRides = await Ride.find({ participants: userId });
    
    const historyEntries = [];
    
    // Add driver rides to history
    for (const ride of driverRides) {
      const existingEntry = await History.findOne({ userId, rideId: ride._id });
      if (!existingEntry) {
        const historyEntry = await History.create({
          userId,
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
        historyEntries.push(historyEntry);
      }
    }
    
    // Add participant rides to history
    for (const ride of participantRides) {
      const existingEntry = await History.findOne({ userId, rideId: ride._id });
      if (!existingEntry) {
        const historyEntry = await History.create({
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
        historyEntries.push(historyEntry);
      }
    }
    
    res.status(200).json({ 
      message: `Backfilled ${historyEntries.length} history entries`,
      entries: historyEntries 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to backfill history", error: error.message });
  }
};