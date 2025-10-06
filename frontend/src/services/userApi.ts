const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface UserDto {
  _id: string;
  fullName: string;
  personalEmail: string;
  collegeEmail: string;
  whatsappNumber: string;
  gender: "Male" | "Female" | "Other";
}

export async function fetchUserByEmail(personalEmail: string): Promise<UserDto> {
  const url = `${API_BASE}/api/users/by-email/find?personalEmail=${encodeURIComponent(personalEmail)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err: any = new Error(`Failed to fetch user: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function updateUser(id: string, updates: Partial<UserDto>): Promise<UserDto> {
  const url = `${API_BASE}/api/users/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to update user: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function createUser(payload: {
  fullName: string;
  personalEmail: string;
  collegeEmail: string;
  whatsappNumber: string;
  gender: "Male" | "Female" | "Other";
}): Promise<UserDto> {
  const url = `${API_BASE}/api/users`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const err: any = new Error(`Failed to create user: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}


