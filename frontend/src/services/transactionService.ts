import api from "./api";
import type {
    Transaction,
    TransactionFormData,
    TransactionListResponse,
} from "../types/transaction";

export interface TransactionFilters {
    type?: "income" | "expense";
    category_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
}

export async function getTransactions(
    filters: TransactionFilters = {},
): Promise<TransactionListResponse> {
    const response = await api.get<TransactionListResponse>("/transactions", {
        params: filters,
    });
    return response.data;
}

export async function createTransaction(payload: TransactionFormData): Promise<Transaction> {
    const response = await api.post<Transaction>("/transactions", payload);
    return response.data;
}

export async function updateTransaction(
    id: number,
    payload: TransactionFormData,
): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, payload);
    return response.data;
}

export async function deleteTransaction(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`);
}