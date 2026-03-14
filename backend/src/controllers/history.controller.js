import { db } from "../../Database/database.js"
import rides from "../models/ride.model.js";
import rideRequests from "../models/ride_requests.model.js";

import { eq, and, inArray } from "drizzle-orm";

// @desc    Get ride history of a user
// @route   GET /api/history/:userId
export const getUserHistory = async (req, res) => {
  const { userId } = req.params;

  try {

    // 1️⃣ Leader history - all rides created by user
    const leaderRides = await db
      .select()
      .from(rides)
      .where(eq(rides.createdBy, userId));

    // 2️⃣ Participant history - all accepted ride requests
    const participantRides = await db
      .select({
        ride: rides,
        requestStatus: rideRequests.status
      })
      .from(rideRequests)
      .innerJoin(rides, eq(rideRequests.rideId, rides.id))
      .where(eq(rideRequests.userId, userId));

    const participantHistory = participantRides.map(r => ({
      ...r.ride,
      myRequestStatus: r.requestStatus
    }));

    // 3️⃣ Merge & sort
    const history = [...leaderRides, ...participantHistory]
      .sort((a, b) =>
        new Date(b.rideDate) - new Date(a.rideDate)
      );

    res.status(200).json({
      total: history.length,
      history
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch history",
      error: error.message
    });
  }
};
