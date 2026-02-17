import { Router } from "express";
import {
  createRide,
  getRides,
  getRideById,
  startRide,
  completeRide,
  cancelRide
} from "../controllers/ride.controller.js";

const rideRouter = Router();

/*READ ROUTES*/

// GET all rides (with filters)
// GET /api/rides
rideRouter.get("/", getRides);

// GET ride by ID
// GET /api/rides/:id
rideRouter.get("/:id", getRideById);


/*WRITE ROUTES*/

// Create ride
// POST /api/rides
rideRouter.post("/", createRide);

// Start ride (Leader only)
// POST /api/rides/:id/start
rideRouter.post("/:id/start", startRide);

// Complete ride (Leader only)
// POST /api/rides/:id/complete
rideRouter.post("/:id/complete", completeRide);

// Cancel ride (Leader only)
// POST /api/rides/:id/cancel
rideRouter.post("/:id/cancel", cancelRide);

export default rideRouter;
