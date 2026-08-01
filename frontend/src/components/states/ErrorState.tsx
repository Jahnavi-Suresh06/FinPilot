import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

/**
 * Shown when a request to the backend fails (network error, server
 * error, etc.). Always gives the user a way to retry, rather than
 * leaving them stuck.
 */
export default function ErrorState({
    message = "Something went wrong. Please try again.",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50">
                <AlertTriangle className="h-6 w-6 text-danger-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-700">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}