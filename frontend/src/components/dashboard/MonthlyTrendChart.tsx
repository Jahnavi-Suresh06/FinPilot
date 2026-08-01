import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import type { MonthlyTrendItem } from "../../types/analytics";
import { formatCurrency } from "../../utils/formatters";

interface MonthlyTrendChartProps {
    data: MonthlyTrendItem[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
    const chartData = data.map((item) => ({
        label: item.label,
        Income: Number(item.income),
        Expense: Number(item.expense),
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: "#f9fafb" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}