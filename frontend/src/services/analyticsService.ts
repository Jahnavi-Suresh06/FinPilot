import api from "./api";
import type { DashboardSummary } from "../types/analytics";
import type { ComparisonData, AnalyticsTrends } from "../types/analyticsExtras";
import type { ExpensePrediction } from "../types/prediction";
import type { InsightsResponse } from "../types/insight";

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>("/analytics/summary");
    return response.data;
}

export async function getComparison(month?: number, year?: number): Promise<ComparisonData> {
    const response = await api.get<ComparisonData>("/analytics/comparison", {
        params: month && year ? { month, year } : undefined,
    });
    return response.data;
}

export async function getTrends(startDate?: string, endDate?: string): Promise<AnalyticsTrends> {
    const response = await api.get<AnalyticsTrends>("/analytics/trends", {
        params: startDate && endDate ? { start_date: startDate, end_date: endDate } : undefined,
    });
    return response.data;
}


export async function getExpensePrediction(): Promise<ExpensePrediction> {
    const response = await api.get<ExpensePrediction>("/ai/predict-expense");
    return response.data;
}

export async function getInsights(): Promise<InsightsResponse> {
    const response = await api.get<InsightsResponse>("/ai/insights");
    return response.data;
}