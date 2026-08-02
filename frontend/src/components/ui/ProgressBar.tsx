interface ProgressBarProps {
    percent: number;
}

/**
 * A color-coded progress bar: green while comfortably under budget,
 * amber when approaching the limit, red once over. Used for budget
 * tracking now; general enough to reuse anywhere else a "progress
 * toward a limit" visualization is useful later.
 */
export default function ProgressBar({ percent }: ProgressBarProps) {
    const clamped = Math.min(percent, 100); // visually cap the bar fill at 100%, even if over-budget
    const isOver = percent >= 100;
    const isNearLimit = percent >= 80 && percent < 100;

    const barColor = isOver ? "bg-danger-500" : isNearLimit ? "bg-warning-500" : "bg-success-500";

    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}