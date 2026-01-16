import express from "express";
import { getReviews, createReview, getIssueReports, reportIssue } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/issues", getIssueReports);
router.post("/", createReview);
router.post("/report-issue", reportIssue);

export default router;
