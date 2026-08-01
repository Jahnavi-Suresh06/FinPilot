import api from "./api";
import type { AuthResponse, User } from "../types/auth";

export interface RegisterPayload {
    email: string;
    password: string;
    full_name: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * Calls POST /api/auth/register.
 * Returns the full auth response (user + token) on success.
 * Throws an AxiosError on failure — the calling component decides
 * how to handle/display that error.
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
}

/**
 * Calls POST /api/auth/login.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
}

/**
 * Calls GET /api/auth/me — requires a valid token already attached
 * (handled automatically by our Axios interceptor from Phase 5).
 * Used to restore the logged-in state when the app first loads
 * (e.g. after a page refresh).
 */
export async function fetchCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data.user;
}