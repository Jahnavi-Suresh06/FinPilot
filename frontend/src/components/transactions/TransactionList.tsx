import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    deletingId?: number | null;
}

export default function TransactionList({
    transactions,
    onEdit,
    onDelete,
    deletingId = null,
}: TransactionListProps) {
    return (
        <ul className="divide-y divide-neutral-100">
            {transactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <span
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: transaction.category.color }}
                        >
                            {transaction.category.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                            <p className="text-sm font-medium text-neutral-900">{transaction.category.name}</p>
                            <p className="text-xs text-neutral-500">
                                {formatDate(transaction.date)}
                                {transaction.note ? ` · ${transaction.note}` : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span
                            className={`text-sm font-semibold ${transaction.type === "income" ? "text-success-600" : "text-danger-600"
                                }`}
                        >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onEdit(transaction)}
                                disabled={deletingId === transaction.id}
                                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Edit transaction"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(transaction)}
                                disabled={deletingId === transaction.id}
                                className="rounded-lg p-2 text-neutral-400 transition hover:bg-danger-50 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Delete transaction"
                            >
                                {deletingId === transaction.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}