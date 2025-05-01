export type ToastType = "danger" | "warning" | "success";

export interface ToastInterface {
    show: boolean;
    type: ToastType;
    text: string;
}
