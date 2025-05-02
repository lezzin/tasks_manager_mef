<script setup lang="ts">
import type { TaskPriority } from "@/interfaces/Task";
import { getPriorityIcon } from "@/utils/priorityUtils";

interface GeneralLegendProps {
    counter: number;
    priority: TaskPriority;
    priorityClass: string;
}

const priorities: Record<string, string> = {
    "priority-high": "Alta prioridade",
    "priority-medium": "Média prioridade",
    "priority-low": "Baixa prioridade",
    completed: "Concluída",
};

defineProps<GeneralLegendProps>();
const emit = defineEmits<{
    (e: "focus"): void;
    (e: "unfocus"): void;
}>();
</script>

<template>
    <div
        class="legend__item"
        :class="priorityClass"
        @mouseover="emit('focus')"
        @mouseleave="emit('unfocus')"
        aria-label="Tarefas concluídas: {{ counter }}"
        tabindex="0"
    >
        <p class="text text--small">
            <fa :icon="getPriorityIcon(priority)" />
            {{ priorities[priorityClass] }} ({{ counter }})
        </p>
    </div>
</template>
