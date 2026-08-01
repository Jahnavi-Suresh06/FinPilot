import api from "./api";
import type { DashboardSummary } from "../types/analytics";

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>("/analytics/summary");
    return response.data;
}