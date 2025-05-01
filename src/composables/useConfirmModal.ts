import type { ConfirmModalInterface } from "@/interfaces/ConfirmModalInterface";
import { ref } from "vue";

const modalData = ref<ConfirmModalInterface>({
    message: "",
    show: false,
    callback: null,
});

const setConfirmModal = (message: string, callback: (() => void) | null) => {
    modalData.value.show = true;
    modalData.value.message = message;
    modalData.value.callback = callback;
};

const hideConfirmModal = () => {
    modalData.value.show = false;
};

export const useConfirmModal = () => {
    return {
        setConfirmModal,
        hideConfirmModal,
        modalData,
    };
};
