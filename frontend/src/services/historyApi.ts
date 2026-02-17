import api from "../api/axiosInstance";
export interface RideHistoryEntry {
  id: string;
  createdBy: string;
  rideType: string;
  origin: string;
  destination: string;
  rideDate: string;
  rideTime: string;
  totalSeats: number;
  availableSeats: number;
  pricingType: string;
  genderPreference: string;
  status: "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface UserHistoryResponse {
  total: number;
  history: RideHistoryEntry[];
}

// GET /api/history/:userId
export const fetchUserHistory = async (
  userId: string
): Promise<UserHistoryResponse> => {
  const res = await api.get(`/history/${userId}`);
  return res.data;
};
