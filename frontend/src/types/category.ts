export type CategoryType = "income" | "expense";

export interface Category {
    id: number;
    user_id: number;
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
    created_at: string;
}

export interface CategoryFormData {
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
}