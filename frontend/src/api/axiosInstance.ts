import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
