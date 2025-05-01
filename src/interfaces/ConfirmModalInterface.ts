export interface ConfirmModalInterface {
    message: string;
    show: boolean;
    callback: (() => void) | null;
}
