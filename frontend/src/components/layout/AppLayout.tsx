import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * The shared shell for every authenticated page: Sidebar on the left,
 * Navbar on top, and the actual page content rendered via <Outlet />.
 * <Outlet /> is React Router's placeholder for "whichever child route
 * is currently active" — this is what lets Dashboard, Expenses, Budgets
 * etc. all share this exact same layout without duplicating it.
 */
export default function AppLayout() {
    return (
        <div className="flex h-screen bg-neutral-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}