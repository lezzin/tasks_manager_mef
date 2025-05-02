<script setup lang="ts">
import { PAGE_TITLES, TASK_PRIORITIES } from "../utils/variables.ts";
import { getPriorityIcon } from "../utils/priorityUtils.ts";

import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

import domtoimage from "dom-to-image-more";
import { saveAs } from "file-saver";

import { useToast } from "../composables/useToast.ts";
import { useTask } from "../composables/useTask.ts";
import { useAuthStore } from "../stores/authStore.ts";
import { useLoadingStore } from "../stores/loadingStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";

import UIButton from "../components/ui/UIButton.vue";
import type { Task, TaskPriority, TaskStates } from "@/interfaces/Task.ts";
import type { Firestore } from "firebase/firestore";
import TaskGeneral from "@/components/task/TaskGeneral.vue";

const { showToast } = useToast();
const { getUserTasksWithTopic } = useTask();
const { user } = useAuthStore();
const sidebarStore = useSidebarStore();
const loadingStore = useLoadingStore();
const router = useRouter();

interface GeneralViewProps {
    db: Firestore;
}

defineProps<GeneralViewProps>();

const isDownloading = ref(false);
const allUserTasks = ref<Task[]>([]);
const taskStates = reactive<TaskStates>({});

const container = ref(null);
const priorityCount = reactive({
    completed: 0,
    high: 0,
    medium: 0,
    small: 0,
});

const downloadAsImage = () => {
    isDownloading.value = true;

    domtoimage
        .toBlob(container.value)
        .then((blob: Blob) => saveAs(blob, `${Date.now()}.png`))
        .catch(() => showToast("danger", "Erro ao baixar tarefas. Tente novamente mais tarde."))
        .finally(() => (isDownloading.value = false));
};

const focusTasksByPriority = (priority: TaskPriority) => {
    allUserTasks.value.forEach((task) => {
        taskStates[task.id] = {
            isHovering: true,
            isFocused:
                task.priority == priority || (priority == TASK_PRIORITIES.completed && task.status),
        };
    });
};

const removeFocusFromTasks = () => {
    allUserTasks.value.forEach((task) => {
        taskStates[task.id] = {
            isHovering: false,
            isFocused: false,
        };
    });
};

const updatePriorityCounter = () => {
    priorityCount.completed = allUserTasks.value.filter((task) => !!task.status).length;

    priorityCount.high = allUserTasks.value.filter(
        (task) => task.priority == TASK_PRIORITIES.high
    ).length;

    priorityCount.medium = allUserTasks.value.filter(
        (task) => task.priority == TASK_PRIORITIES.medium
    ).length;

    priorityCount.small = allUserTasks.value.filter(
        (task) => task.priority == TASK_PRIORITIES.low
    ).length;
};

const loadTasks = async () => {
    if (!user?.uid) return;

    loadingStore.showLoader();

    try {
        allUserTasks.value = await getUserTasksWithTopic(user.uid);
        updatePriorityCounter();
    } catch (error) {
        showToast("danger", `Erro ao resgatar tarefas. Tente novamente mais tarde.`);
    } finally {
        loadingStore.hideLoader();
    }
};

onMounted(() => {
    document.title = PAGE_TITLES.general;
    sidebarStore.setShowSidebarToggler(false);
    loadTasks();
});
</script>

<template>
    <div class="task-view container" v-if="allUserTasks.length > 0" ref="container">
        <header class="task-view__header" role="banner">
            <h2 class="title" v-if="!isDownloading">
                Visualize as suas tarefas de uma maneira geral
            </h2>

            <div class="task-view__header-buttons" v-if="!isDownloading">
                <UIButton
                    type="button"
                    @click="downloadAsImage"
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

        <section class="legend" aria-labelledby="task-legend">
            <h3 id="task-legend" class="sr-only">Legenda de prioridade de tarefas</h3>
            <div
                class="legend__item completed"
                @mouseover="focusTasksByPriority(TASK_PRIORITIES.completed)"
                @mouseleave="removeFocusFromTasks"
                aria-label="Tarefas concluídas: {{ priorityCount.completed }}"
                tabindex="0"
            >
                <p class="text text--small">
                    <fa :icon="getPriorityIcon(TASK_PRIORITIES.completed)" />
                    Concluídas ({{ priorityCount.completed }})
                </p>
            </div>
            <div
                class="legend__item priority-high"
                @mouseover="focusTasksByPriority(TASK_PRIORITIES.high)"
                @mouseleave="removeFocusFromTasks"
                :aria-label="`Tarefas de alta prioridade: ${priorityCount.high}`"
                tabindex="0"
            >
                <p class="text text--small">
                    <fa :icon="getPriorityIcon(TASK_PRIORITIES.high)" />
                    Alta prioridade ({{ priorityCount.high }})
                </p>
            </div>
            <div
                class="legend__item priority-medium"
                @mouseover="focusTasksByPriority(TASK_PRIORITIES.medium)"
                @mouseleave="removeFocusFromTasks"
                :aria-label="`Tarefas de média prioridade: ${priorityCount.medium}`"
                tabindex="0"
            >
                <p class="text text--small">
                    <fa :icon="getPriorityIcon(TASK_PRIORITIES.medium)" />
                    Média prioridade ({{ priorityCount.medium }})
                </p>
            </div>
            <div
                class="legend__item priority-low"
                @mouseover="focusTasksByPriority(TASK_PRIORITIES.low)"
                @mouseleave="removeFocusFromTasks"
                :aria-label="`Tarefas de baixa prioridade: ${priorityCount.small}`"
                tabindex="0"
            >
                <p class="text text--small">
                    <fa :icon="getPriorityIcon(TASK_PRIORITIES.low)" />
                    Baixa prioridade ({{ priorityCount.small }})
                </p>
            </div>
        </section>

        <span class="divider" role="separator" aria-hidden="true"></span>

        <div class="grid" role="list" aria-label="Lista de tarefas">
            <TaskGeneral
                v-for="task in allUserTasks"
                :key="task.id"
                :task="task"
                :task-states="taskStates"
            />
        </div>
    </div>
</template>

<style scoped>
.task-view {
    padding: var(--padding) var(--padding) calc(var(--padding) * 5);
    background: var(--bg-secondary);

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

    .legend {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        margin: 1rem 0 2rem;
        gap: 1rem;

        .legend__item {
            text-align: center;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: calc(var(--padding) / 2);
            cursor: default;
            font-weight: 500;
            box-shadow: var(--shadow-sm);
        }
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;

        @media (width <=768px) {
            padding-bottom: calc(var(--padding) * 2);
        }

        ~ * {
            margin-top: auto;
        }
    }
}
</style>
