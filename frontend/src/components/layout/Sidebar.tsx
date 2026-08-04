import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    ArrowDownCircle,
    ArrowUpCircle,
    PiggyBank,
    BarChart3,
    Sparkles,
    Settings,
    Wallet,
    Tag,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Income", to: "/income", icon: ArrowUpCircle },
    { label: "Expenses", to: "/expenses", icon: ArrowDownCircle },
    { label: "Categories", to: "/categories", icon: Tag },
    { label: "Budgets", to: "/budgets", icon: PiggyBank },
    { label: "Analytics", to: "/analytics", icon: BarChart3 },
    { label: "AI Advisor", to: "/ai-advisor", icon: Sparkles },
    { label: "Settings", to: "/settings", icon: Settings },
];

interface SidebarProps {
    onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
    return (
        <aside className="flex h-full w-64 flex-col border-r border-neutral-200 bg-white">
            <div className="flex items-center gap-2 px-6 py-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                    <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-neutral-900">FinPilot</span>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {navItems.map(({ label, to, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? "bg-primary-50 text-primary-700"
                                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                            }`
                        }
                    >
                        <Icon className="h-[18px] w-[18px]" />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}