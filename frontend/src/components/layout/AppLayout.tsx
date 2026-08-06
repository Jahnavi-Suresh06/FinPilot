import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * The shared shell for every authenticated page. On desktop (lg+), the
 * Sidebar is permanently visible. On smaller screens, it becomes a
 * slide-in drawer triggered by a hamburger button in the Navbar, since
 * a fixed 256px sidebar simply doesn't fit on a phone-width viewport.
 */
export default function AppLayout() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-neutral-50">
            {/* Desktop sidebar: always visible at lg+ */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile sidebar: slide-in drawer, only rendered when open */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileSidebarOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 h-full w-64 animate-slide-in-left">
                        <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}