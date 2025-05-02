<script setup lang="ts">
import { useRouter } from "vue-router";
import UIButton from "../ui/UIButton.vue";

const router = useRouter();

const goToHelp = () => {
    const helpSectionTop = document.querySelector("#s-help" as any).getBoundingClientRect().top;

    window.scroll({
        top: helpSectionTop + window.scrollY,
        behavior: "smooth",
    });
};
</script>

<template>
    <div class="pomodoro__absolute">
        <UIButton
            @click="() => router.back()"
            variant="outline-primary"
            title="Voltar para a página anterior"
        >
            <fa icon="arrow-left" />
            <span>Voltar</span>
        </UIButton>

        <UIButton variant="outline-primary" isIcon title="Acessar ajuda" @click="goToHelp">
            <fa icon="circle-question" />
        </UIButton>
    </div>
</template>

<style scoped>
.pomodoro__absolute {
    position: absolute;
    top: 1.5rem;
    right: var(--padding);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.pomodoro__absolute button {
    padding: 0.74rem 1rem;
}
</style>
