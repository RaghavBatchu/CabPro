import { db } from "../../Database/database.js"
import rides from "../models/ride.model.js";
import rideRequests from "../models/ride_requests.model.js";
import users from "../models/user.model.js";

import { eq, and, inArray, sql, lt, or } from "drizzle-orm";

// POST /api/rides
export const createRide = async (req, res) => {
  try {
    const {
      createdBy,
      rideType,
      origin,
      destination,
      rideDate,
      rideTime,
      totalSeats,
      pricingType,
      pricePerHead,
      basePrice,
      pricePerKm,
      estimatedDistanceKm,
      estimatedDurationMin,
      genderPreference
    } = req.body;

    if (!createdBy || !rideType || !origin || !destination || !rideDate || !rideTime || !totalSeats || !pricingType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [h, m] = rideTime.split(":").map(Number);
    const timeMinutes = h * 60 + (m || 0);

    const ride = await db.insert(rides).values({
      createdBy,
      rideType,
      origin,
      destination,
      rideDate: new Date(rideDate),
      rideTime,
      timeMinutes,
      totalSeats,
      availableSeats: totalSeats,
      pricingType,
      pricePerHead,
      basePrice,
      pricePerKm,
      estimatedDistanceKm,
      estimatedDurationMin,
      genderPreference: genderPreference || "ALL",
      status: "OPEN"
    }).returning();

    res.status(201).json(ride[0]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/rides
export const getRides = async (req, res) => {
  try {
    // Auto-mark past rides as COMPLETED
    const now = new Date();
    // Use UTC date to match how dates are typically stored from frontend
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    await db.update(rides)
      .set({ status: "COMPLETED" })
      .where(
        and(
          inArray(rides.status, ["OPEN", "FULL"]),
          or(
            lt(rides.rideDate, today),
            and(eq(rides.rideDate, today), lt(rides.timeMinutes, nowMinutes))
          )
        )
      );

    const {
      origin,
      destination,
      date,
      time,
      flexible = "exact", // exact | 30m | 1h
      minSeats,
      userGender
    } = req.query;

    const conditions = [];

    if (origin) conditions.push(eq(rides.origin, origin));
    if (destination) conditions.push(eq(rides.destination, destination));
    if (date) conditions.push(eq(rides.rideDate, new Date(date)));
    if (minSeats) conditions.push(sql`${rides.availableSeats} >= ${Number(minSeats)}`);
    if (userGender) {
      conditions.push(
        sql`(${rides.genderPreference} = 'ALL' OR ${rides.genderPreference} = ${userGender})`
      );
    }

    if (time) {
      const [h, m] = time.split(":").map(Number);
      const requestedMinutes = h * 60 + (m || 0);

      let window = 0;
      if (flexible === "30m") window = 30;
      if (flexible === "1h") window = 60;

      if (window === 0) {
        conditions.push(eq(rides.timeMinutes, requestedMinutes));
      } else {
        conditions.push(
          sql`ABS(${rides.timeMinutes} - ${requestedMinutes}) <= ${window}`
        );
      }
    }

    conditions.push(inArray(rides.status, ["OPEN", "FULL"]));

    const result = await db
      .select({
        ...rides,
        leaderName: users.fullName,
        leaderRating: users.averageRating,
        leaderTotalReviews: users.totalReviews
      })
      .from(rides)
      .innerJoin(users, eq(rides.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(rides.rideDate, rides.timeMinutes);

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/rides/:id
export const getRideById = async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await db
      .select({
        ...rides,
        leaderName: users.fullName,
        leaderPhone: users.whatsappNumber,
        leaderRating: users.averageRating,
        leaderTotalReviews: users.totalReviews
      })
      .from(rides)
      .innerJoin(users, eq(rides.createdBy, users.id))
      .where(eq(rides.id, id));

    if (!ride.length) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const participants = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        personalEmail: users.personalEmail,
        whatsappNumber: users.whatsappNumber,
        gender: users.gender,
        averageRating: users.averageRating,
        totalReviews: users.totalReviews,
        status: rideRequests.status,
        requestId: rideRequests.id
      })
      .from(rideRequests)
      .innerJoin(users, eq(rideRequests.userId, users.id))
      .where(eq(rideRequests.rideId, id));

    res.status(200).json({
      ...ride[0],
      participants
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rides/:id/start
export const startRide = async (req, res) => {
  const { id } = req.params;
  const { leaderId } = req.body;

  try {
    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, id));

    if (!ride.length) return res.status(404).json({ message: "Ride not found" });

    if (ride[0].createdBy !== leaderId) {
      return res.status(403).json({ message: "Only leader can start ride" });
    }

    if (ride[0].status === "CANCELLED") {
      return res.status(400).json({ message: "Ride is cancelled" });
    }

    await db.update(rides)
      .set({ status: "STARTED" })
      .where(eq(rides.id, id));

    res.status(200).json({ message: "Ride started" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rides/:id/complete
export const completeRide = async (req, res) => {
  const { id } = req.params;
  const { leaderId } = req.body;

  try {
    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, id));

    if (!ride.length) return res.status(404).json({ message: "Ride not found" });

    if (ride[0].createdBy !== leaderId) {
      return res.status(403).json({ message: "Only leader can complete ride" });
    }

    await db.update(rides)
      .set({ status: "COMPLETED" })
      .where(eq(rides.id, id));

    res.status(200).json({ message: "Ride completed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/rides/:id
export const cancelRide = async (req, res) => {
  const { id } = req.params;
  const { leaderId } = req.body;

  try {
    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, id));

    if (!ride.length) return res.status(404).json({ message: "Ride not found" });

    if (ride[0].createdBy !== leaderId) {
      return res.status(403).json({ message: "Only leader can cancel ride" });
    }

    await db.update(rides)
      .set({ status: "CANCELLED" })
      .where(eq(rides.id, id));

    res.status(200).json({ message: "Ride cancelled" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
