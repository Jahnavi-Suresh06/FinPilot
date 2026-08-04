import { usePageTitle } from "../../hooks/usePageTitle";
import { NavLink, Outlet } from "react-router-dom";
import { User, KeyRound } from "lucide-react";

export default function SettingsPage() {
    usePageTitle("Settings");
    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
            <p className="mt-1 text-sm text-neutral-500">Manage your account.</p>

            <div className="mt-6 flex gap-2 border-b border-neutral-200">
                <NavLink
                    to="/settings/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${isActive
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-neutral-500 hover:text-neutral-900"
                        }`
                    }
                >
                    <User className="h-4 w-4" />
                    Profile
                </NavLink>
                <NavLink
                    to="/settings/password"
                    className={({ isActive }) =>
                        `flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${isActive
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-neutral-500 hover:text-neutral-900"
                        }`
                    }
                >
                    <KeyRound className="h-4 w-4" />
                    Password
                </NavLink>
            </div>

            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}