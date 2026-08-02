import Toast from "./Toast";
import type { ToastItem } from "../../types/toast";

interface ToastContainerProps {
    toasts: ToastItem[];
    onDismiss: (id: number) => void;
}

/**
 * Fixed-position stack of active toasts, bottom-right of the viewport.
 * Renders above modals (z-[60] vs Modal's z-50) so a success toast
 * remains visible even if it fires right as a modal is closing.
 */
export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}