import api from "./api";
import type { Category, CategoryFormData } from "../types/category";

export async function getCategories(type?: "income" | "expense"): Promise<Category[]> {
    const response = await api.get<Category[]>("/categories", {
        params: type ? { type } : undefined,
    });
    return response.data;
}

export async function createCategory(payload: CategoryFormData): Promise<Category> {
    const response = await api.post<Category>("/categories", payload);
    return response.data;
}

export async function updateCategory(id: number, payload: CategoryFormData): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, payload);
    return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
}