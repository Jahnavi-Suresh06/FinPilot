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
        ],
    },
]);

export default router;