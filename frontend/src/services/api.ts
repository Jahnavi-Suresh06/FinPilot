import axios from "axios";

// Shared Axios instance for the entire app
const api = axios.create({
    baseURL: "https://finpilot-production-71e1.up.railway.app/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("finpilot_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;