/**
 * Centralized formatting helpers used across the entire app.
 * FinPilot is built for an Indian user base, so currency and number
 * formatting default to INR (₹) and Indian digit grouping
 * (e.g. ₹1,25,000.00, not ₹125,000.00) everywhere in the app.
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/**
 * Formats a raw amount (number or numeric string) as Indian Rupees,
 * e.g. formatCurrency("125000") -> "₹1,25,000.00"
 */
export function formatCurrency(amount: number | string): string {
    return INR_FORMATTER.format(Number(amount));
}

/**
 * Formats a YYYY-MM-DD date string for display, e.g. "Aug 1, 2026".
 * The "T00:00:00" suffix forces local-time parsing, avoiding the
 * off-by-one-day bug that occurs when parsing a date-only string
 * directly (JavaScript would otherwise interpret it as UTC midnight).
 */
export function formatDate(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}