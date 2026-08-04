import { usePageTitle } from "../../hooks/usePageTitle";
import { useState, useEffect, useCallback } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

import LoadingState from "../../components/states/LoadingState";
import ErrorState from "../../components/states/ErrorState";
import InsightCard from "../../components/ai/InsightCard";
import PredictionCard from "../../components/ai/PredictionCard";
import { getInsights, getExpensePrediction } from "../../services/analyticsService";
import type { Insight } from "../../types/insight";
import type { ExpensePrediction } from "../../types/prediction";

export default function AdvisorPage() {
    usePageTitle("AI Advisor");
    const [insights, setInsights] = useState<Insight[]>([]);
    const [prediction, setPrediction] = useState<ExpensePrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [insightsData, predictionData] = await Promise.all([
                getInsights(),
                getExpensePrediction(),
            ]);
            setInsights(insightsData.insights);
            setPrediction(predictionData);
        } catch {
            setError("Failed to load your financial insights.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return <LoadingState message="Analyzing your finances..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={loadData} />;
    }

    return (
        <div>
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-neutral-900">AI Advisor</h2>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
                Personalized insights based on your budgets, spending patterns, and trends.
            </p>

            {prediction && (
                <div className="mt-6 max-w-md">
                    <PredictionCard prediction={prediction} />
                </div>
            )}

            <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-900">Insights</h3>

                {insights.length === 0 ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5">
                        <CheckCircle2 className="h-5 w-5 text-success-500" />
                        <p className="text-sm text-neutral-600">
                            Nothing urgent to flag right now. Keep tracking your finances to unlock more
                            personalized insights over time.
                        </p>
                    </div>
                ) : (
                    <div className="mt-3 space-y-3">
                        {insights.map((insight, i) => (
                            <InsightCard key={i} insight={insight} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}