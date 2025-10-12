import express from "express";
import {
  getRides,
  createRide,
  getRideById,
  joinRide,
  leaveRide,
  deleteRide,
  getRideSuggestions,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.route("/")
  .get(getRides)
  .post(createRide);

// parameterized routes will be defined after the specific routes

// Place specific routes before parameterized routes to avoid route collisions
router.route("/suggestions").get(getRideSuggestions);

router.route("/:id")
  .get(getRideById)
  .delete(deleteRide);

router.route("/:id/join")
  .post(joinRide);

router.route("/:id/leave")
  .post(leaveRide);

export default router;
