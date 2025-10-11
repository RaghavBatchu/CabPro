const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface HistoryEntry {
  _id: string;
  userId: string;
  rideId: string;
  role: "driver" | "participant";
  origin: string;
  destination: string;
  date: string;
  time: string;
  driverName: string;
  status: "completed" | "cancelled";
  participants: string[];
  participantsInfo?: Array<{ _id: string; fullName: string; whatsappNumber: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface AddToHistoryPayload {
  userId: string;
  rideId: string;
  role: "driver" | "participant";
  status?: "completed" | "cancelled";
}

export async function fetchRideHistory(userId: string): Promise<HistoryEntry[]> {
  const url = `${API_BASE}/api/history/${userId}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err: any = new Error(`Failed to fetch ride history: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function addRideToHistory(payload: AddToHistoryPayload): Promise<HistoryEntry> {
  const url = `${API_BASE}/api/history`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to add ride to history: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function deleteHistoryEntry(historyId: string): Promise<void> {
  const url = `${API_BASE}/api/history/${historyId}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to delete history entry: ${res.status}`);
    err.status = res.status;
    throw err;
  }
}

export async function backfillHistory(userId: string): Promise<{ message: string; entries: HistoryEntry[] }> {
  const url = `${API_BASE}/api/history/backfill/${userId}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to backfill history: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Helper function to check if a ride date has passed
export function isRideDatePassed(date: string): boolean {
  const rideDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  rideDate.setHours(0, 0, 0, 0); // Reset time to start of day
  return rideDate < today;
}

// Helper function to categorize rides
export function categorizeRides(rides: HistoryEntry[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rides.reduce(
    (acc, ride) => {
      const rideDate = new Date(ride.date);
      rideDate.setHours(0, 0, 0, 0);

      if (rideDate < today) {
        acc.past.push(ride);
      } else {
        acc.current.push(ride);
      }
      return acc;
    },
    { current: [] as HistoryEntry[], past: [] as HistoryEntry[] }
  );
}
