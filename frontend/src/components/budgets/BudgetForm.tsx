import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import { budgetSchema } from "../../schemas/budgetSchemas";
import type { BudgetFormValues } from "../../schemas/budgetSchemas";
import type { Category } from "../../types/category";
import type { Budget } from "../../types/budget";

interface BudgetFormProps {
  categories: Category[];
  currentMonth: number;
  currentYear: number;
  initialValues?: Budget;
  onSubmit: (data: BudgetFormValues) => Promise<void>;
  onCancel: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetForm({
  categories,
  currentMonth,
  currentYear,
  initialValues,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialValues
      ? {
          category_id: initialValues.category_id,
          limit_amount: Number(initialValues.limit_amount),
          month: initialValues.month,
          year: initialValues.year,
        }
      : {
          category_id: 0,
          limit_amount: 0,
          month: currentMonth,
          year: currentYear,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        id="category_id"
        label="Category"
        error={errors.category_id?.message}
        options={[
          { label: "Select an expense category", value: "0" },
          ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
        ]}
        {...register("category_id")}
      />

      <FormInput
        id="limit_amount"
        label="Monthly limit (₹)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        error={errors.limit_amount?.message}
        {...register("limit_amount")}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          id="month"
          label="Month"
          error={errors.month?.message}
          options={MONTH_NAMES.map((name, i) => ({ label: name, value: String(i + 1) }))}
          {...register("month")}
        />
        <FormInput
          id="year"
          label="Year"
          type="number"
          error={errors.year?.message}
          {...register("year")}
        />
      </div>

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
          {initialValues ? "Save changes" : "Create budget"}
        </button>
      </div>
    </form>
  );
}