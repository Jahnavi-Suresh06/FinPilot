export type ToastType = "success" | "error";

export interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}