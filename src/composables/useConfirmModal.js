import { ref } from "vue";

const modalData = ref({
    message: "",
    show: false,
    callback: null,
});

const setConfirmModal = (message, callback) => {
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
