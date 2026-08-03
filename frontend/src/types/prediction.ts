export type TrendDirection = "increasing" | "decreasing" | "stable";
export type PredictionConfidence = "low" | "medium" | "high";

export interface ExpensePrediction {
    has_enough_data: boolean;
    predicted_amount: number | null;
    trend_direction: TrendDirection | null;
    monthly_change: number | null;
    months_used: number;
    confidence: PredictionConfidence | null;
    minimum_months_required: number;
}