import { z } from "zod";

// Mirrors our backend's RegisterSchema/LoginSchema (Marshmallow) validation
// rules exactly — validating on the frontend gives instant feedback
// without a network round-trip, but the backend ALWAYS re-validates too
// (never trust the frontend alone — a user could bypass our UI entirely).
export const registerSchema = z.object({
    full_name: z
        .string()
        .min(2, "Full name must be at least 2 characters.")
        .max(150, "Full name must be under 150 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long."),
});

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
});

// TypeScript types automatically INFERRED from the schemas above —
// meaning our types and validation rules can never drift out of sync,
// since one is generated directly from the other.
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
