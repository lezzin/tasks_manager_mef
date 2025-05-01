<script setup lang="ts">
import { PAGE_TITLES, TASK_KANBAN_STATUSES } from "../utils/variables.ts";
import { getPriorityClass, getPriorityText, getPriorityIcon } from "../utils/priorityUtils.ts";

import { ref, reactive, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { useToast } from "../composables/useToast.ts";
import { useTask } from "../composables/useTask.ts";
import { useAuthStore } from "../stores/authStore.ts";
import { useLoadingStore } from "../stores/loadingStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";

import ImageResponsive from "../components/shared/ImageResponsive.vue";
import UIButton from "../components/ui/UIButton.vue";
import type { Task } from "@/interfaces/Task.ts";

// Define Props type with explicit typing
const props = defineProps<{
    db?: Firestore; // Add specific Firestore type here
}>();

// Define reactive state for tasks
const tasks = reactive<{
    todo: Task[];
    doing: Task[];
    completed: Task[];
}>({
    todo: [],
    doing: [],
    completed: [],
});

const draggedTask = ref<Task | null>(null); // Task type or null
const activeColumn = ref<string | null>(null); // Column as string or null
const tasksLength = ref<number>(0); // Number of tasks

const { showToast } = useToast();
const { getUserTasksWithTopic, changeKanbanStatus } = useTask();
const { user } = useAuthStore();
const loadingStore = useLoadingStore();
const sidebarStore = useSidebarStore();
const router = useRouter();

// Fetch tasks based on user ID
const loadTasks = async () => {
    if (!user?.uid) return;

    loadingStore.showLoader();

    try {
        const userTasks = await getUserTasksWithTopic(user.uid);
        tasksLength.value = userTasks.length;
        organizeTasksByStatus(userTasks);
    } catch (error) {
        showToast("danger", `Erro ao obter tarefas. Tente novamente mais tarde.`);
    } finally {
        loadingStore.hideLoader();
    }
};

// Organize tasks into columns based on status
const organizeTasksByStatus = (userTasks: Task[]) => {
    tasks.todo = userTasks.filter(
        (task) => task.kanbanStatus === TASK_KANBAN_STATUSES.todo || !task.kanbanStatus
    );

    tasks.doing = userTasks.filter((task) => task.kanbanStatus === TASK_KANBAN_STATUSES.doing);

    tasks.completed = userTasks.filter(
        (task) => task.kanbanStatus === TASK_KANBAN_STATUSES.completed
    );
};

// Handle drag events on tasks
const handleDragEvents = (event: DragEvent, action: string, task: Task | null = null) => {
    if (action === "start") {
        draggedTask.value = task;
        event?.target?.classList?.add("dragging");
    } else if (action === "end") {
        event?.target?.classList?.remove("dragging");
        draggedTask.value = null;
    }
};

// Drop task into a new column
const onDrop = (column: string) => {
    if (draggedTask.value && draggedTask.value.kanbanStatus !== column) {
        changeTaskColumn(draggedTask.value, column);
    }
    draggedTask.value = null;
    activeColumn.value = null;
};

// Handle drag enter event to highlight the active column
const onDragEnter = (event: DragEvent, kanbanStatus: string) => {
    if (activeColumn.value !== kanbanStatus) {
        activeColumn.value = kanbanStatus;
    }
    event.preventDefault();
};

// Handle drag over event
const onDragOver = (event: DragEvent) => {
    event.preventDefault();
};

// Move task between columns
const moveTask = (task: Task, direction: "prev" | "next") => {
    const newColumn = getNewColumn(task.kanbanStatus, direction);
    if (newColumn) {
        changeTaskColumn(task, newColumn);
    }
};

// Determine the new column based on current column and direction
const getNewColumn = (currentColumn: string, direction: "prev" | "next"): string | null => {
    const columns = ["todo", "doing", "completed"];
    const currentIndex = columns.indexOf(currentColumn);
    return direction === "prev" && currentIndex > 0
        ? columns[currentIndex - 1]
        : direction === "next" && currentIndex < columns.length - 1
        ? columns[currentIndex + 1]
        : null;
};

const isFirstColumn = (kanbanStatus: string) => {
    return kanbanStatus === "todo";
};

const isLastColumn = (kanbanStatus: string) => {
    return kanbanStatus === "completed";
};

const changeTaskColumn = (task: Task, newColumn: string) => {
    task.kanbanStatus = newColumn;
    tasks.todo = tasks.todo.filter((t) => t !== task);
    tasks.doing = tasks.doing.filter((t) => t !== task);
    tasks.completed = tasks.completed.filter((t) => t !== task);
    tasks[newColumn].push(task);
    updateTaskStatus(task, newColumn);
};

const updateTaskStatus = async (taskToUpdate: Task, newKanbanStatus: string) => {
    try {
        changeKanbanStatus(taskToUpdate, newKanbanStatus, user.uid);
        taskToUpdate.kanban = newKanbanStatus;
        taskToUpdate.status = newKanbanStatus === TASK_KANBAN_STATUSES.completed;
    } catch (error) {
        showToast("danger", `Erro ao atualizar Kanban. Tente novamente mais tarde.`);
    }
};

const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
        todo: "Para fazer",
        doing: "Em andamento",
        completed: "Concluído",
    };

    return statuses[status];
};

onMounted(() => {
    document.title = PAGE_TITLES.kanban;
    sidebarStore.setShowSidebarToggler(false);
    loadTasks();
});
</script>

<template>
    <div class="kanban-wrapper container" v-if="tasksLength > 0">
        <header class="kanban-wrapper__header" role="banner">
            <h2 class="title truncate" style="--line-clamp: 1">Kanban das suas tarefas</h2>
            <UIButton
                @click="() => router.back()"
                variant="outline-primary"
                isIcon
                title="Voltar para a página anterior"
            >
                <fa icon="arrow-left" />
                <span class="sr-only">Voltar</span>
            </UIButton>
        </header>

        <section class="kanban" aria-labelledby="kanban-board">
            <h2 id="kanban-board" class="sr-only">Quadro Kanban de tarefas</h2>

            <div
                class="kanban__column"
                v-for="kanbanStatus in ['todo', 'doing', 'completed']"
                :key="kanbanStatus"
                :class="{ 'drag-over': activeColumn === kanbanStatus }"
                @drop="onDrop(kanbanStatus)"
                @dragover="onDragOver"
                @dragenter="(event) => onDragEnter(event, kanbanStatus)"
                :data-status="kanbanStatus"
                role="region"
                :aria-label="getStatusLabel(kanbanStatus)"
            >
                <h3 class="subtitle">
                    {{ getStatusLabel(kanbanStatus) }}
                </h3>

                <div class="kanban__tasks" role="list">
                    <div
                        class="task task--empty"
                        v-if="tasks[kanbanStatus].length === 0"
                        aria-hidden="true"
                    >
                        <fa icon="box-open" />
                        <p class="text text--bold">Nenhuma tarefa na coluna</p>
                    </div>
                    <div
                        v-else
                        v-for="task in tasks[kanbanStatus]"
                        :key="task.id"
                        :class="['task', task.status && 'completed']"
                        draggable="true"
                        @dragstart="handleDragEvents($event, 'start', task)"
                        @dragend="handleDragEvents($event, 'end')"
                        role="listitem"
                        :aria-labelledby="'task-' + task.id"
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
                                @click="moveTask(task, 'prev')"
                                :disabled="isFirstColumn(kanbanStatus)"
                                :aria-disabled="isFirstColumn(kanbanStatus)"
                                title="Mover tarefa para a coluna anterior"
                            >
                                <fa icon="caret-left" />
                                Anterior
                            </UIButton>
                            <UIButton
                                variant="outline-primary-small"
                                @click="moveTask(task, 'next')"
                                :disabled="isLastColumn(kanbanStatus)"
                                :aria-disabled="isLastColumn(kanbanStatus)"
                                title="Mover tarefa para a próxima coluna"
                            >
                                Próximo
                                <fa icon="caret-right" />
                            </UIButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <div class="container" v-else>
        <RouterLink to="/" title="Voltar para o início">
            <ImageResponsive
                small="task_empty_sm.png"
                lg="task_empty_lg.png"
                alt="Frase tarefas vazias e uma imagem de uma caixa vazia"
            />
        </RouterLink>
    </div>
</template>

<style scoped>
.kanban-wrapper {
    padding: var(--padding) 0;

    ::-webkit-scrollbar {
        height: 6px;
    }

    @media (width<=768px) {
        position: relative;

        .kanban {
            position: absolute;
            inset: 10vh 0 0;
            overflow-x: auto;
            height: 79dvh;

            .kanban__tasks {
                padding-bottom: calc(var(--padding) * 2);
            }
        }
    }

    .kanban-wrapper__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: var(--padding);
        width: 100%;

        button {
            padding: 0.5rem 1rem;
        }
    }

    .kanban {
        display: grid;
        grid-template-columns: repeat(3, minmax(300px, 1fr));
        gap: 1rem;

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
                padding: 1rem var(--padding);
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
                padding-inline: var(--padding);

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
    }
}
</style>
