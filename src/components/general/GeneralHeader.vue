<script setup lang="ts">
import { useRouter } from "vue-router";
import UIButton from "../ui/UIButton.vue";

interface GeneralHeaderProps {
    isDownloading: boolean;
}

defineProps<GeneralHeaderProps>();
const emit = defineEmits<{
    (e: "download"): void;
}>();

const router = useRouter();
</script>

<template>
    <header class="task-view__header" role="banner">
        <h2 class="title" v-if="!isDownloading">Visualize as suas tarefas de uma maneira geral</h2>

        <div class="task-view__header-buttons" v-if="!isDownloading">
            <UIButton
                type="button"
                @click="emit('download')"
                variant="primary"
                isIcon
                title="Baixar todas as tarefas em PDF"
            >
                <fa icon="download" />
                <span class="sr-only">Baixar tarefas</span>
            </UIButton>
            <UIButton
                @click="() => router.back()"
                variant="outline-primary"
                isIcon
                title="Voltar para a página anterior"
            >
                <fa icon="arrow-left" />
                <span class="sr-only">Voltar</span>
            </UIButton>
        </div>
    </header>
</template>

<style scoped>
.task-view__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    height: 4.876vh;

    @media (width <=768px) {
        flex-direction: column;
        padding-top: var(--padding);
        gap: 1rem;
        height: auto;
    }

    .task-view__header-buttons {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
}
</style>
