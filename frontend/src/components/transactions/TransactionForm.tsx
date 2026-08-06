import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import { transactionSchema } from "../../schemas/transactionSchemas";
import type { TransactionFormValues } from "../../schemas/transactionSchemas";
import type { Category } from "../../types/category";
import type { Transaction } from "../../types/transaction";
import type { CategoryType } from "../../types/category";

interface TransactionFormProps {
    type: CategoryType;
    categories: Category[];
    initialValues?: Transaction;
    onSubmit: (data: TransactionFormValues) => Promise<void>;
    onCancel: () => void;
}

export default function TransactionForm({
    type,
    categories,
    initialValues,
    onSubmit,
    onCancel,
}: TransactionFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: initialValues
            ? {
                category_id: initialValues.category_id,
                amount: Number(initialValues.amount),
                type: initialValues.type,
                date: initialValues.date,
                note: initialValues.note ?? "",
            }
            : {
                category_id: 0,
                amount: 0,
                type,
                date: new Date().toISOString().slice(0, 10),
                note: "",
            },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit as any)}
            className="space-y-4"
        >
            <input type="hidden" {...register("type")} value={type} />

            <FormSelect
                id="category_id"
                label="Category"
                error={errors.category_id?.message}
                options={[
                    { label: "Select a category", value: "0" },
                    ...categories.map((c) => ({
                        label: c.name,
                        value: String(c.id),
                    })),
                ]}
                {...register("category_id")}
            />

            <FormInput
                id="amount"
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                error={errors.amount?.message}
                {...register("amount")}
            />

            <FormInput
                id="date"
                label="Date"
                type="date"
                error={errors.date?.message}
                {...register("date")}
            />

            <FormInput
                id="note"
                label="Note (optional)"
                type="text"
                placeholder="e.g. Weekly groceries"
                error={errors.note?.message}
                {...register("note")}
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
                    {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {initialValues ? "Save changes" : "Add transaction"}
                </button>
            </div>
        </form>
    );
}