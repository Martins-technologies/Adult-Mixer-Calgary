import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - check if backend URL is correct");
    }
    if (error.message === "Network Error") {
      console.error("Network Error - Backend URL:", api.defaults.baseURL);
      console.error(
        "Make sure VITE_API_BASE_URL is set in Vercel environment variables",
      );
    }
    return Promise.reject(error);
  },
);

export default api;

export const updateProfilePreferences = (data) =>
  api.patch("/users/me/profile", data);

export const getMatchingSuggestions = (params) =>
  api.get("/matching/suggestions", { params });

export const getTopMatches = (limit = 3) =>
  api.get("/matching/top", { params: { limit } });

export const discoverUsers = (params) =>
  api.get("/users/discover", { params });

export const skipUser = (toUserId) => api.post("/skips", { toUserId });

export const getMyProfile = () => api.get("/users/me/profile");

export const submitContactMessage = (data) => api.post("/contact", data);

export const getSubscriptionPlans = () => api.get("/subscriptions/plans");

export const getMySubscription = () => api.get("/subscriptions/me");

export const subscribeToPlan = (data) => api.post("/subscriptions/subscribe", data);

export const cancelSubscription = () => api.post("/subscriptions/cancel");

export const getReceivedLikes = () => api.get("/likes/received");
