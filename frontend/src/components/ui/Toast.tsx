import { CheckCircle2, XCircle, X } from "lucide-react";
import type { ToastItem } from "../../types/toast";

interface ToastProps {
    toast: ToastItem;
    onDismiss: (id: number) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
    const isSuccess = toast.type === "success";

    return (
        <div
            role="status"
            className={`flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${isSuccess ? "border-success-500/20" : "border-danger-500/20"
                }`}
        >
            {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" />
            ) : (
                <XCircle className="h-5 w-5 shrink-0 text-danger-500" />
            )}

            <p className="flex-1 text-sm font-medium text-neutral-900">{toast.message}</p>

            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Dismiss notification"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}