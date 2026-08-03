export type InsightSeverity = "critical" | "warning" | "info";

export interface Insight {
    severity: InsightSeverity;
    title: string;
    message: string;
    category_name: string | null;
}

export interface InsightsResponse {
    insights: Insight[];
    generated_at: string;
}