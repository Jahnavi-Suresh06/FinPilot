import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface ComparisonCardProps {
    label: string;
    currentValue: string;
    changePercent: number | null;
    // For expenses, a rise is BAD (danger); for income, a rise is GOOD (success).
    // This lets the same component correctly color-code both cases.
    invertColors?: boolean;
}

export default function ComparisonCard({
    label,
    currentValue,
    changePercent,
    invertColors = false,
}: ComparisonCardProps) {
    const isFlat = changePercent === null || changePercent === 0;
    const isUp = !isFlat && changePercent > 0;

    // "Good" direction depends on context: income going up is good (green),
    // expenses going up is bad (red) — invertColors flips which direction
    // maps to which color.
    const isGood = invertColors ? !isUp : isUp;

    const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
    const colorClass = isFlat ? "text-neutral-400" : isGood ? "text-success-600" : "text-danger-600";

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{formatCurrency(currentValue)}</p>
            <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${colorClass}`}>
                <Icon className="h-3.5 w-3.5" />
                {changePercent === null ? (
                    <span>No prior data</span>
                ) : (
                    <span>
                        {changePercent > 0 ? "+" : ""}
                        {changePercent}% vs last month
                    </span>
                )}
            </div>
        </div>
    );
}
