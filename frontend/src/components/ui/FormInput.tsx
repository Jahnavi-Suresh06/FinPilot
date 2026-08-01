import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

/**
 * A styled text input with a label and inline validation error message,
 * used across every form in FinPilot (auth forms now, transaction/budget
 * forms in later phases). Built with forwardRef so React Hook Form can
 * directly attach its own ref for tracking input state.
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, id, ...rest }, ref) => {
        return (
            <div className="w-full">
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {label}
                </label>
                <input
                    ref={ref}
                    id={id}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/30 ${error
                            ? "border-danger-500 focus:border-danger-500"
                            : "border-neutral-200 focus:border-primary-500"
                        }`}
                    {...rest}
                />
                {error && <p className="mt-1.5 text-xs font-medium text-danger-600">{error}</p>}
            </div>
        );
    },
);

FormInput.displayName = "FormInput";

export default FormInput;