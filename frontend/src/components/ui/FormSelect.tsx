import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

interface Option {
    label: string;
    value: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options: Option[];
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ label, error, options, id, ...rest }, ref) => {
        return (
            <div className="w-full">
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {label}
                </label>
                <select
                    ref={ref}
                    id={id}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:ring-2 focus:ring-primary-500/30 ${error
                            ? "border-danger-500 focus:border-danger-500"
                            : "border-neutral-200 focus:border-primary-500"
                        }`}
                    {...rest}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1.5 text-xs font-medium text-danger-600">{error}</p>}
            </div>
        );
    },
);

FormSelect.displayName = "FormSelect";

export default FormSelect;