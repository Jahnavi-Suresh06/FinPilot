import { useState, useEffect, useCallback } from "react";
import LoadingState from "../../components/states/LoadingState";
import ErrorState from "../../components/states/ErrorState";
import ComparisonCard from "../../components/analytics/ComparisonCard";
import CategoryTrendChart from "../../components/analytics/CategoryTrendChart";
import TopCategoriesTable from "../../components/analytics/TopCategoriesTable";
import DateRangeSelector from "../../components/analytics/DateRangeSelector";
import { getComparison, getTrends } from "../../services/analyticsService";
import type { ComparisonData, AnalyticsTrends } from "../../types/analyticsExtras";

const MONTHS_BY_PRESET = { "3m": 3, "6m": 6, "12m": 12 };

export default function AnalyticsPage() {
    const [preset, setPreset] = useState<"3m" | "6m" | "12m">("6m");

    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const today = new Date();
            const monthsBack = MONTHS_BY_PRESET[preset];
            const startDate = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1)
                .toISOString()
                .slice(0, 10);
            const endDate = today.toISOString().slice(0, 10);

            const [comparisonData, trendsData] = await Promise.all([
                getComparison(),
                getTrends(startDate, endDate),
            ]);

            setComparison(comparisonData);
            setTrends(trendsData);
        } catch {
            setError("Failed to load analytics.");
        } finally {
            setIsLoading(false);
        }
    }, [preset]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return <LoadingState message="Loading analytics..." />;
    }

    if (error || !comparison || !trends) {
        return <ErrorState message={error ?? "Something went wrong."} onRetry={loadData} />;
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Analytics</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Deeper insight into your spending patterns over time.
                    </p>
                </div>
                <DateRangeSelector preset={preset} onChange={setPreset} />
            </div>

            {/* Month-over-month comparison */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ComparisonCard
                    label="Income (this month vs. last)"
                    currentValue={comparison.current_income}
                    changePercent={comparison.income_change_percent}
                />
                <ComparisonCard
                    label="Expenses (this month vs. last)"
                    currentValue={comparison.current_expenses}
                    changePercent={comparison.expense_change_percent}
                    invertColors
                />
            </div>

            {/* Category trend chart */}
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-neutral-900">Spending Trend by Category</h3>
                <p className="text-xs text-neutral-500">
                    {preset === "3m" ? "Last 3 months" : preset === "6m" ? "Last 6 months" : "Last 12 months"}
                </p>
                <div className="mt-4">
                    <CategoryTrendChart series={trends.series} />
                </div>
            </div>

            {/* Top categories */}
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-neutral-900">Top Spending Categories</h3>
                </div>
                <div className="mt-3">
                    <TopCategoriesTable categories={trends.top_categories} />
                </div>
            </div>
        </div>
    );
}