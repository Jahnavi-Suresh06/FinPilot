import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import IncomePage from "../pages/transactions/IncomePage";
import ExpensesPage from "../pages/transactions/ExpensesPage";
import BudgetsPage from "../pages/budgets/BudgetsPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import AdvisorPage from "../pages/advisor/AdvisorPage";
import SettingsPage from "../pages/settings/SettingsPage";
import ProfilePage from "../pages/settings/ProfilePage";
import ChangePasswordPage from "../pages/settings/ChangePasswordPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "dashboard",
                element: <DashboardPage />,
            },
            {
                path: "categories",
                element: <CategoriesPage />,
            },
            {
                path: "income",
                element: <IncomePage />,
            },
            {
                path: "expenses",
                element: <ExpensesPage />,
            },
            {
                path: "budgets",
                element: <BudgetsPage />,
            },
            {
                path: "analytics",
                element: <AnalyticsPage />,
            },
            {
                path: "settings",
                element: <SettingsPage />,
                children: [
                    { index: true, element: <ProfilePage /> },
                    { path: "profile", element: <ProfilePage /> },
                    { path: "password", element: <ChangePasswordPage /> },
                ],
            },
            {
                path: "ai-advisor",
                element: <AdvisorPage />,
            },
        ],
    },
]);

export default router;