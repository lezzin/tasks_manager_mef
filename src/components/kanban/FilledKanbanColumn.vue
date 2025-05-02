<script setup lang="ts">
import type { DragAction, TaskDirection } from "@/interfaces/Kanban";
import type { Task, TaskStatus } from "@/interfaces/Task";

import { getPriorityClass, getPriorityIcon, getPriorityText } from "@/utils/priorityUtils";
import UIButton from "../ui/UIButton.vue";
import { computed } from "vue";
import { useSidebarStore } from "@/stores/sidebarStore";

interface FilledKanbanColumnProps {
    task: Task;
    kanbanStatus: TaskStatus;
}

const props = defineProps<FilledKanbanColumnProps>();
const emit = defineEmits<{
    (e: "onDragEnter"): void;
    (e: "dragEvents", event?: DragEvent, action?: DragAction, task?: Task): void;
    (e: "moveTask", task: Task, direction: TaskDirection): void;
    (e: "onDrop"): void;
}>();

const sidebarStore = useSidebarStore();

const isFirstColumn = (kanbanStatus: string): boolean => kanbanStatus === "todo";
const isLastColumn = (kanbanStatus: string): boolean => kanbanStatus === "completed";

const link = computed<string>(() => `/topic/${props.task.topicId}?focus=${props.task.id}`);
</script>

<template>
    <div
        :class="['task', { completed: task.status }]"
        draggable="true"
        @dragstart="emit('dragEvents', $event, 'start', task)"
        @dragend="emit('dragEvents', $event, 'end')"
        :aria-labelledby="'task-' + task.id"
        role="listitem"
    >
        <p id="task-topic-{{ task.id }}" class="text text--small text--muted">
            {{ task.topicName }}
        </p>

        <RouterLink
            class="text text--bold truncate"
            :to="link"
            @click="() => (sidebarStore.isTopicSidebarActive = false)"
            style="--line-clamp: 1"
            :aria-labelledby="'task-' + task.id"
        >
            <span :id="'task-' + task.id">{{ task.name }}</span>
        </RouterLink>

        <div class="tags">
            <span
                :class="['tag', getPriorityClass(task.priority)]"
                :aria-label="getPriorityText(task.priority)"
            >
                <fa :icon="getPriorityIcon(task.priority)" />
                {{ getPriorityText(task.priority) }}
            </span>

            <template v-if="task.generatedByAI">
                <div class="tag ai-image">
                    <img src="/src/assets/img/gemini-logo.png" alt="Logo do Gemini" />
                    <span>gerado com IA</span>
                </div>
            </template>
        </div>

        <div class="task__navigation">
            <UIButton
                variant="outline-primary-small"
                @click="emit('moveTask', task, 'prev')"
                :disabled="isFirstColumn(kanbanStatus)"
                :aria-disabled="isFirstColumn(kanbanStatus)"
                title="Mover tarefa para a coluna anterior"
            >
                <fa icon="caret-left" />
                Anterior
            </UIButton>
            <UIButton
                variant="outline-primary-small"
                @click="emit('moveTask', task, 'next')"
                :disabled="isLastColumn(kanbanStatus)"
                :aria-disabled="isLastColumn(kanbanStatus)"
                title="Mover tarefa para a próxima coluna"
            >
                Próximo
                <fa icon="caret-right" />
            </UIButton>
        </div>
    </div>
</template>

<style scoped>
.tags {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.tag.ai-image {
    background: linear-gradient(90deg, rgba(0, 166, 255, 1) 0%, rgba(0, 255, 0, 0.8) 100%);

    img {
        width: 11px;
        aspect-ratio: 1;
        margin-right: 0.25rem;

        ~ span {
            font-weight: normal;
            color: var(--font-primary);
        }
    }
}
</style>
