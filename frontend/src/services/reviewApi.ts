import api from "../api/axiosInstance";

/* Types*/

export interface RideReviewPayload {
  rideId: string;
  reviewerId: string;
  reviews: {
    reviewedUserId: string;
    rating: number;       // 1 - 5
    comment?: string;
  }[];
  rideReview?: {
    rating: number;
    comment?: string;
  };
}

export interface RideReviewResponse {
  message: string;
}


// POST /api/reviews
export const submitRideReviews = async (
  payload: RideReviewPayload
): Promise<RideReviewResponse> => {
  const res = await api.post("/reviews", payload);
  return res.data;
};

export const getRideReviews = async (rideId: string) => {
  const res = await api.get(`/reviews/ride/${rideId}`);
  return res.data;
};
