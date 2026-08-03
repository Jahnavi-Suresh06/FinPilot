import api from "./api";

interface ExportFilters {
    type?: "income" | "expense";
    category_id?: number;
    start_date?: string;
    end_date?: string;
}

/**
 * Triggers a browser download for a given API endpoint + filters.
 * responseType: "blob" tells Axios to treat the response as raw binary
 * data instead of trying to parse it as JSON — essential for files.
 *
 * We then build a temporary, invisible <a> tag pointing at that binary
 * data (via a Blob URL), simulate a click on it to trigger the browser's
 * native save dialog, then clean up — this is the standard browser
 * pattern for downloading an authenticated file fetched via JS,
 * since a plain <a href> can't attach an Authorization header.
 */
async function triggerDownload(url: string, params: Record<string, unknown>, filename: string) {
    const response = await api.get(url, {
        params,
        responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
}

export async function exportTransactionsCsv(filters: ExportFilters = {}) {
    const today = new Date().toISOString().slice(0, 10);
    await triggerDownload("/export/transactions/csv", filters, `finpilot_transactions_${today}.csv`);
}

export async function exportMonthlyReportPdf(month: number, year: number) {
    await triggerDownload("/export/report/pdf", { month, year }, `finpilot_report_${year}_${String(month).padStart(2, "0")}.pdf`);
}