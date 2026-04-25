import axios from "axios";

// In development: use Vite proxy ("/api") → proxied to localhost:5050
// In production:  use VITE_API_URL env var, falling back to the Render deployment
const PROD_URL = "https://aurafit-backend-oary.onrender.com";

const baseURL = import.meta.env.DEV
  ? "/api"
  : (
      (import.meta.env.VITE_API_URL as string | undefined) ||
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
      PROD_URL
    ).replace(/\/$/, "") + "/api";

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

