import { usePageTitle } from "../../hooks/usePageTitle";
import { useState, useEffect, useCallback } from "react";
import { ArrowUpCircle, ArrowDownCircle, Wallet, FileDown, Loader2 } from "lucide-react";

import LoadingState from "../../components/states/LoadingState";
import ErrorState from "../../components/states/ErrorState";
import SummaryCard from "../../components/dashboard/SummaryCard";
import CategoryBreakdownChart from "../../components/dashboard/CategoryBreakdownChart";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import PredictionCard from "../../components/ai/PredictionCard";
import { formatCurrency } from "../../utils/formatters";
import { getDashboardSummary, getExpensePrediction } from "../../services/analyticsService";
import { exportMonthlyReportPdf } from "../../services/exportService";
import { useToast } from "../../context/ToastContext";
import type { DashboardSummary } from "../../types/analytics";
import type { ExpensePrediction } from "../../types/prediction";

export default function DashboardPage() {
    usePageTitle("Dashboard");
    const { showToast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [prediction, setPrediction] = useState<ExpensePrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, predictionData] = await Promise.all([
                getDashboardSummary(),
                getExpensePrediction(),
            ]);
            setSummary(summaryData);
            setPrediction(predictionData);
        } catch {
            setError("Failed to load your dashboard.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    async function handleExportReport() {
        setIsExporting(true);
        try {
            const today = new Date();
            await exportMonthlyReportPdf(today.getMonth() + 1, today.getFullYear());
            showToast("Monthly report downloaded successfully.");
        } catch {
            window.alert("Failed to generate report. Please try again.");
        } finally {
            setIsExporting(false);
        }
    }

    if (isLoading) {
        return <LoadingState message="Loading your dashboard..." />;
    }

    if (error || !summary) {
        return <ErrorState message={error ?? "Something went wrong."} onRetry={loadSummary} />;
    }

    const netIsPositive = Number(summary.net_balance) >= 0;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
                    <p className="mt-1 text-sm text-neutral-500">Your complete financial overview.</p>
                </div>
                <button
                    type="button"
                    onClick={handleExportReport}
                    disabled={isExporting}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="h-4 w-4" />
                    )}
                    Download Monthly Report
                </button>
            </div>

            {/* Summary cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Total Income"
                    value={formatCurrency(summary.total_income)}
                    icon={ArrowUpCircle}
                    tone="positive"
                />
                <SummaryCard
                    label="Total Expenses"
                    value={formatCurrency(summary.total_expenses)}
                    icon={ArrowDownCircle}
                    tone="negative"
                />
                <SummaryCard
                    label="Net Balance"
                    value={formatCurrency(summary.net_balance)}
                    icon={Wallet}
                    tone={netIsPositive ? "positive" : "negative"}
                />
            </div>

            {/* Charts */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Income vs. Expenses</h3>
                    <p className="text-xs text-neutral-500">Last 6 months</p>
                    <div className="mt-4">
                        <MonthlyTrendChart data={summary.monthly_trend} />
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-neutral-900">Spending by Category</h3>
                    <p className="text-xs text-neutral-500">All-time expenses</p>
                    <div className="mt-4">
                        <CategoryBreakdownChart data={summary.category_breakdown} />
                    </div>
                </div>
            </div>

            {/* AI prediction + recent transactions */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    {prediction && <PredictionCard prediction={prediction} />}
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white lg:col-span-3">
                    <div className="px-5 pt-5">
                        <h3 className="text-sm font-semibold text-neutral-900">Recent Transactions</h3>
                    </div>
                    <div className="mt-3">
                        <RecentTransactions transactions={summary.recent_transactions} />
                    </div>
                </div>
            </div>
        </div>
    );
}