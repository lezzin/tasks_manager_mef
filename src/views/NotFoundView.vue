<script setup lang="ts">
import { onMounted } from "vue";
import { useLoadingStore } from "../stores/loadingStore.ts";
import ImageResponsive from "../components/shared/ImageResponsive.vue";
import { useAuthStore } from "../stores/authStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";
import { baseUrl } from "@/utils/urlUtils.ts";

const loadingStore = useLoadingStore();
const sidebarStore = useSidebarStore();
const { user } = useAuthStore();

onMounted(() => {
    sidebarStore.setShowSidebarToggler(false);
    loadingStore.hideLoader();
});
</script>

<template>
    <div class="container image-centered" role="alert" aria-live="assertive">
        <RouterLink to="/" title="Voltar para o início">
            <div class="image-container">
                <img
                    :src="baseUrl('not_found.svg')"
                    alt="Ícone de localização com X"
                    width="400"
                    height="400"
                />

                <span class="text">Página não encontrada</span>
            </div>
        </RouterLink>
    </div>
</template>
