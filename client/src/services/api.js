import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Axios instance preconfigured with base URL.
 * Automatically attaches the JWT token from localStorage to every request.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor – attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor – handle 401 by clearing stale tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Only redirect if not already on auth pages
            if (
                !window.location.pathname.includes("/login") &&
                !window.location.pathname.includes("/register")
            ) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
