import api from "./api";

export interface ExportFilters {
    type?: "income" | "expense";
    category_id?: number;
    start_date?: string;
    end_date?: string;
}

/**
 * Downloads a file from the backend and triggers the browser save dialog.
 */
async function triggerDownload(
    url: string,
    params: ExportFilters,
    filename: string
) {
    const response = await api.get(url, {
        params,
        responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
}

export async function exportTransactionsCsv(
    filters: ExportFilters = {}
) {
    const today = new Date().toISOString().slice(0, 10);

    await triggerDownload(
        "/export/transactions/csv",
        filters,
        `finpilot_transactions_${today}.csv`
    );
}

export async function exportMonthlyReportPdf(
    month: number,
    year: number
) {
    await triggerDownload(
        "/export/report/pdf",
        { month, year } as ExportFilters,
        `finpilot_report_${year}_${String(month).padStart(2, "0")}.pdf`
    );
}