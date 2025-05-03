<script setup lang="ts">
import type { DragAction, TaskDirection, TaskList } from "@/interfaces/Kanban";
import type { Task, TaskStatus } from "@/interfaces/Task";

import EmptyKanbanColumn from "./EmptyKanbanColumn.vue";
import FilledKanbanColumn from "./FilledKanbanColumn.vue";

interface KanbanColumnProps {
    kanbanStatuses: TaskStatus[];
    activeColumn: string | null;
    tasks: TaskList;
}

type KanbanColumnEmits = {
    (e: "onDragEnter", event: DragEvent, kanbanStatus: TaskStatus): void;
    (e: "dragEvents", event?: DragEvent, action?: DragAction, task?: Task): void;
    (e: "moveTask", task: Task, direction: TaskDirection): void;
    (e: "onDrop", kanbanStatus: TaskStatus): void;
};

defineProps<KanbanColumnProps>();
const emit = defineEmits<KanbanColumnEmits>();

const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
        todo: "Para fazer",
        doing: "Em andamento",
        completed: "Concluído",
    };

    return statuses[status] ?? "Desconhecido";
};

const onDragOver = (event: DragEvent) => {
    event.preventDefault();
};

const drop = (kanbanStatus: TaskStatus) => emit("onDrop", kanbanStatus);

const drag = (event?: DragEvent, phase?: "start" | "end", task?: Task) =>
    emit("dragEvents", event, phase, task);

const dragEnter = (event: DragEvent, status: TaskStatus) => {
    emit("onDragEnter", event, status);
};

const moveTask = (task: Task, direction: TaskDirection) => emit("moveTask", task, direction);
</script>

<template>
    <div
        v-for="kanbanStatus in kanbanStatuses"
        :key="kanbanStatus"
        class="kanban__column"
        :class="{ 'drag-over': activeColumn === kanbanStatus }"
        :aria-label="getStatusLabel(kanbanStatus)"
        role="region"
    >
        <h3 class="subtitle">
            {{ getStatusLabel(kanbanStatus) }}
        </h3>

        <div
            class="kanban__tasks"
            role="list"
            @drop="drop(kanbanStatus)"
            @dragover="onDragOver"
            @dragenter="(event) => dragEnter(event, kanbanStatus)"
        >
            <EmptyKanbanColumn v-if="tasks[kanbanStatus].length === 0" />
            <FilledKanbanColumn
                v-else
                v-for="task in tasks[kanbanStatus]"
                :key="task.id"
                :task="task"
                :kanbanStatus="kanbanStatus"
                @drop="drop"
                @dragover="onDragOver"
                @dragenter="dragEnter"
                @dragEvents="drag"
                @moveTask="moveTask"
            />
        </div>
    </div>
</template>

<style>
.kanban__column {
    border: 1px dashed transparent;
    min-height: 70dvh;

    &.drag-over > .subtitle {
        border-bottom-color: var(--details-color);
    }

    > .subtitle {
        border-bottom: 3px solid transparent;
        margin-bottom: 0.6rem;
        position: sticky;
        font-size: 1.4rem;
        top: calc(10vh - 1px);
        padding-block: 1rem;
        background-color: var(--bg-secondary);
        z-index: 1;
        transition: border-bottom-color var(--screen-transition) ease;

        @media (width<=768px) {
            top: 0;
        }
    }

    .kanban__tasks {
        border: 1px solid transparent;
        border-radius: var(--radius);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        /* padding-inline: var(--padding); */

        .task {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            border: 1px solid var(--border-color);
            padding: 1.4rem var(--padding);
            border-radius: var(--radius);
            background-color: transparent;
            transition: all 0.3s ease;
            cursor: move;

            &.dragging {
                border-style: dashed;
                opacity: 0.6;
            }

            &:not(.task--empty) {
                box-shadow: var(--shadow-sm);
            }

            &.task--empty {
                cursor: not-allowed;
                align-items: center;
                justify-content: center;
                border-style: dashed;
                font-size: 1.8rem;
                gap: 0.5rem;
                padding: 3.1879rem 0;
            }

            a.text {
                text-decoration: none;
            }

            .tag {
                border-radius: calc(var(--radius) * 2);
            }

            .task__navigation {
                display: none;
                justify-content: space-between;
                align-items: center;
                margin-top: 1.5rem;
                gap: 0.5rem;
                width: 100%;

                @media (width<=768px) {
                    display: flex;
                }
            }
        }
    }
}
</style>
