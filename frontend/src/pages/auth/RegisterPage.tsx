import { usePageTitle } from "../../hooks/usePageTitle";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import FormInput from "../../components/ui/FormInput";
import { registerSchema } from "../../schemas/authSchemas";
import type { RegisterFormData } from "../../schemas/authSchemas";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import type { ApiErrorResponse } from "../../types/auth";

export default function RegisterPage() {
    usePageTitle("Register");
    const navigate = useNavigate();
    const { login } = useAuth();

    // Holds a general error not tied to a specific field, e.g. "email already exists".
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(data: RegisterFormData) {
        setServerError(null);
        try {
            const response = await registerUser(data);
            login(response.user, response.access_token);
            navigate("/dashboard");
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            const backendErrors = axiosError.response?.data?.errors;

            if (backendErrors?.email) {
                setServerError(backendErrors.email[0]);
            } else if (backendErrors?.general) {
                setServerError(backendErrors.general[0]);
            } else {
                setServerError("Something went wrong. Please try again.");
            }
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-neutral-900">Create your account</h1>
                    <p className="mt-1 text-sm text-neutral-500">Start managing your finances smarter.</p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                    {serverError && (
                        <div className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                            {serverError}
                        </div>
                    )}

                    <FormInput
                        id="full_name"
                        label="Full name"
                        type="text"
                        placeholder="Jane Doe"
                        error={errors.full_name?.message}
                        {...register("full_name")}
                    />

                    <FormInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="At least 8 characters"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}