import express from "express";
import {
  getRideHistory,
  addRideToHistory,
  deleteHistory,
  backfillHistory,
} from "../controllers/history.controller.js";

const router = express.Router();

// Get all history for a user
router.get("/:userId", getRideHistory);

// Add a new history record
router.post("/", addRideToHistory);

// Delete a history record
router.delete("/:id", deleteHistory);

// Backfill history for existing rides
router.post("/backfill/:userId", backfillHistory);

export default router;
