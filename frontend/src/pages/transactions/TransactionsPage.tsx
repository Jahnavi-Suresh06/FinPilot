import { usePageTitle } from "../../hooks/usePageTitle";
import { useState, useEffect, useCallback } from "react";
import { Plus, Wallet as WalletIcon, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { formatCurrency, formatDate } from "../../utils/formatters";

import { useToast } from "../../context/ToastContext";
import Modal from "../../components/ui/Modal";
import LoadingState from "../../components/states/LoadingState";
import EmptyState from "../../components/states/EmptyState";
import ErrorState from "../../components/states/ErrorState";
import TransactionForm from "../../components/transactions/TransactionForm";
import TransactionList from "../../components/transactions/TransactionList";
import type { TransactionFormValues } from "../../schemas/transactionSchemas";
import type { Transaction } from "../../types/transaction";
import type { Category, CategoryType } from "../../types/category";
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from "../../services/transactionService";
import { getCategories } from "../../services/categoryService";
import { exportTransactionsCsv } from "../../services/exportService";

interface TransactionsPageProps {
    type: CategoryType;
}

export default function TransactionsPage({ type }: TransactionsPageProps) {
    usePageTitle(type === "income" ? "Income" : "Expenses");
    const { showToast } = useToast();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const isIncome = type === "income";
    const pageTitle = isIncome ? "Income" : "Expenses";

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [transactionData, categoryData] = await Promise.all([
                getTransactions({ type, page, per_page: 15 }),
                getCategories(type),
            ]);
            setTransactions(transactionData.items);
            setTotalPages(transactionData.pages || 1);
            setCategories(categoryData);
        } catch {
            setError(`Failed to load ${pageTitle.toLowerCase()}.`);
        } finally {
            setIsLoading(false);
        }
    }, [type, page, pageTitle]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset to page 1 whenever we switch between /income and /expenses,
    // so we don't land on "page 4" of a list that might only have 1 page.
    useEffect(() => {
        setPage(1);
    }, [type]);

    function openAddModal() {
        setEditingTransaction(null);
        setFormError(null);
        setIsModalOpen(true);
    }

    function openEditModal(transaction: Transaction) {
        setEditingTransaction(transaction);
        setFormError(null);
        setIsModalOpen(true);
    }

    async function handleFormSubmit(data: TransactionFormValues) {
        setFormError(null);
        setIsSaving(true);
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, data);
                showToast(`${isIncome ? "Income" : "Expense"} updated successfully.`);
            } else {
                await createTransaction(data);
                showToast(`${isIncome ? "Income" : "Expense"} added successfully.`);
            }
            setIsModalOpen(false);
            await loadData();
        } catch (err) {
            const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
            const backendErrors = axiosError.response?.data?.errors;
            const firstError = backendErrors ? Object.values(backendErrors)[0]?.[0] : undefined;
            setFormError(firstError ?? "Something went wrong. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleExport() {
        setIsExporting(true);
        try {
            await exportTransactionsCsv({ type });
            showToast(`${isIncome ? "Income" : "Expenses"} exported successfully.`);
        } catch {
            window.alert("Failed to export. Please try again.");
        } finally {
            setIsExporting(false);
        }
    }

    async function handleDelete(transaction: Transaction) {
        const confirmed = window.confirm(
            `Delete this ${type}?\n\n${transaction.category.name} · ${formatCurrency(transaction.amount)} · ${formatDate(transaction.date)}\n\nThis cannot be undone.`,
        );
        if (!confirmed) return;

        setDeletingId(transaction.id);
        try {
            await deleteTransaction(transaction.id);
            await loadData();
            showToast(`${isIncome ? "Income" : "Expense"} deleted successfully.`);
        } catch {
            window.alert(`Failed to delete this ${type}. Please try again.`);
        } finally {
            setDeletingId(null);
        }
    }

    const hasNoCategories = !isLoading && !error && categories.length === 0;

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{pageTitle}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Track and manage your {pageTitle.toLowerCase()} entries.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isExporting || transactions.length === 0}
                        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={openAddModal}
                        disabled={hasNoCategories}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Add {isIncome ? "income" : "expense"}
                    </button>
                </div>
            </div>

            {hasNoCategories && (
                <div className="mt-4 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-neutral-700">
                    You don't have any {type} categories yet. Create one on the{" "}
                    <a href="/categories" className="font-semibold text-primary-600 hover:underline">
                        Categories page
                    </a>{" "}
                    before adding {pageTitle.toLowerCase()}.
                </div>
            )}

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
                {isLoading && <LoadingState message={`Loading ${pageTitle.toLowerCase()}...`} />}

                {!isLoading && error && <ErrorState message={error} onRetry={loadData} />}

                {!isLoading && !error && transactions.length === 0 && (
                    <EmptyState
                        icon={WalletIcon}
                        title={`No ${pageTitle.toLowerCase()} yet`}
                        description={`Start tracking by adding your first ${type} entry.`}
                    />
                )}

                {!isLoading && !error && transactions.length > 0 && (
                    <>
                        <TransactionList
                            transactions={transactions}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            deletingId={deletingId}
                        />

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <span className="text-sm text-neutral-500">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (isSaving) return;
                    setIsModalOpen(false);
                }}
                title={editingTransaction ? `Edit ${type}` : `Add ${type}`}
            >
                {formError && (
                    <div className="mb-4 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                        {formError}
                    </div>
                )}
                <TransactionForm
                    type={type}
                    categories={categories}
                    initialValues={editingTransaction ?? undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}