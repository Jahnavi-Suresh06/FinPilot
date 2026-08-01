import type { CategoryType } from "./category";

export interface TransactionCategory {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: CategoryType;
}

export interface Transaction {
    id: number;
    user_id: number;
    category_id: number;
    amount: string; // Comes from backend as a string to preserve decimal precision exactly
    type: CategoryType;
    date: string; // YYYY-MM-DD
    note: string | null;
    created_at: string;
    updated_at: string;
    category: TransactionCategory;
}

export interface TransactionFormData {
    category_id: number;
    amount: number;
    type: CategoryType;
    date: string;
    note?: string;
}

export interface TransactionListResponse {
    items: Transaction[];
    total: number;
    page: number;
    pages: number;
    per_page: number;
}