import { z } from "zod";

export const profileSchema = z.object({
    full_name: z
        .string()
        .min(2, "Full name must be at least 2 characters.")
        .max(150, "Full name must be under 150 characters."),
    email: z.string().email("Please enter a valid email address."),
});

export const changePasswordSchema = z
    .object({
        current_password: z.string().min(1, "Current password is required."),
        new_password: z.string().min(8, "New password must be at least 8 characters."),
        confirm_password: z.string().min(1, "Please confirm your new password."),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match.",
        path: ["confirm_password"],
    });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;