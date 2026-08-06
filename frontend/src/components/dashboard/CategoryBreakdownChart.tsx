import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { CategoryBreakdownItem } from "../../types/analytics";
import { formatCurrency } from "../../utils/formatters";
import EmptyState from "../states/EmptyState";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryBreakdownChartProps {
    data: CategoryBreakdownItem[];
}

export default function CategoryBreakdownChart({
    data,
}: CategoryBreakdownChartProps) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={PieChartIcon}
                title="No expense data yet"
                description="Add some expenses to see your spending breakdown."
            />
        );
    }

    const chartData = data.map((item) => ({
        name: item.category_name,
        value: Number(item.total),
        color: item.color,
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                >
                    {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Pie>

                <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                />

                <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 13 }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}