import api from "../api/axiosInstance";

// Types
export interface Ride {
  id: string;
  createdBy: string;
  rideType: string;
  origin: string;
  destination: string;
  rideDate: string;
  rideTime: string;
  timeMinutes: number;
  totalSeats: number;
  availableSeats: number;
  pricingType: string;
  pricePerHead?: number;
  basePrice?: number;
  pricePerKm?: number;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  genderPreference: "ALL" | "MALE" | "FEMALE";
  status: "OPEN" | "FULL" | "STARTED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  leaderName?: string;
  leaderRating?: string | number;
  leaderTotalReviews?: number;
  leaderPhone?: string;
}

export interface CreateRidePayload {
  createdBy: string;
  rideType: "CAR" | "BIKE" | "AUTO" | "TEMPO";
  origin: string;
  destination: string;
  rideDate: string;
  rideTime: string;
  totalSeats: number;
  pricingType: string;
  pricePerHead?: number;
  basePrice?: number;
  pricePerKm?: number;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  genderPreference?: "ALL" | "MALE" | "FEMALE";
}

export interface RideFilters {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  flexible?: "exact" | "30m" | "1h";
  minSeats?: number;
  userGender?: string;
}

// Get rides (with filters)
// GET /api/rides
export const fetchRides = async (
  filters?: RideFilters
): Promise<Ride[]> => {
  const res = await api.get("/rides", {
    params: filters,
  });

  return res.data;
};

// Get ride by ID
// GET /api/rides/:id
export const fetchRideById = async (
  id: string
): Promise<any> => {
  const res = await api.get(`/rides/${id}`);
  return res.data;
};

// Create ride
// POST /api/rides
export const createRide = async (
  payload: CreateRidePayload
): Promise<Ride> => {
  const res = await api.post("/rides", payload);
  return res.data;
};

// Start ride (Leader only)
// POST /api/rides/:id/start
export const startRide = async (
  rideId: string,
  leaderId: string
): Promise<{ message: string }> => {
  const res = await api.post(`/rides/${rideId}/start`, {
    leaderId,
  });

  return res.data;
};

// Complete ride (Leader only)
// POST /api/rides/:id/complete
export const completeRide = async (
  rideId: string,
  leaderId: string
): Promise<{ message: string }> => {
  const res = await api.post(`/rides/${rideId}/complete`, {
    leaderId,
  });

  return res.data;
};

// Cancel ride (Leader only)
// DELETE /api/rides/:id
export const cancelRide = async (
  rideId: string,
  leaderId: string
): Promise<{ message: string }> => {
  const res = await api.delete(`/rides/${rideId}`, {
    data: { leaderId }, // send leaderId in body
  });

  return res.data;
};

