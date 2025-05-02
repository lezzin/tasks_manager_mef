<script setup lang="ts">
import type { DragAction, TaskDirection } from "@/interfaces/Kanban";
import type { Task, TaskStatus } from "@/interfaces/Task";

import { getPriorityClass, getPriorityIcon, getPriorityText } from "@/utils/priorityUtils";
import UIButton from "../ui/UIButton.vue";

interface FilledKanbanColumnProps {
    task: Task;
    kanbanStatus: TaskStatus;
}

defineProps<FilledKanbanColumnProps>();
const emit = defineEmits<{
    (e: "onDragEnter"): void;
    (e: "dragEvents", event?: DragEvent, action?: DragAction, task?: Task): void;
    (e: "moveTask", task: Task, direction: TaskDirection): void;
    (e: "onDrop"): void;
}>();

const isFirstColumn = (kanbanStatus: string): boolean => kanbanStatus === "todo";
const isLastColumn = (kanbanStatus: string): boolean => kanbanStatus === "completed";
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
            :to="'/topic/' + task.topicId"
            style="--line-clamp: 1"
            :aria-labelledby="'task-' + task.id"
        >
            <span :id="'task-' + task.id">{{ task.name }}</span>
        </RouterLink>

        <span
            :class="['tag', getPriorityClass(task.priority)]"
            :aria-label="getPriorityText(task.priority)"
        >
            <fa :icon="getPriorityIcon(task.priority)" />
            {{ getPriorityText(task.priority) }}
        </span>

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
