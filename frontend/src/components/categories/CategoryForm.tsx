import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import { categorySchema } from "../../schemas/categorySchemas";
import type { CategoryFormValues } from "../../schemas/categorySchemas";
import type { Category } from "../../types/category";

interface CategoryFormProps {
    initialValues?: Category;
    onSubmit: (data: CategoryFormValues) => Promise<void>;
    onCancel: () => void;
}

// A small curated palette for category colors — constrains users to
// visually pleasant, on-brand choices rather than an unrestricted
// color picker, which is both simpler to build and better design practice.
const COLOR_OPTIONS = [
    { label: "Indigo", value: "#6366F1" },
    { label: "Green", value: "#10B981" },
    { label: "Red", value: "#EF4444" },
    { label: "Amber", value: "#F59E0B" },
    { label: "Blue", value: "#3B82F6" },
    { label: "Pink", value: "#EC4899" },
];

export default function CategoryForm({ initialValues, onSubmit, onCancel }: CategoryFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: initialValues
            ? {
                name: initialValues.name,
                type: initialValues.type,
                icon: initialValues.icon,
                color: initialValues.color,
            }
            : {
                name: "",
                type: "expense",
                icon: "circle",
                color: "#6366F1",
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
                id="name"
                label="Category name"
                placeholder="e.g. Groceries"
                error={errors.name?.message}
                {...register("name")}
            />

            <FormSelect
                id="type"
                label="Type"
                error={errors.type?.message}
                options={[
                    { label: "Expense", value: "expense" },
                    { label: "Income", value: "income" },
                ]}
                {...register("type")}
            />

            <FormSelect
                id="color"
                label="Color"
                error={errors.color?.message}
                options={COLOR_OPTIONS}
                {...register("color")}
            />

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {initialValues ? "Save changes" : "Add category"}
                </button>
            </div>
        </form>
    );
}