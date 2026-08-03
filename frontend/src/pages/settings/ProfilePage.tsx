import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User as UserIcon } from "lucide-react";
import { AxiosError } from "axios";
import { useState } from "react";

import FormInput from "../../components/ui/FormInput";
import { profileSchema } from "../../schemas/settingsSchemas";
import type { ProfileFormValues } from "../../schemas/settingsSchemas";
import { updateProfile } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { ApiErrorResponse } from "../../types/auth";

export default function ProfilePage() {
    const { user, login } = useAuth();
    const { showToast } = useToast();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name ?? "",
            email: user?.email ?? "",
        },
    });

    async function onSubmit(data: ProfileFormValues) {
        setFormError(null);
        try {
            const updatedUser = await updateProfile(data);

            // Refresh AuthContext's stored user so the Navbar's name/initials
            // and any other place displaying user info update immediately,
            // without needing a full page reload. We reuse login() here purely
            // for its "update the stored user" side effect — the existing
            // token is still valid, so we pass it through unchanged.
            const token = localStorage.getItem("finpilot_token");
            if (token) {
                login(updatedUser, token);
            }

            showToast("Profile updated successfully.");
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            const backendErrors = axiosError.response?.data?.errors;
            setFormError(
                backendErrors?.email?.[0] ?? backendErrors?.general?.[0] ?? "Something went wrong. Please try again.",
            );
        }
    }

    return (
        <div className="max-w-md">
            <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Profile</h2>
            </div>
            <p className="mt-1 text-sm text-neutral-500">Update your personal information.</p>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
            >
                {formError && (
                    <div className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                        {formError}
                    </div>
                )}

                <FormInput
                    id="full_name"
                    label="Full name"
                    error={errors.full_name?.message}
                    {...register("full_name")}
                />

                <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save changes
                </button>
            </form>
        </div>
    );
}