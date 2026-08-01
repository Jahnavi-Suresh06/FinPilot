import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../states/LoadingState";

/**
 * Wraps any route that requires the user to be logged in.
 * - While we're still checking for a saved session (isLoading), show a
 *   loading state instead of prematurely redirecting.
 * - If not authenticated once loading finishes, redirect to /login.
 * - Otherwise, render the actual protected content.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingState message="Checking your session..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}