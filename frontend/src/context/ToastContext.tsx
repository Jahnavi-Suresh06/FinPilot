import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type { ToastItem, ToastType } from "../types/toast";
import ToastContainer from "../components/ui/ToastContainer";

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    // A simple incrementing counter for unique toast IDs. useRef (not
    // useState) because this value never needs to trigger a re-render on
    // its own — it's just an internal counter, changing it shouldn't
    // cause React to re-render anything by itself.
    const idCounter = useRef(0);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "success") => {
            const id = idCounter.current++;
            setToasts((prev) => [...prev, { id, type, message }]);

            // Auto-dismiss after AUTO_DISMISS_MS — this is what makes a toast
            // a "toast" rather than a persistent banner the user must
            // manually close every time.
            setTimeout(() => {
                dismissToast(id);
            }, AUTO_DISMISS_MS);
        },
        [dismissToast],
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}