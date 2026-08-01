import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    // Builds initials from the user's full name, e.g. "Jane Doe" -> "JD",
    // used as a simple avatar placeholder until we build real profile
    // pictures (out of scope for this project's core phases).
    const initials = user?.full_name
        ? user.full_name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U";

    return (
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-8">
            <div>
                <h1 className="text-base font-semibold text-neutral-900">
                    Welcome back{user ? `, ${user.full_name.split(" ")[0]}` : ""}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                </button>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-neutral-100"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                            {initials}
                        </div>
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1.5 shadow-lg">
                            <div className="border-b border-neutral-100 px-3.5 py-2">
                                <p className="truncate text-sm font-medium text-neutral-900">{user?.full_name}</p>
                                <p className="truncate text-xs text-neutral-500">{user?.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm font-medium text-danger-600 transition hover:bg-danger-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}