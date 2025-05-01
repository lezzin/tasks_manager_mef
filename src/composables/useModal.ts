import { ref } from "vue";

export const useModal = () => {
    const show = ref<boolean>(false);
    const component = ref(null);

    return {
        component,
        show,
        showModal: () => (show.value = true),
        hideModal: () => (show.value = false),
    };
};
