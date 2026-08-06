import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { CategoryTrendSeries } from "../../types/analyticsExtras";
import { formatCurrency } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { TrendingUp } from "lucide-react";

interface CategoryTrendChartProps {
    series: CategoryTrendSeries[];
}

export default function CategoryTrendChart({
    series,
}: CategoryTrendChartProps) {
    if (series.length === 0) {
        return (
            <EmptyState
                icon={TrendingUp}
                title="No spending data for this range"
                description="Try selecting a different date range, or add some expenses first."
            />
        );
    }

    const periodMap = new Map<string, Record<string, string | number>>();

    series.forEach((s) => {
        s.points.forEach((point) => {
            if (!periodMap.has(point.period)) {
                periodMap.set(point.period, {
                    period: point.period,
                    label: point.label,
                });
            }

            periodMap.get(point.period)![s.category_name] = Number(point.total);
        });
    });

    const chartData = Array.from(periodMap.values()).sort((a, b) =>
        String(a.period).localeCompare(String(b.period))
    );

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
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
                    tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`}
                />

                <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                />

                <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                />

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