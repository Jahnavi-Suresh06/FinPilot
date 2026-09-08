import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import type { CategoryBreakdownItem } from "../../types/analytics";
import { formatCurrency } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryBreakdownChartProps {
    data: CategoryBreakdownItem[];
}

function truncateLabel(name: string, maxLength = 16): string {
    return name.length > maxLength ? `${name.slice(0, maxLength - 1)}…` : name;
}

export default function CategoryBreakdownChart({
    data,
}: CategoryBreakdownChartProps) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={PieChartIcon}
                title="No expense data available for this period"
                description="Try selecting a different month, or add some expenses to see your spending breakdown."
            />
        );
    }

    const chartData = [...data]
        .map((item) => ({
            name: item.category_name,
            label: truncateLabel(item.category_name),
            value: Number(item.total),
            color: item.color,
        }))
        .sort((a, b) => b.value - a.value);

    const chartHeight = Math.max(280, chartData.length * 44);

    return (
        <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                <XAxis
                    type="number"
                    tickFormatter={(value) => formatCurrency(Number(value))}
                    tick={{ fontSize: 12 }}
                />

                <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fontSize: 13 }}
                />

                <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    labelFormatter={(_, payload) =>
                        payload && payload[0] ? payload[0].payload.name : ""
                    }
                />

                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                    {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}