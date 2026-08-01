// Mirrors exactly what our backend's UserSchema returns
// (see backend/app/schemas/user_schema.py) — keeping these in sync
// is important; if the backend ever adds/removes a field, we update here too.
export interface User {
    id: number;
    email: string;
    full_name: string;
    created_at: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    access_token: string;
}

export interface ApiErrorResponse {
    errors: Record<string, string[]>;
}