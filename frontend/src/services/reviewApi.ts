const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  average: string;
  total: number;
  reviews: Review[];
}

export async function fetchReviews(): Promise<ReviewResponse> {
  const url = `${API_BASE}/api/reviews`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err: any = new Error(`Failed to fetch reviews: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function createReview(payload: {
  name: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const url = `${API_BASE}/api/reviews`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to create review: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

