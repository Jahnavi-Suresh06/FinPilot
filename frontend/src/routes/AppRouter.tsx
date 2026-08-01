import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";

/**
 * The single source of truth for every URL in FinPilot.
 * createBrowserRouter (rather than the older <BrowserRouter> component
 * approach) is the current React Router recommended pattern — it enables
 * newer features we'll use later, like data loaders.
 */
const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        // AppLayout wraps all these child routes with Sidebar + Navbar.
        // Whichever child path matches renders inside AppLayout's <Outlet />.
        path: "/",
        element: <AppLayout />,
        children: [
            {
                path: "dashboard",
                element: <DashboardPage />,
            },
        ],
    },
]);

export default router;