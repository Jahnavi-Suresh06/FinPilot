import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const MONTH_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export interface SelectedPeriod {
    month: number;
    year: number;
}

interface MonthYearSelectorProps {
    value: SelectedPeriod | null;
    onChange: (value: SelectedPeriod | null) => void;
}

function currentPeriod(): SelectedPeriod {
    const today = new Date();
    return { month: today.getMonth() + 1, year: today.getFullYear() };
}

export default function MonthYearSelector({ value, onChange }: MonthYearSelectorProps) {
    const isAllTime = value === null;

    function goToPreviousMonth() {
        const base = value ?? currentPeriod();
        let { month, year } = base;
        month -= 1;
        if (month === 0) {
            month = 12;
            year -= 1;
        }
        onChange({ month, year });
    }

    function goToNextMonth() {
        const base = value ?? currentPeriod();
        let { month, year } = base;
        month += 1;
        if (month === 13) {
            month = 1;
            year += 1;
        }
        onChange({ month, year });
    }

    function handleSelectMonthly() {
        if (isAllTime) {
            onChange(currentPeriod());
        }
    }

    return (
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
            <button
                type="button"
                onClick={() => onChange(null)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${isAllTime ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"
                    }`}
            >
                All Time
            </button>

            <div
                className={`flex items-center gap-1 rounded-md px-1 py-1 text-sm font-semibold transition ${!isAllTime ? "bg-neutral-900 text-white" : "text-neutral-600"
                    }`}
            >
                <button
                    type="button"
                    onClick={isAllTime ? handleSelectMonthly : goToPreviousMonth}
                    aria-label="Previous month"
                    className={`rounded p-1 transition ${!isAllTime ? "hover:bg-white/10" : "hover:bg-neutral-50"
                        }`}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={handleSelectMonthly}
                    className="flex items-center gap-1.5 px-1.5"
                >
                    <Calendar className="h-3.5 w-3.5" />
                    {isAllTime ? "Select month" : `${MONTH_LABELS[value!.month - 1]} ${value!.year}`}
                </button>

                <button
                    type="button"
                    onClick={isAllTime ? handleSelectMonthly : goToNextMonth}
                    aria-label="Next month"
                    className={`rounded p-1 transition ${!isAllTime ? "hover:bg-white/10" : "hover:bg-neutral-50"
                        }`}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}