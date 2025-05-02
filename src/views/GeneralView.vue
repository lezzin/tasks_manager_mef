<script setup lang="ts">
import type { Task, TaskPriority, TaskPriorityString, TaskStates } from "@/interfaces/Task.ts";
import type { Firestore } from "firebase/firestore";

import { PAGE_TITLES, TASK_PRIORITIES } from "../utils/variables.ts";

import { ref, reactive, onMounted, computed } from "vue";

import domtoimage from "dom-to-image-more";
import { saveAs } from "file-saver";

import { useToast } from "../composables/useToast.ts";
import { useTask } from "../composables/useTask.ts";
import { useAuthStore } from "../stores/authStore.ts";
import { useLoadingStore } from "../stores/loadingStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";

import TaskGeneral from "@/components/task/TaskGeneral.vue";
import GeneralHeader from "@/components/general/GeneralHeader.vue";
import GeneralLegendItem from "@/components/general/GeneralLegendItem.vue";

const { showToast } = useToast();
const { getUserTasksWithTopic } = useTask();
const { user } = useAuthStore();
const sidebarStore = useSidebarStore();
const loadingStore = useLoadingStore();

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
    low: 0,
});

const legendsData = computed(() => [
    {
        counter: priorityCount.completed,
        priority: TASK_PRIORITIES.completed,
        label: "Concluída",
        priorityClass: "completed",
    },
    {
        counter: priorityCount.high,
        priority: TASK_PRIORITIES.high,
        label: "Alta prioridade",
        priorityClass: "priority-high",
    },
    {
        counter: priorityCount.medium,
        priority: TASK_PRIORITIES.medium,
        label: "Média prioridade",
        priorityClass: "priority-medium",
    },
    {
        counter: priorityCount.low,
        priority: TASK_PRIORITIES.low,
        label: "Baixa prioridade",
        priorityClass: "priority-low",
    },
]);

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

const setPriorityCount = (priority: TaskPriorityString) => {
    priorityCount[priority] = allUserTasks.value.filter(
        (task) => task.priority == TASK_PRIORITIES[priority]
    ).length;
};

const updatePriorityCounter = () => {
    setPriorityCount("completed");
    setPriorityCount("high");
    setPriorityCount("medium");
    setPriorityCount("low");
};

const loadTasks = async () => {
    if (!user?.uid) return;

    loadingStore.showLoader();

    try {
        allUserTasks.value = await getUserTasksWithTopic(user.uid);
        updatePriorityCounter();
    } catch (error: any) {
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
        <GeneralHeader @download="downloadAsImage" :isDownloading="isDownloading" />

        <section class="legend" aria-labelledby="task-legend">
            <h3 id="task-legend" class="sr-only">Legenda de prioridade de tarefas</h3>

            <GeneralLegendItem
                v-for="(legend, index) in legendsData"
                :key="index"
                :counter="legend.counter"
                :priority="legend.priority"
                :label="legend.label"
                :priorityClass="legend.priorityClass"
                @focus="focusTasksByPriority(legend.priority)"
                @unfocus="removeFocusFromTasks"
            />
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
