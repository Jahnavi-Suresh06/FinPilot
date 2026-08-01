import type { Transaction } from "./transaction";

export interface CategoryBreakdownItem {
    category_id: number;
    category_name: string;
    color: string;
    total: string;
}

export interface MonthlyTrendItem {
    month: string;
    label: string;
    income: string;
    expense: string;
}

export interface DashboardSummary {
    total_income: string;
    total_expenses: string;
    net_balance: string;
    transaction_count: number;
    category_breakdown: CategoryBreakdownItem[];
    monthly_trend: MonthlyTrendItem[];
    recent_transactions: Transaction[];
}