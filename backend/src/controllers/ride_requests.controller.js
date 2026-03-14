import { db } from "../../Database/database.js";
import rideRequests from "../models/ride_requests.model.js";
import rides from "../models/ride.model.js";
import users from "../models/user.model.js";

import { eq, and } from "drizzle-orm";

// SEND JOIN REQUEST
export const sendJoinRequest = async (req, res) => {
  const { rideId, userId } = req.body;

  try {
    if (!rideId || !userId) {
      return res.status(400).json({ message: "rideId and userId required" });
    }

    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, rideId));

    if (!ride.length) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride[0].createdBy === userId) {
      return res.status(400).json({ message: "Cannot join your own ride" });
    }

    if (ride[0].status !== "OPEN") {
      return res.status(400).json({ message: "Ride not open for requests" });
    }

    await db.insert(rideRequests).values({
      rideId,
      userId,
    });

    res.status(201).json({ message: "Join request sent successfully" });

  } catch (error) {
    if (error.message.includes("unique_request_per_ride")) {
      return res.status(400).json({ message: "Request already exists" });
    }

    res.status(500).json({ message: error.message });
  }
};


// ACCEPT REQUEST (Leader Only + Seat Decrement)
export const acceptRequest = async (req, res) => {
  const { id } = req.params;
  const { leaderId } = req.body; // send leaderId from frontend

  try {

    await db.transaction(async (tx) => {

      const request = await tx
        .select()
        .from(rideRequests)
        .where(eq(rideRequests.id, id));

      if (!request.length) throw new Error("Request not found");

      if (request[0].status !== "PENDING")
        throw new Error("Request already processed");

      const ride = await tx
        .select()
        .from(rides)
        .where(eq(rides.id, request[0].rideId));

      if (!ride.length) throw new Error("Ride not found");

      // Role check: Only leader can accept
      if (ride[0].createdBy !== leaderId) {
        throw new Error("Only ride leader can accept requests");
      }

      if (ride[0].availableSeats <= 0) {
        throw new Error("No seats available");
      }
      // 🔥 Fetch user gender
      const user = await tx
        .select()
        .from(users)
        .where(eq(users.id, request[0].userId));

      if (!user.length) throw new Error("User not found");

      const userGender = user[0].gender;

      // ✅ Gender enforcement rule
      if (
        ride[0].genderPreference !== "ALL" &&
        ride[0].genderPreference !== userGender
      ) {
        throw new Error("Gender not allowed for this ride");
      }

      // Accept request
      await tx
        .update(rideRequests)
        .set({
          status: "ACCEPTED",
          respondedAt: new Date(),
        })
        .where(eq(rideRequests.id, id));

      const newSeats = ride[0].availableSeats - 1;

      // Decrement seat
      await tx
        .update(rides)
        .set({
          availableSeats: newSeats,
          status: newSeats === 0 ? "FULL" : ride[0].status,
        })
        .where(eq(rides.id, ride[0].id));
    });

    res.status(200).json({ message: "Request accepted" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// REJECT REQUEST (Leader Only)
export const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { leaderId, rejectionReason } = req.body;

  try {

    await db.transaction(async (tx) => {

      const request = await tx
        .select()
        .from(rideRequests)
        .where(eq(rideRequests.id, id));

      if (!request.length) throw new Error("Request not found");

      const ride = await tx
        .select()
        .from(rides)
        .where(eq(rides.id, request[0].rideId));

      if (!ride.length) throw new Error("Ride not found");

      // Role check
      if (ride[0].createdBy !== leaderId) {
        throw new Error("Only ride leader can reject requests");
      }

      await tx
        .update(rideRequests)
        .set({
          status: "REJECTED",
          respondedAt: new Date(),
          rejectionReason: rejectionReason || null
        })
        .where(eq(rideRequests.id, id));
    });

    res.status(200).json({ message: "Request rejected" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// CANCEL REQUEST (User Cancels)
// If ACCEPTED → Seat Re-Increment
export const cancelRequest = async (req, res) => {
  const { id } = req.params;

  try {

    await db.transaction(async (tx) => {

      const request = await tx
        .select()
        .from(rideRequests)
        .where(eq(rideRequests.id, id));

      if (!request.length) throw new Error("Request not found");

      const ride = await tx
        .select()
        .from(rides)
        .where(eq(rides.id, request[0].rideId));

      if (!ride.length) throw new Error("Ride not found");

      // If request was ACCEPTED → increase seat
      if (request[0].status === "ACCEPTED") {

        const newSeats = ride[0].availableSeats + 1;

        await tx
          .update(rides)
          .set({
            availableSeats: newSeats,
            status: "OPEN", // reopen ride if previously FULL
          })
          .where(eq(rides.id, ride[0].id));
      }

      await tx
        .update(rideRequests)
        .set({
          status: "CANCELLED",
          respondedAt: new Date(),
        })
        .where(eq(rideRequests.id, id));
    });

    res.status(200).json({ message: "Request cancelled" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// SUBMIT COMPLETION FEEDBACK
export const submitCompletionFeedback = async (req, res) => {
  const { id } = req.params;
  const { completionStatus, issueDescription } = req.body;

  try {

    if (!completionStatus) {
      return res.status(400).json({ message: "completionStatus required" });
    }

    await db
      .update(rideRequests)
      .set({
        completionStatus,
        issueDescription:
          completionStatus === "ISSUE_REPORTED"
            ? issueDescription || null
            : null,
      })
      .where(eq(rideRequests.id, id));

    res.status(200).json({ message: "Feedback submitted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER REQUESTS
export const getUserRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await db
      .select()
      .from(rideRequests)
      .where(eq(rideRequests.userId, userId));

    res.status(200).json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
