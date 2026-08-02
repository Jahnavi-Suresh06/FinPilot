export interface ComparisonData {
    current_income: string;
    current_expenses: string;
    previous_income: string;
    previous_expenses: string;
    income_change_percent: number | null;
    expense_change_percent: number | null;
}

export interface CategoryTrendPoint {
    period: string;
    label: string;
    total: string;
}

export interface CategoryTrendSeries {
    category_id: number;
    category_name: string;
    color: string;
    points: CategoryTrendPoint[];
}

export interface TopCategoryItem {
    category_id: number;
    category_name: string;
    color: string;
    total: string;
    percent_of_total: number;
}

export interface AnalyticsTrends {
    series: CategoryTrendSeries[];
    top_categories: TopCategoryItem[];
    total_expenses: string;
}