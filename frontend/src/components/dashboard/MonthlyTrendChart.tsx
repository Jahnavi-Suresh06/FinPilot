import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import type { MonthlyTrendItem } from "../../types/analytics";
import { formatCurrency } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { TrendingUp } from "lucide-react";

interface MonthlyTrendChartProps {
    data: MonthlyTrendItem[];
}

export default function MonthlyTrendChart({
    data,
}: MonthlyTrendChartProps) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={TrendingUp}
                title="No monthly trend available"
                description="Add some transactions to view your income and expense trends."
            />
        );
    }

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                />

                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                        `₹${(Number(value) / 1000).toFixed(0)}k`
                    }
                />

                <Tooltip
                    formatter={(value) =>
                        formatCurrency(Number(value ?? 0))
                    }
                />

                <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                />

                <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />

                <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}