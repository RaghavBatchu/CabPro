import express from "express";
import { submitRideReviews } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.post("/", submitRideReviews);

export default reviewRouter;
