import express from "express";
import {
  getRides,
  createRide,
  getRideById,
  joinRide,
  leaveRide,
  deleteRide,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.route("/")
  .get(getRides)
  .post(createRide);

router.route("/:id")
  .get(getRideById)
  .delete(deleteRide);

router.route("/:id/join")
  .post(joinRide);

router.route("/:id/leave")
  .post(leaveRide);

export default router;
