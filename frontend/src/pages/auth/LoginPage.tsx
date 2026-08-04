import { usePageTitle } from "../../hooks/usePageTitle";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import FormInput from "../../components/ui/FormInput";
import { loginSchema } from "../../schemas/authSchemas";
import type { LoginFormData } from "../../schemas/authSchemas";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import type { ApiErrorResponse } from "../../types/auth";

export default function LoginPage() {
    usePageTitle("Login");
    const navigate = useNavigate();
    const { login } = useAuth();

    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginFormData) {
        setServerError(null);
        try {
            const response = await loginUser(data);
            login(response.user, response.access_token);
            navigate("/dashboard");
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            const backendErrors = axiosError.response?.data?.errors;
            setServerError(backendErrors?.general?.[0] ?? "Something went wrong. Please try again.");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-neutral-900">Welcome back</h1>
                    <p className="mt-1 text-sm text-neutral-500">Log in to your FinPilot account.</p>
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
                        placeholder="Your password"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}