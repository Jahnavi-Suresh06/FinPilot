import { usePageTitle } from "../../hooks/usePageTitle";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Tag, Loader2 } from "lucide-react";

import { useToast } from "../../context/ToastContext";
import Modal from "../../components/ui/Modal"; import LoadingState from "../../components/states/LoadingState";
import EmptyState from "../../components/states/EmptyState";
import ErrorState from "../../components/states/ErrorState";
import CategoryForm from "../../components/categories/CategoryForm";
import type { CategoryFormValues } from "../../schemas/categorySchemas";
import type { Category } from "../../types/category";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../services/categoryService";

export default function CategoriesPage() {
    usePageTitle("Categories");
    
    const { showToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch {
            setError("Failed to load categories.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    function openAddModal() {
        setEditingCategory(null);
        setFormError(null);
        setIsModalOpen(true);
    }

    function openEditModal(category: Category) {
        setEditingCategory(category);
        setFormError(null);
        setIsModalOpen(true);
    }

    async function handleFormSubmit(data: CategoryFormValues) {
        setFormError(null);
        setIsSaving(true);
        try {
            if (editingCategory) {
                const updated = await updateCategory(editingCategory.id, data);
                setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                showToast("Category updated successfully.");
            } else {
                const created = await createCategory(data);
                setCategories((prev) => [...prev, created]);
                showToast("Category created successfully.");
            }
            setIsModalOpen(false);
        } catch (err) {
            const axiosError = err as import("axios").AxiosError<{ errors?: Record<string, string[]> }>;
            const backendErrors = axiosError.response?.data?.errors;
            setFormError(
                backendErrors?.name?.[0] ?? backendErrors?.general?.[0] ?? "Something went wrong. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(category: Category) {
        const confirmed = window.confirm(
            `Delete "${category.name}"? This will also delete every transaction in this category. This cannot be undone.`,
        );
        if (!confirmed) return;

        setDeletingId(category.id);
        try {
            await deleteCategory(category.id);
            setCategories((prev) => prev.filter((c) => c.id !== category.id));
            showToast("Category deleted successfully.");
        } catch {
            window.alert("Failed to delete this category. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Categories</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Organize your income and expenses into categories.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                    <Plus className="h-4 w-4" />
                    Add category
                </button>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
                {isLoading && <LoadingState message="Loading categories..." />}

                {!isLoading && error && <ErrorState message={error} onRetry={loadCategories} />}

                {!isLoading && !error && categories.length === 0 && (
                    <EmptyState
                        icon={Tag}
                        title="No categories yet"
                        description="Create your first category to start organizing your income and expenses."
                        action={
                            <button
                                type="button"
                                onClick={openAddModal}
                                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                                Add category
                            </button>
                        }
                    />
                )}

                {!isLoading && !error && categories.length > 0 && (
                    <ul className="divide-y divide-neutral-100">
                        {categories.map((category) => (
                            <li key={category.id} className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                                        style={{ backgroundColor: category.color }}
                                    >
                                        {category.name.slice(0, 1).toUpperCase()}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">{category.name}</p>
                                        <p className="text-xs capitalize text-neutral-500">{category.type}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(category)}
                                        disabled={deletingId === category.id}
                                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={`Edit ${category.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(category)}
                                        disabled={deletingId === category.id}
                                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-danger-50 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={`Delete ${category.name}`}
                                    >
                                        {deletingId === category.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (isSaving) return;
                    setIsModalOpen(false);
                    setFormError(null);
                }}
                title={editingCategory ? "Edit category" : "Add category"}
            >
                {formError && (
                    <div className="mb-4 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                        {formError}
                    </div>
                )}
                <CategoryForm
                    initialValues={editingCategory ?? undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}