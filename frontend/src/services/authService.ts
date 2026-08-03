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

export interface UpdateProfilePayload {
    full_name: string;
    email: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data.user;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await api.put<{ message: string; user: User }>("/auth/profile", payload);
    return response.data.user;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.put("/auth/password", payload);
}