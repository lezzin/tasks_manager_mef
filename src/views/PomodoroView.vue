<script setup lang="ts">
import { useLoadingStore } from "../stores/loadingStore";
import { useSidebarStore } from "../stores/sidebarStore";
import { useTask } from "../composables/useTask";

import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import PomodoroTimer from "../components/pomodoro/PomodoroTimer.vue";
import PomodoroInformation from "../components/pomodoro/PomodoroInformation.vue";
import PomodoroHeader from "@/components/pomodoro/PomodoroHeader.vue";

const { checkUserTasks } = useTask();
const loadingStore = useLoadingStore();
const sidebarStore = useSidebarStore();

const hasAnyTask = ref(false);

onMounted(async () => {
    sidebarStore.setShowSidebarToggler(false);
    loadingStore.hideLoader();
    hasAnyTask.value = await checkUserTasks();
});
</script>

<template>
    <section class="pomodoro-wrapper" id="s-pomodoro">
        <div class="container">
            <PomodoroHeader />
            <PomodoroTimer :hasTasks="hasAnyTask" />
        </div>
    </section>

    <section class="information-wrapper container" id="s-help">
        <PomodoroInformation />
    </section>
</template>

<style scoped>
.pomodoro-wrapper {
    color: var(--details-color);
    background: var(--details-color-light);
    background: -webkit-linear-gradient(
        to right,
        var(--details-color-light-2),
        var(--details-color-light)
    );
    background: linear-gradient(to right, var(--details-color-light-2), var(--details-color-light));
}

.pomodoro-wrapper .container {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 100vh;
}

.information-wrapper {
    display: grid;
    place-items: center;
    max-width: 720px;
    min-height: 90vh;
    padding: calc(var(--padding) * 2) var(--padding);
}
</style>
