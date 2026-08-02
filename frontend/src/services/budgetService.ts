import api from "./api";
import type { Budget, BudgetFormData } from "../types/budget";

export async function getBudgets(month: number, year: number): Promise<Budget[]> {
    const response = await api.get<Budget[]>("/budgets", { params: { month, year } });
    return response.data;
}

export async function createBudget(payload: BudgetFormData): Promise<Budget> {
    const response = await api.post<Budget>("/budgets", payload);
    return response.data;
}

export async function updateBudget(id: number, payload: BudgetFormData): Promise<Budget> {
    const response = await api.put<Budget>(`/budgets/${id}`, payload);
    return response.data;
}

export async function deleteBudget(id: number): Promise<void> {
    await api.delete(`/budgets/${id}`);
}