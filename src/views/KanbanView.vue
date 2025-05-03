<script setup lang="ts">
import type { Task, TaskStatus } from "@/interfaces/Task.ts";
import type { DragAction, KanbanViewProps, TaskDirection, TaskList } from "@/interfaces/Kanban.ts";

import { PAGE_TITLES, TASK_KANBAN_STATUSES } from "../utils/variables.ts";
import { baseUrl } from "@/utils/urlUtils.ts";

import { ref, reactive, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { useToast } from "../composables/useToast.ts";
import { useTask } from "../composables/useTask.ts";
import { useAuthStore } from "../stores/authStore.ts";
import { useLoadingStore } from "../stores/loadingStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";

import UIButton from "../components/ui/UIButton.vue";
import KanbanColumn from "@/components/kanban/KanbanColumn.vue";

defineProps<KanbanViewProps>();

const tasks = reactive<TaskList>({
    todo: [],
    doing: [],
    completed: [],
});

const draggedTask = ref<Task | null>(null);
const activeColumn = ref<TaskStatus | null>(null);
const tasksLength = ref<number>(0);

const { showToast } = useToast();
const { getUserTasksWithTopic, changeKanbanStatus } = useTask();
const { user } = useAuthStore();
const loadingStore = useLoadingStore();
const sidebarStore = useSidebarStore();
const router = useRouter();

const kanbanStatuses: TaskStatus[] = ["todo", "doing", "completed"];

const loadTasks = async () => {
    if (!user?.uid) return;

    loadingStore.showLoader();

    try {
        const userTasks = await getUserTasksWithTopic(user.uid);
        tasksLength.value = userTasks.length;
        organizeTasksByStatus(userTasks);
    } catch (error: any) {
        showToast("danger", `Erro ao obter tarefas. Tente novamente mais tarde.`);
    } finally {
        loadingStore.hideLoader();
    }
};

const organizeTasksByStatus = (userTasks: Task[]) => {
    tasks.todo = userTasks.filter(
        (task) => task.kanbanStatus === TASK_KANBAN_STATUSES.todo || !task.kanbanStatus
    );

    tasks.doing = userTasks.filter((task) => task.kanbanStatus === TASK_KANBAN_STATUSES.doing);

    tasks.completed = userTasks.filter(
        (task) => task.kanbanStatus === TASK_KANBAN_STATUSES.completed
    );
};

const handleDragEvents = (event?: DragEvent, action?: DragAction, task?: Task | null) => {
    const currentElement = event?.target as Element;
    if (!task) return;

    if (action === "start") {
        draggedTask.value = task;
        currentElement?.classList?.add("dragging");
    } else if (action === "end") {
        currentElement?.classList?.remove("dragging");
        draggedTask.value = null;
    }
};

const onDrop = (column: TaskStatus) => {
    if (draggedTask.value && draggedTask.value.kanbanStatus !== column) {
        changeTaskColumn(draggedTask.value, column);
    }

    draggedTask.value = null;
    activeColumn.value = null;
};

const onDragEnter = (event: DragEvent, kanbanStatus: TaskStatus) => {
    if (activeColumn.value !== kanbanStatus) {
        activeColumn.value = kanbanStatus;
    }

    event.preventDefault();
};

const moveTask = (task: Task, direction: TaskDirection) => {
    const newColumn = getNewColumn(task.kanbanStatus, direction);

    if (newColumn) {
        changeTaskColumn(task, newColumn);
    }
};

const getNewColumn = (currentColumn: TaskStatus, direction: TaskDirection): TaskStatus | null => {
    const currentIndex = kanbanStatuses.indexOf(currentColumn);

    if (direction === "prev" && currentIndex > 0) {
        return kanbanStatuses[currentIndex - 1];
    }

    if (direction === "next" && currentIndex < kanbanStatuses.length - 1) {
        return kanbanStatuses[currentIndex + 1];
    }

    return null;
};

const changeTaskColumn = (task: Task, newColumn: TaskStatus) => {
    task.kanbanStatus = newColumn;

    tasks.todo = tasks.todo.filter((t) => t !== task);
    tasks.doing = tasks.doing.filter((t) => t !== task);
    tasks.completed = tasks.completed.filter((t) => t !== task);
    tasks[newColumn].push(task);

    updateTaskStatus(task, newColumn);
};

const updateTaskStatus = async (taskToUpdate: Task, newKanbanStatus: TaskStatus) => {
    if (!user?.uid) return;

    try {
        changeKanbanStatus(taskToUpdate, newKanbanStatus, user.uid);
        taskToUpdate.kanbanStatus = newKanbanStatus;
        taskToUpdate.status = newKanbanStatus === TASK_KANBAN_STATUSES.completed;
    } catch (error: any) {
        showToast("danger", `Erro ao atualizar Kanban. Tente novamente mais tarde.`);
    }
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

            <KanbanColumn
                :active-column="activeColumn"
                :tasks="tasks"
                :kanban-statuses="kanbanStatuses"
                @dragEvents="handleDragEvents"
                @onDrop="onDrop"
                @onDragEnter="onDragEnter"
                @moveTask="moveTask"
            />
        </section>
    </div>
    <div class="container" v-else>
        <RouterLink to="/" title="Voltar para o início">
            <div class="image-container">
                <img
                    :src="baseUrl('task_empty.svg')"
                    alt="Frase tarefas vazias e uma imagem de uma caixa vazia"
                    width="400"
                    height="400"
                />

                <span class="text">Nenhuma tarefa encontrada</span>
            </div>
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
    }
}
</style>
