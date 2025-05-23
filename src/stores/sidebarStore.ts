import { defineStore } from "pinia";
import { ref } from "vue";

export const useSidebarStore = defineStore("sidebar", () => {
    const isTopicSidebarActive = ref(false);
    const canShowSidebarToggler = ref(true);

    const toggleSidebar = () => {
        isTopicSidebarActive.value = !isTopicSidebarActive.value;
    };

    const closeSidebar = () => {
        isTopicSidebarActive.value = false;
    };

    const setShowSidebarToggler = (value: boolean) => {
        canShowSidebarToggler.value = value;
    };

    const setSidebarActive = (value: boolean) => {
        isTopicSidebarActive.value = value;
    };

    return {
        toggleSidebar,
        closeSidebar,
        setShowSidebarToggler,
        setSidebarActive,
        isTopicSidebarActive,
        canShowSidebarToggler,
    };
});
