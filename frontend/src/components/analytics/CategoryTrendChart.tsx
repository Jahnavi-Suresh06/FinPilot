import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CategoryTrendSeries } from "../../types/analyticsExtras";
import { formatCurrency } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { TrendingUp } from "lucide-react";

interface CategoryTrendChartProps {
    series: CategoryTrendSeries[];
}

export default function CategoryTrendChart({ series }: CategoryTrendChartProps) {
    if (series.length === 0) {
        return (
            <EmptyState
                icon={TrendingUp}
                title="No spending data for this range"
                description="Try selecting a different date range, or add some expenses first."
            />
        );
    }

    // Recharts' LineChart expects ONE flat array of data points, where each
    // point object has a key per line (category). Our backend instead gives
    // us one series PER category, each with its own points array — so we
    // reshape it here: merge every category's points into shared rows keyed
    // by period, e.g. { period: "2026-08", label: "Aug 2026", "Groceries": 4500, "Rent": 15000 }
    const periodMap = new Map<string, Record<string, string | number>>();

    series.forEach((s) => {
        s.points.forEach((point) => {
            if (!periodMap.has(point.period)) {
                periodMap.set(point.period, { period: point.period, label: point.label });
            }
            periodMap.get(point.period)![s.category_name] = Number(point.total);
        });
    });

    const chartData = Array.from(periodMap.values()).sort((a, b) =>
        String(a.period).localeCompare(String(b.period)),
    );

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                {series.map((s) => (
                    <Line
                        key={s.category_id}
                        type="monotone"
                        dataKey={s.category_name}
                        stroke={s.color}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}