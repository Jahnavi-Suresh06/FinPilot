import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    tone: "positive" | "negative" | "neutral";
}

// Maps each tone to its icon background/text colors, keeping the
// color-meaning logic in one place rather than repeated per usage.
const TONE_STYLES = {
    positive: { bg: "bg-success-50", text: "text-success-600" },
    negative: { bg: "bg-danger-50", text: "text-danger-600" },
    neutral: { bg: "bg-primary-50", text: "text-primary-600" },
};

export default function SummaryCard({ label, value, icon: Icon, tone }: SummaryCardProps) {
    const styles = TONE_STYLES[tone];

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-500">{label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${styles.bg}`}>
                    <Icon className={`h-4 w-4 ${styles.text}`} />
                </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-neutral-900">{value}</p>
        </div>
    );
}