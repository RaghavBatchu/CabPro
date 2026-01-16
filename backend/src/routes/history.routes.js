import express from "express";
import {
  getRideHistory,
  addRideToHistory,
  deleteHistory,
  backfillHistory,
  markRideCompleted,
  reportRideIssue,
} from "../controllers/history.controller.js";

const router = express.Router();

// Add a new history record
router.post("/", addRideToHistory);

// Mark ride as completed safely (must be before /:userId route)
router.patch("/:id/complete", markRideCompleted);

// Report issue with ride (must be before /:userId route)
router.patch("/:id/report-issue", reportRideIssue);

// Backfill history for existing rides (must be before /:userId route)
router.post("/backfill/:userId", backfillHistory);

// Get all history for a user (must be last)
router.get("/:userId", getRideHistory);

// Delete a history record
router.delete("/:id", deleteHistory);

export default router;
