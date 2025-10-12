const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

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
  participantsInfo?: Array<{ _id: string; fullName: string; whatsappNumber: string }>;
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
  userGender?: string;
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

export async function fetchRideSuggestions(filters: RideFilters & { windowMinutes?: number }): Promise<Ride[]> {
  if (!filters.date || !filters.time) {
    throw new Error('date and time are required for suggestions');
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  if (filters.windowMinutes !== undefined) params.append('windowMinutes', String(filters.windowMinutes));
  const urlObj = new URL('/api/rides/suggestions', API_BASE);
  urlObj.search = params.toString();
  const url = urlObj.toString();
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.message || `Failed to fetch suggestions: ${res.status}`;
    console.error('fetchRideSuggestions failed', { url, status: res.status, body });
    throw new Error(msg);
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
    // Try to parse backend error message to show helpful feedback (e.g. gender mismatch)
    const body = await res.json().catch(() => ({}));
    const msg = body?.message || `Failed to join ride: ${res.status}`;
    const err: any = new Error(msg);
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

export async function deleteRide(rideId: string, userId?: string): Promise<void> {
  const url = `${API_BASE}/api/rides/${rideId}${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.message || `Failed to delete ride: ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    throw err;
  }
}

