<script setup lang="ts">
import { useSidebarStore } from "@/stores/sidebarStore";
import TopicFormAdd from "../forms/TopicFormAdd.vue";
import TopicNavigation from "../topic/TopicNavigation.vue";
import type { Topic } from "@/interfaces/Topic";

interface MySidebarProps {
    data?: Topic[] | null;
}

defineProps<MySidebarProps>();

const sidebarStore = useSidebarStore();
</script>
<template>
    <Transition name="slide">
        <nav
            class="home-aside"
            aria-label="Navegação de tópicos"
            v-if="sidebarStore.isTopicSidebarActive"
            ref="aside"
        >
            <TopicFormAdd />
            <span class="divider" role="separator" aria-hidden="true"></span>
            <TopicNavigation :data="data" @close="sidebarStore.closeSidebar" />
        </nav>
    </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: all var(--screen-transition) ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
    opacity: 0;
}
</style>
