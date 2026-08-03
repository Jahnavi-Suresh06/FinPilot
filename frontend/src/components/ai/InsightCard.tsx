import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Insight } from "../../types/insight";

interface InsightCardProps {
    insight: Insight;
}

const SEVERITY_CONFIG = {
    critical: { icon: AlertCircle, bg: "bg-danger-50", text: "text-danger-600", border: "border-danger-500/20" },
    warning: { icon: AlertTriangle, bg: "bg-warning-50", text: "text-warning-500", border: "border-warning-500/20" },
    info: { icon: Info, bg: "bg-primary-50", text: "text-primary-600", border: "border-primary-500/20" },
};

export default function InsightCard({ insight }: InsightCardProps) {
    const config = SEVERITY_CONFIG[insight.severity];
    const Icon = config.icon;

    return (
        <div className={`flex gap-3 rounded-xl border p-4 ${config.border} ${config.bg}`}>
            <Icon className={`h-5 w-5 shrink-0 ${config.text}`} />
            <div>
                <p className="text-sm font-semibold text-neutral-900">{insight.title}</p>
                <p className="mt-0.5 text-sm text-neutral-600">{insight.message}</p>
            </div>
        </div>
    );
}