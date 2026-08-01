import { Link } from "react-router-dom";
import type { Transaction } from "../../types/transaction";
import { formatCurrency, formatDate } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { Receipt } from "lucide-react";

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    if (transactions.length === 0) {
        return (
            <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Your recent activity will show up here."
            />
        );
    }

    return (
        <ul className="divide-y divide-neutral-100">
            {transactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: transaction.category.color }}
                        >
                            {transaction.category.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                            <p className="text-sm font-medium text-neutral-900">{transaction.category.name}</p>
                            <p className="text-xs text-neutral-500">{formatDate(transaction.date)}</p>
                        </div>
                    </div>
                    <span
                        className={`text-sm font-semibold ${transaction.type === "income" ? "text-success-600" : "text-danger-600"
                            }`}
                    >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                    </span>
                </li>
            ))}
            <li className="px-5 py-3 text-center">
                <Link
                    to={transactions[0]?.type === "income" ? "/income" : "/expenses"}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                    View all transactions
                </Link>
            </li>
        </ul>
    );
}