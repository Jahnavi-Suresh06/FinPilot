export interface BudgetCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  limit_amount: string;
  month: number;
  year: number;
  created_at: string;
  category: BudgetCategory;
  spent: string;
  remaining: string;
  percent_used: number;
}

export interface BudgetFormData {
  category_id: number;
  limit_amount: number;
  month: number;
  year: number;
}