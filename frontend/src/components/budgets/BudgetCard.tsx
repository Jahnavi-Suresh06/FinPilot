import { Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import type { Budget } from "../../types/budget";
import { formatCurrency } from "../../utils/formatters";
import ProgressBar from "../ui/ProgressBar";

interface BudgetCardProps {
    budget: Budget;
    onEdit: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    isDeleting?: boolean;
}

export default function BudgetCard({ budget, onEdit, onDelete, isDeleting = false }: BudgetCardProps) {
    const isOver = budget.percent_used >= 100;

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: budget.category?.color ?? "#9CA3AF" }}
                    >
                        {(budget.category?.name ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">
                            {budget.category?.name ?? "Unknown category"}
                        </p>
                        <p className="text-xs text-neutral-500">
                            Limit: {formatCurrency(budget.limit_amount)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit(budget)}
                        disabled={isDeleting}
                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Edit budget"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(budget)}
                        disabled={isDeleting}
                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-danger-50 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Delete budget"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <ProgressBar percent={budget.percent_used} />
                <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">
                        {formatCurrency(budget.spent)} spent
                    </span>
                    <span className={isOver ? "font-semibold text-danger-600" : "text-neutral-500"}>
                        {isOver
                            ? `${formatCurrency(Math.abs(Number(budget.remaining)))} over`
                            : `${formatCurrency(budget.remaining)} left`}
                    </span>
                </div>
            </div>

            {isOver && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    You've exceeded this budget.
                </div>
            )}
        </div>
    );
}