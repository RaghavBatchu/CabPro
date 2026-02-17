import api from "../api/axiosInstance";

// Types
export interface SendJoinRequestPayload {
    rideId: string;
    userId: string;
}

export interface AcceptRejectPayload {
    leaderId: string;
}

export interface CompletionFeedbackPayload {
    completionStatus: "PENDING" | "COMPLETED" | "COMPLETED_SAFELY" | "ISSUE_REPORTED";
    issueDescription?: string;
}

export interface BasicResponse {
    message: string;
}

// Send Join Request
// POST /api/ride-requests
export const sendJoinRequest = async (
    payload: SendJoinRequestPayload
): Promise<BasicResponse> => {
    const res = await api.post("/ride-requests", payload);
    return res.data;
};

// Accept Request (Leader Only)
// POST /api/ride-requests/:id/accept
export const acceptRideRequest = async (
    requestId: string,
    payload: AcceptRejectPayload
): Promise<BasicResponse> => {
    const res = await api.post(`/ride-requests/${requestId}/accept`, payload);
    return res.data;
};

// Reject Request (Leader Only)
// POST /api/ride-requests/:id/reject
export const rejectRideRequest = async (
    requestId: string,
    payload: AcceptRejectPayload
): Promise<BasicResponse> => {
    const res = await api.post(`/ride-requests/${requestId}/reject`, payload);
    return res.data;
};

// Cancel Request (User Cancels)
// POST /api/ride-requests/:id/cancel
export const cancelRideRequest = async (
    requestId: string
): Promise<BasicResponse> => {
    const res = await api.post(`/ride-requests/${requestId}/cancel`);
    return res.data;
};

// Submit Completion Feedback
// POST /api/ride-requests/:id/feedback
export const submitCompletionFeedback = async (
    requestId: string,
    payload: CompletionFeedbackPayload
): Promise<BasicResponse> => {
    const res = await api.post(`/ride-requests/${requestId}/feedback`, payload);
    return res.data;
};
// Get User Requests
// GET /api/ride-requests/user/:userId
export const fetchUserRequests = async (
    userId: string
): Promise<any[]> => {
    const res = await api.get(`/ride-requests/user/${userId}`);
    return res.data;
};
