import { db } from "../../Database/database.js"
import reviews from "../models/review.model.js";
import rides from "../models/ride.model.js";
import rideRequests from "../models/ride_requests.model.js";
import users from "../models/user.model.js";

import { eq, and } from "drizzle-orm";

export const submitRideReviews = async (req, res) => {
  const { rideId, reviewerId, reviews: reviewList } = req.body;

  try {
    if (!rideId || !reviewerId || !reviewList || !reviewList.length) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    await db.transaction(async (tx) => {

      // 1️⃣ Check ride exists and is completed
      const ride = await tx
        .select()
        .from(rides)
        .where(eq(rides.id, rideId));

      if (!ride.length || ride[0].status !== "COMPLETED") {
        throw new Error("Ride is not completed");
      }

      // 2️⃣ Verify reviewer participated
      const reviewerParticipated =
        ride[0].createdBy === reviewerId ||
        (await tx
          .select()
          .from(rideRequests)
          .where(
            and(
              eq(rideRequests.rideId, rideId),
              eq(rideRequests.userId, reviewerId),
              eq(rideRequests.status, "ACCEPTED")
            )
          )).length > 0;

      if (!reviewerParticipated) {
        throw new Error("You did not participate in this ride");
      }

      // 3️⃣ Process each review
      for (const item of reviewList) {

        const { reviewedUserId, rating, comment } = item;

        if (!reviewedUserId || !rating) {
          throw new Error("Invalid review entry");
        }

        if (reviewedUserId === reviewerId) {
          throw new Error("You cannot review yourself");
        }

        if (rating < 1 || rating > 5) {
          throw new Error("Rating must be between 1 and 5");
        }

        // 4️⃣ Verify reviewed user participated
        const reviewedParticipated =
          ride[0].createdBy === reviewedUserId ||
          (await tx
            .select()
            .from(rideRequests)
            .where(
              and(
                eq(rideRequests.rideId, rideId),
                eq(rideRequests.userId, reviewedUserId),
                eq(rideRequests.status, "ACCEPTED")
              )
            )).length > 0;

        if (!reviewedParticipated) {
          throw new Error("User was not part of this ride");
        }

        // 5️⃣ Insert review (unique constraint prevents duplicate)
        await tx.insert(reviews).values({
          rideId,
          reviewerId,
          reviewedUserId,
          rating,
          comment,
        });

        // 6️⃣ Update user rating aggregation
        const user = await tx
          .select()
          .from(users)
          .where(eq(users.id, reviewedUserId));

        const oldAvg = Number(user[0].averageRating || 0);
        const oldCount = Number(user[0].totalReviews || 0);

        const newAvg =
          (oldAvg * oldCount + rating) / (oldCount + 1);

        await tx
          .update(users)
          .set({
            averageRating: newAvg,
            totalReviews: oldCount + 1,
          })
          .where(eq(users.id, reviewedUserId));
      }
    });

    res.status(201).json({ message: "Reviews submitted successfully" });

  } catch (error) {

    if (error.message.includes("unique_review_per_ride")) {
      return res.status(400).json({
        message: "You already reviewed this user for this ride"
      });
    }

    res.status(500).json({ message: error.message });
  }
};
