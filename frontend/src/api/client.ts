import axios from "axios";

// Use proxy in development to avoid ad blocker issues, use env var in production
const baseURL = import.meta.env.DEV 
  ? "/api"  // Use Vite proxy in development (avoids ad blockers)
  : (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout — prevents requests hanging forever
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aurafit_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently pass errors through so individual pages can handle them properly
    // This avoids duplicate toast messages when pages already show their own errors
    return Promise.reject(error);
  },
);

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return message || "Unexpected error";
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export default api;

