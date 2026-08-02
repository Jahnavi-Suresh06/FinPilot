import type { TopCategoryItem } from "../../types/analyticsExtras";
import { formatCurrency } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { ListOrdered } from "lucide-react";

interface TopCategoriesTableProps {
    categories: TopCategoryItem[];
}

export default function TopCategoriesTable({ categories }: TopCategoriesTableProps) {
    if (categories.length === 0) {
        return (
            <EmptyState
                icon={ListOrdered}
                title="No expense data yet"
                description="Your top spending categories will appear here."
            />
        );
    }

    return (
        <ul className="divide-y divide-neutral-100">
            {categories.map((cat, index) => (
                <li key={cat.category_id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-5 text-sm font-semibold text-neutral-400">{index + 1}</span>

                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                    />

                    <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{cat.category_name}</p>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${cat.percent_of_total}%`, backgroundColor: cat.color }}
                            />
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">{formatCurrency(cat.total)}</p>
                        <p className="text-xs text-neutral-500">{cat.percent_of_total}%</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}