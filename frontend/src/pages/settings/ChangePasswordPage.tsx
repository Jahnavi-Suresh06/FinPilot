import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";
import { AxiosError } from "axios";
import { useState } from "react";

import FormInput from "../../components/ui/FormInput";
import { changePasswordSchema } from "../../schemas/settingsSchemas";
import type { ChangePasswordFormValues } from "../../schemas/settingsSchemas";
import { changePassword } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

export default function ChangePasswordPage() {
    const { showToast } = useToast();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    async function onSubmit(data: ChangePasswordFormValues) {
        setFormError(null);
        try {
            // confirm_password only exists for frontend validation — the
            // backend's ChangePasswordSchema doesn't declare or expect it.
            await changePassword({
                current_password: data.current_password,
                new_password: data.new_password,
            });
            showToast("Password changed successfully.");
            reset();
        } catch (err) {
            const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
            const backendErrors = axiosError.response?.data?.errors;
            setFormError(
                backendErrors?.current_password?.[0] ?? "Something went wrong. Please try again.",
            );
        }
    }

    return (
        <div className="max-w-md">
            <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Change Password</h2>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
                Update your password. You'll need to confirm your current one first.
            </p>

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
                    id="current_password"
                    label="Current password"
                    type="password"
                    error={errors.current_password?.message}
                    {...register("current_password")}
                />

                <FormInput
                    id="new_password"
                    label="New password"
                    type="password"
                    error={errors.new_password?.message}
                    {...register("new_password")}
                />

                <FormInput
                    id="confirm_password"
                    label="Confirm new password"
                    type="password"
                    error={errors.confirm_password?.message}
                    {...register("confirm_password")}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Change password
                </button>
            </form>
        </div>
    );
}