<script setup lang="ts">
import { onMounted } from "vue";
import { useLoadingStore } from "../stores/loadingStore.ts";
import ImageResponsive from "../components/shared/ImageResponsive.vue";
import { useAuthStore } from "../stores/authStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";

const loadingStore = useLoadingStore();
const sidebarStore = useSidebarStore();
const { user } = useAuthStore();

onMounted(() => {
    if (!user) {
        sidebarStore.setShowSidebarToggler(false);
    }

    loadingStore.hideLoader();
});
</script>

<template>
    <div class="container image-centered" role="alert" aria-live="assertive">
        <RouterLink to="/" title="Voltar para o início">
            <ImageResponsive
                small="not_found_sm.png"
                lg="not_found_lg.png"
                alt="Homem segurando uma lupa e frase de página não encontrada"
            />
        </RouterLink>
    </div>
</template>
