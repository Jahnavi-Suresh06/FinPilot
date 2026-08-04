import { usePageTitle } from "../../hooks/usePageTitle";
import { useState, useEffect, useCallback } from "react";
import { Plus, PiggyBank, ChevronLeft, ChevronRight } from "lucide-react";
import { AxiosError } from "axios";

import { useToast } from "../../context/ToastContext";
import Modal from "../../components/ui/Modal";
import LoadingState from "../../components/states/LoadingState";
import EmptyState from "../../components/states/EmptyState";
import ErrorState from "../../components/states/ErrorState";
import BudgetForm from "../../components/budgets/BudgetForm";
import BudgetCard from "../../components/budgets/BudgetCard";
import type { BudgetFormValues } from "../../schemas/budgetSchemas";
import type { Budget } from "../../types/budget";
import type { Category } from "../../types/category";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../../services/budgetService";
import { getCategories } from "../../services/categoryService";
import { formatCurrency } from "../../utils/formatters";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function BudgetsPage() {
    usePageTitle("Budgets");
    const { showToast } = useToast();
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [budgetData, categoryData] = await Promise.all([
                getBudgets(month, year),
                getCategories("expense"),
            ]);
            setBudgets(budgetData);
            setCategories(categoryData);
        } catch {
            setError("Failed to load your budgets.");
        } finally {
            setIsLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function goToPreviousMonth() {
        if (month === 1) {
            setMonth(12);
            setYear((y) => y - 1);
        } else {
            setMonth((m) => m - 1);
        }
    }

    function goToNextMonth() {
        if (month === 12) {
            setMonth(1);
            setYear((y) => y + 1);
        } else {
            setMonth((m) => m + 1);
        }
    }

    function openAddModal() {
        setEditingBudget(null);
        setFormError(null);
        setIsModalOpen(true);
    }

    function openEditModal(budget: Budget) {
        setEditingBudget(budget);
        setFormError(null);
        setIsModalOpen(true);
    }

    async function handleFormSubmit(data: BudgetFormValues) {
        setFormError(null);
        setIsSaving(true);
        try {
            if (editingBudget) {
                await updateBudget(editingBudget.id, data);
                showToast("Budget updated successfully.");
            } else {
                await createBudget(data);
                showToast("Budget created successfully.");
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

    async function handleDelete(budget: Budget) {
        const confirmed = window.confirm(
            `Delete the ${budget.category.name} budget for ${MONTH_NAMES[budget.month - 1]} ${budget.year}?\n\nLimit: ${formatCurrency(budget.limit_amount)}\n\nThis cannot be undone.`,
        );
        if (!confirmed) return;

        setDeletingId(budget.id);
        try {
            await deleteBudget(budget.id);
            await loadData();
            showToast("Budget deleted successfully.");
        } catch {
            window.alert("Failed to delete this budget. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    const hasNoExpenseCategories = !isLoading && !error && categories.length === 0;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Budgets</h2>
                    <p className="mt-1 text-sm text-neutral-500">Track your spending limits by category.</p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    disabled={hasNoExpenseCategories}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Add budget
                </button>
            </div>

            {/* Month navigator */}
            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[140px] text-center text-sm font-semibold text-neutral-900">
                    {MONTH_NAMES[month - 1]} {year}
                </span>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50"
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {hasNoExpenseCategories && (
                <div className="mt-4 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-neutral-700">
                    You don't have any expense categories yet. Create one on the{" "}
                    <a href="/categories" className="font-semibold text-primary-600 hover:underline">
                        Categories page
                    </a>{" "}
                    before setting budgets.
                </div>
            )}

            <div className="mt-6">
                {isLoading && (
                    <div className="rounded-2xl border border-neutral-200 bg-white">
                        <LoadingState message="Loading budgets..." />
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-2xl border border-neutral-200 bg-white">
                        <ErrorState message={error} onRetry={loadData} />
                    </div>
                )}

                {!isLoading && !error && budgets.length === 0 && (
                    <div className="rounded-2xl border border-neutral-200 bg-white">
                        <EmptyState
                            icon={PiggyBank}
                            title="No budgets for this month"
                            description="Set a spending limit for a category to start tracking your budget."
                        />
                    </div>
                )}

                {!isLoading && !error && budgets.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                isDeleting={deletingId === budget.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (isSaving) return;
                    setIsModalOpen(false);
                }}
                title={editingBudget ? "Edit budget" : "Add budget"}
            >
                {formError && (
                    <div className="mb-4 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                        {formError}
                    </div>
                )}
                <BudgetForm
                    categories={categories}
                    currentMonth={month}
                    currentYear={year}
                    initialValues={editingBudget ?? undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}