import { Bell, ChevronDown } from "lucide-react";

/**
 * The top bar shown on every authenticated page — currently a static
 * placeholder. In Phase 6, we'll wire up the user's real name/email
 * here via AuthContext, and in a later phase, real notifications.
 */
export default function Navbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-8">
            <div>
                <h1 className="text-base font-semibold text-neutral-900">Welcome back</h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-neutral-100"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        U
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                </button>
            </div>
        </header>
    );
}