import { Sparkles, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { ExpensePrediction } from "../../types/prediction";
import { formatCurrency } from "../../utils/formatters";

interface PredictionCardProps {
    prediction: ExpensePrediction;
}

const CONFIDENCE_LABEL: Record<string, string> = {
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence",
};

const TREND_ICON = {
    increasing: TrendingUp,
    decreasing: TrendingDown,
    stable: Minus,
};

export default function PredictionCard({ prediction }: PredictionCardProps) {
    if (!prediction.has_enough_data) {
        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-2 text-primary-600">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-sm font-semibold">Expense Prediction</h3>
                </div>
                <p className="mt-3 text-sm text-neutral-600">
                    Not enough data yet. We need at least {prediction.minimum_months_required} months of
                    expense history to make a reliable prediction — you currently have{" "}
                    {prediction.months_used}. Keep logging your expenses, and this will unlock automatically.
                </p>
            </div>
        );
    }

    const TrendIcon = TREND_ICON[prediction.trend_direction!];
    const trendColor =
        prediction.trend_direction === "increasing"
            ? "text-danger-600"
            : prediction.trend_direction === "decreasing"
                ? "text-success-600"
                : "text-neutral-500";

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary-600">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-sm font-semibold">Predicted Next Month's Expenses</h3>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                    {CONFIDENCE_LABEL[prediction.confidence!]}
                </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-neutral-900">
                {formatCurrency(prediction.predicted_amount!)}
            </p>

            <div className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span>
                    {prediction.trend_direction === "stable"
                        ? "Your spending has been stable"
                        : `Trending ${prediction.trend_direction} by about ${formatCurrency(
                            Math.abs(prediction.monthly_change!),
                        )}/month`}
                </span>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                    This is an estimate based on your last {prediction.months_used} months of spending
                    trends, not a guarantee. Use it as a general guide, not financial advice.
                </span>
            </div>
        </div>
    );
}