import axios from "axios";

// A single, shared Axios instance for the entire app.
// Every API call in FinPilot will import THIS, instead of calling
// axios.get/post directly — that way, base URL, headers, and
// authentication logic only need to be configured in ONE place.
const api = axios.create({
    baseURL: "http://127.0.0.1:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: runs before EVERY request sent through 'api'.
// This is where we'll automatically attach the JWT token (once we build
// login in Phase 6) so we don't have to manually add it to every single
// API call throughout the app.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("finpilot_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;