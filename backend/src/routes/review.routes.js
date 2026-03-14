import express from "express";
import { submitRideReviews, getRideReviews } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.get("/ride/:rideId", getRideReviews);
reviewRouter.post("/", submitRideReviews);

export default reviewRouter;
