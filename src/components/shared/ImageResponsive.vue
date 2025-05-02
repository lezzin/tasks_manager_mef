<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { baseUrl } from "../../utils/urlUtils";

interface ImageResponsiveProps {
    small: string;
    lg: string;
    alt?: string;
}

const props = defineProps<ImageResponsiveProps>();

const isSmallScreen = ref<boolean>(window.innerWidth < 768);

const updateScreenSize = () => {
    isSmallScreen.value = window.innerWidth < 768;
};

onMounted(() => {
    window.addEventListener("resize", updateScreenSize);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", updateScreenSize);
});
</script>

<template>
    <img v-if="isSmallScreen" :src="baseUrl(props.small)" :alt="props.alt" loading="lazy" />
    <img v-else :src="baseUrl(props.lg)" :alt="props.alt" loading="lazy" />
</template>
