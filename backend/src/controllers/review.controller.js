import { db } from "../../Database/database.js"
import reviews from "../models/review.model.js";
import rides from "../models/ride.model.js";
import rideRequests from "../models/ride_requests.model.js";
import users from "../models/user.model.js";
import rideReviews from "../models/ride_review.model.js";

import { eq, and, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const getRideReviews = async (req, res) => {
  const { rideId } = req.params;

  try {
    const reviewer = alias(users, "reviewer");
    const reviewed = alias(users, "reviewed");

    // 1. User Reviews
    const userReviewsList = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        reviewerName: reviewer.fullName,
        reviewedName: reviewed.fullName,
        reviewerId: reviewer.id,
        reviewedId: reviewed.id
      })
      .from(reviews)
      .innerJoin(reviewer, eq(reviews.reviewerId, reviewer.id))
      .innerJoin(reviewed, eq(reviews.reviewedUserId, reviewed.id))
      .where(eq(reviews.rideId, rideId));

    // 2. Ride Reviews
    const rideReviewsList = await db
      .select({
        id: rideReviews.id,
        rating: rideReviews.rating,
        comment: rideReviews.comment,
        createdAt: rideReviews.createdAt,
        reviewerName: users.fullName,
        reviewerId: users.id
      })
      .from(rideReviews)
      .innerJoin(users, eq(rideReviews.reviewerId, users.id))
      .where(eq(rideReviews.rideId, rideId));

    res.status(200).json({
      userReviews: userReviewsList,
      rideReviews: rideReviewsList
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitRideReviews = async (req, res) => {
  const { rideId, reviewerId, reviews: reviewList, rideReview } = req.body;

  try {
    if (!rideId || !reviewerId) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    await db.transaction(async (tx) => {

      // 1️⃣ Check ride exists
      const ride = await tx
        .select()
        .from(rides)
        .where(eq(rides.id, rideId));

      if (!ride.length) {
        throw new Error("Ride not found");
      }

      // 2️⃣ Verify reviewer relation to ride
      const userReqs = await tx
        .select()
        .from(rideRequests)
        .where(
          and(
            eq(rideRequests.rideId, rideId),
            eq(rideRequests.userId, reviewerId)
          )
        );
      const myRequest = userReqs[0];
      const myStatus = myRequest?.status;

      const isLeader = ride[0].createdBy === reviewerId;
      const isRideFinalized = ["COMPLETED", "CANCELLED"].includes(ride[0].status);

      let canReview = false;

      if (isLeader) {
        if (isRideFinalized) canReview = true;
      } else {
        // Participant Logic
        if (myStatus === "ACCEPTED" && isRideFinalized) canReview = true;
        else if (myStatus === "REJECTED") canReview = true;
        else if (myStatus === "CANCELLED") canReview = true;
        else if (ride[0].status === "CANCELLED" && myRequest) canReview = true;
      }

      if (!canReview) {
        throw new Error("You are not eligible to review this ride at this time.");
      }

      // 3️⃣ Process each review (User Reviews)
      if (reviewList && reviewList.length) {
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

          // 4️⃣ Verify reviewed user participated (Leader, Accepted, or Cancelled/Left)
          const reviewedParticipated =
            ride[0].createdBy === reviewedUserId ||
            (await tx
              .select()
              .from(rideRequests)
              .where(
                and(
                  eq(rideRequests.rideId, rideId),
                  eq(rideRequests.userId, reviewedUserId),
                  inArray(rideRequests.status, ["ACCEPTED", "CANCELLED"])
                )
              )).length > 0;

          if (!reviewedParticipated) {
            // If they were rejected, maybe we generally don't review them?
            // Unless we want to review a spammy requester? 
            // Current logic: Only Accepted/Left users.
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
      }

      // 7️⃣ Process Ride Review (Optional but requested)
      if (rideReview) {
        const { rating, comment } = rideReview;

        if (!rating || rating < 1 || rating > 5) {
          throw new Error("Ride rating must be between 1 and 5");
        }

        // Check if already reviewed? (Unique constraint handles it, but let catch specific error)
        // Insert
        await tx.insert(rideReviews).values({
          rideId,
          reviewerId,
          rating,
          comment
        });
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
