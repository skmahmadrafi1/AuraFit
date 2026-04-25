import axios from "axios";

const PROD_URL = "https://aurafit-backend-oary.onrender.com";

const baseURL = (
  (import.meta.env.VITE_API_URL as string | undefined) ||
  PROD_URL
).replace(/\/$/, "") + "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
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