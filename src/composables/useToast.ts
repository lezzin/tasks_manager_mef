import type { ToastInterface, ToastType } from "@/interfaces/Toast.ts";

import { reactive } from "vue";
import { TOAST_TIMEOUT } from "../utils/variables.ts";

const toast = reactive<ToastInterface>({
    show: false,
    type: "success",
    text: "",
});

let timeout: number;

function showToast(type: ToastType, message: string) {
    toast.type = type;
    toast.text = message;
    toast.show = true;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
        toast.show = false;
    }, TOAST_TIMEOUT);
}

function closeToast() {
    toast.show = false;
}

export function useToast() {
    return {
        toast,
        showToast,
        closeToast,
    };
}

export { type ToastInterface };
