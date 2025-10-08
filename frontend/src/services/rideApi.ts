const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface Ride {
  _id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  genderPreference: "All" | "Male" | "Female";
  totalSeats: number;
  availableSeats: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRidePayload {
  driverId: string;
  driverName: string;
  driverPhone: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  genderPreference?: "All" | "Male" | "Female";
  totalSeats: number;
}

export interface RideFilters {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  genderPreference?: string;
  minSeats?: number;
}

export async function fetchRides(filters?: RideFilters): Promise<Ride[]> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "All") {
        params.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/api/rides${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err: any = new Error(`Failed to fetch rides: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function createRide(payload: CreateRidePayload): Promise<Ride> {
  const url = `${API_BASE}/api/rides`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to create ride: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function getRideById(id: string): Promise<Ride> {
  const url = `${API_BASE}/api/rides/${id}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err: any = new Error(`Failed to fetch ride: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function joinRide(rideId: string, userId: string): Promise<Ride> {
  const url = `${API_BASE}/api/rides/${rideId}/join`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to join ride: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function leaveRide(rideId: string, userId: string): Promise<Ride> {
  const url = `${API_BASE}/api/rides/${rideId}/leave`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to leave ride: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function deleteRide(rideId: string): Promise<void> {
  const url = `${API_BASE}/api/rides/${rideId}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to delete ride: ${res.status}`);
    err.status = res.status;
    throw err;
  }
}

