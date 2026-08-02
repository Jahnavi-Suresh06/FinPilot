interface DateRangeSelectorProps {
    preset: "3m" | "6m" | "12m";
    onChange: (preset: "3m" | "6m" | "12m") => void;
}

const PRESETS: { label: string; value: "3m" | "6m" | "12m" }[] = [
    { label: "Last 3 months", value: "3m" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last 12 months", value: "12m" },
];

export default function DateRangeSelector({ preset, onChange }: DateRangeSelectorProps) {
    return (
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
            {PRESETS.map((p) => (
                <button
                    key={p.value}
                    type="button"
                    onClick={() => onChange(p.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${preset === p.value
                            ? "bg-primary-600 text-white"
                            : "text-neutral-600 hover:bg-neutral-50"
                        }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}