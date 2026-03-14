import { Router } from "express";
import {
    sendJoinRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    submitCompletionFeedback,
    getUserRequests
} from "../controllers/ride_requests.controller.js";

const rideRequestRouter = Router();

/*RIDE REQUEST ROUTES*/

// Send join request
// POST /api/ride-requests
rideRequestRouter.post("/", sendJoinRequest);

// Get user requests
// GET /api/ride-requests/user/:userId
rideRequestRouter.get("/user/:userId", getUserRequests);

// Accept request (Leader only)
// POST /api/ride-requests/:id/accept
rideRequestRouter.post("/:id/accept", acceptRequest);

// Reject request (Leader only)
// POST /api/ride-requests/:id/reject
rideRequestRouter.post("/:id/reject", rejectRequest);

// Cancel request (User cancels)
// POST /api/ride-requests/:id/cancel
rideRequestRouter.post("/:id/cancel", cancelRequest);

// Submit completion feedback
// POST /api/ride-requests/:id/feedback
rideRequestRouter.post("/:id/feedback", submitCompletionFeedback);

export default rideRequestRouter;
