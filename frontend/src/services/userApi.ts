import api from "../api/axiosInstance";

export interface UserDto {
  id: string;
  fullName: string;
  personalEmail: string;
  collegeEmail: string;
  whatsappNumber: string;
  gender: "Male" | "Female" | "Other";
  averageRating?: number;
  totalReviews?: number;
}


// GET all users
export const fetchUsers = async (): Promise<UserDto[]> => {
  const res = await api.get("/users");
  return res.data;
};


// GET user by ID
export const fetchUserById = async (id: string): Promise<UserDto> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};


// GET user by email
export const fetchUserByEmail = async (personalEmail: string): Promise<UserDto> => {
  const res = await api.get("/users/by-email", {
    params: { personalEmail },
  });
  return res.data;
};


// Check user exists
export const checkUserExists = async (personalEmail: string): Promise<boolean> => {
  const res = await api.get("/users/exists", {
    params: { personalEmail },
  });
  return res.data.exists;
};


// CREATE user
export const createUser = async (payload: {
  fullName: string;
  personalEmail: string;
  collegeEmail: string;
  whatsappNumber: string;
  gender: "Male" | "Female" | "Other";
}): Promise<UserDto> => {
  const res = await api.post("/users", payload);
  return res.data;
};


// UPDATE user
export const updateUser = async (
  id: string,
  updates: Partial<UserDto>
): Promise<UserDto> => {
  const res = await api.put(`/users/${id}`, updates);
  return res.data;
};


// DELETE user
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
