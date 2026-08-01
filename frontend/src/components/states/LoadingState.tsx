import { Loader2 } from "lucide-react";

interface LoadingStateProps {
    message?: string;
}

/**
 * A consistent loading indicator used across every page while data
 * is being fetched from the backend. Centralizing this means every
 * loading screen in FinPilot looks and feels identical.
 */
export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="mt-3 text-sm font-medium">{message}</p>
        </div>
    );
}
