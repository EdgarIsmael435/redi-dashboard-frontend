import axios from "axios";
import { clearSession } from "./auth";
import { triggerSessionExpired } from "./sessionEvents";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor de request → agrega token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response → maneja renovación y expiración
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-new-token"];
    if (newToken) localStorage.setItem("token", newToken);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      triggerSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default api;
