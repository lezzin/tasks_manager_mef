<script setup lang="ts">
import { type ComputedRef } from "vue";
import type { Task, TaskStatus } from "@/interfaces/Task";
import type { Topic } from "@/interfaces/Topic.ts";

import { PRINCIPAL_DOC_NAME, PAGE_TITLES } from "../utils/variables.ts";

import { onMounted, provide, reactive, ref, computed, watch, markRaw, type PropType } from "vue";
import { doc, Firestore, onSnapshot } from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "../stores/authStore";
import { useLoadingStore } from "../stores/loadingStore";
import { useSidebarStore } from "../stores/sidebarStore";
import { useModal } from "../composables/useModal";
import { useToast } from "../composables/useToast";
import { useTopic } from "../composables/useTopic";

import TaskNavigation from "../components/task/TaskNavigation.vue";
import TaskFormAdd from "../components/forms/TaskFormAdd.vue";
import ImageResponsive from "../components/shared/ImageResponsive.vue";
import UIButton from "../components/ui/UIButton.vue";
import MySidebar from "@/components/layout/MySidebar.vue";
import TaskFilter from "@/components/task/TaskFilter.vue";

interface HomeViewProps {
    db: Firestore;
}

const props = defineProps<HomeViewProps>();

const selectedTopic = ref<Topic | null>(null);
const defaultTasks = ref<Task[]>([]);

const modal = useModal();
const { showToast } = useToast();
const { getTopicInfo } = useTopic();
const { user } = useAuthStore();
const loadingStore = useLoadingStore();
const sidebarStore = useSidebarStore();

const STATUS_ORDER: Record<TaskStatus, number> = {
    todo: 1,
    doing: 2,
    completed: 3,
};

const topics = reactive<{ data: Topic[] | null }>({ data: [] });
const route = useRoute();
const router = useRouter();

const filterTask = ref("all");
const searchTask = ref("");

const handleFilter = (value: string) => {
    filterTask.value = value;

    if (value !== "all") {
        searchTask.value = "";
    }
};

const handleSearch = (value: string) => {
    searchTask.value = value;

    if (value.trim()) {
        filterTask.value = "all";
    }
};

const filteredTasks: ComputedRef<Task[]> = computed(() => {
    let tasks: Task[] = defaultTasks.value;

    if (searchTask.value.trim()) {
        const searchTerm = searchTask.value.trim().toLowerCase();
        tasks = tasks.filter((task: Task) => task.name.toLowerCase().includes(searchTerm));
    }

    if (filterTask.value === "completed") {
        tasks = tasks.filter((task: Task) => task.kanbanStatus === "completed");
    } else if (filterTask.value === "not-completed") {
        tasks = tasks.filter(
            (task: Task) => task.kanbanStatus === "todo" || task.kanbanStatus === "doing"
        );
    }

    return tasks.sort((taskA: Task, taskB: Task) => {
        const statusComparison =
            STATUS_ORDER[taskA.kanbanStatus] - STATUS_ORDER[taskB.kanbanStatus];
        if (statusComparison !== 0) return statusComparison;

        const priorityComparison = taskB.priority - taskA.priority;
        if (priorityComparison !== 0) return priorityComparison;

        return taskA.name.localeCompare(taskB.name);
    });
});

const loadTopicTasks = (topicId: string) => {
    if (!user?.uid) return;

    const docRef = doc(props.db as Firestore, PRINCIPAL_DOC_NAME, user.uid);

    onSnapshot(docRef, (doc) => {
        const userData = doc.data();

        if (!userData || !userData.topics || !userData.tasks) {
            defaultTasks.value = [];
            return;
        }

        const tasks = userData.tasks as Task[];
        defaultTasks.value = Object.values(tasks).filter((task) => task.topicId === topicId);
    });
};

const loadTopic = async (id: string) => {
    if (!id || !user?.uid) {
        document.title = PAGE_TITLES.home.default;
        return;
    }

    const topic = await getTopicInfo(id, user.uid);

    if (!topic) {
        if ((router.currentRoute as any) !== "/") router.push("/");
        return;
    }

    loadTopicTasks(topic.id);
    selectedTopic.value = topic as any;
    document.title = PAGE_TITLES.home.topic(topic.name);
};

const loadTopics = () => {
    if (!user?.uid) return;

    const docRef = doc(props.db as Firestore, PRINCIPAL_DOC_NAME, user.uid);
    loadingStore.showLoader();

    onSnapshot(
        docRef,
        (doc) => {
            const userData = doc.data();
            const topicsExists =
                userData && userData.topics && Object.keys(userData.topics).length > 0;

            if (!topicsExists) {
                sidebarStore.setSidebarActive(true);
                topics.data = null;
                return;
            }

            topics.data = Object.values(userData.topics as Topic[])
                .map((topic) => {
                    const tasks = userData.tasks as Task[];

                    const tasksLength = userData.tasks
                        ? Object.values(tasks).filter((task) => task.topicId === topic.id).length
                        : 0;

                    return {
                        id: topic.id,
                        name: topic.name,
                        created_at: topic.created_at,
                        tasks_length: tasksLength,
                    };
                })
                .sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

            if (!route.params.id) {
                document.title = PAGE_TITLES.home.default;
                return;
            }

            const pageId = String(route.params.id);
            loadTopic(pageId);
        },
        (error) => {
            if (!user?.uid) return;
            showToast("danger", "Erro ao obter tópicos. Tente novamente mais tarde.");
        }
    );

    loadingStore.hideLoader();
};

const openAddTaskModal = () => {
    modal.component.value = markRaw(TaskFormAdd) as any;
    modal.showModal();
};

onMounted(() => {
    sidebarStore.setShowSidebarToggler(true);
    loadTopics();
});

watch(
    () => route.params.id,
    (newId) => {
        if (newId) loadTopic(String(newId));
    }
);

provide("filterTask", filterTask);
provide("searchTask", searchTask);
provide("selectedTopic", selectedTopic);
</script>

<template>
    <div class="home-wrapper">
        <section
            :class="['container', defaultTasks.length > 0 && 'task-container']"
            v-if="selectedTopic"
        >
            <div id="add-task-container">
                <UIButton
                    @click="openAddTaskModal"
                    title="Abrir modal de nova tarefa"
                    aria-haspopup="dialog"
                    aria-controls="add-task-modal"
                    variant="outline-primary"
                    isRounded
                >
                    <span class="sr-only">Adicionar nova tarefa</span>
                    <fa icon="plus" />
                </UIButton>
            </div>

            <div v-if="defaultTasks.length > 0">
                <TaskFilter
                    @filter="handleFilter"
                    @search="handleSearch"
                    :filterTask="filterTask"
                    :searchTask="searchTask"
                />

                <span class="divider" role="separator" aria-hidden="true"></span>

                <TaskNavigation :topic="selectedTopic.name" :tasks="filteredTasks" />
            </div>
            <div v-else class="image-centered" aria-live="polite" aria-atomic="true">
                <ImageResponsive
                    small="task_empty_sm.png"
                    lg="task_empty_lg.png"
                    alt="Frase tarefas vazias e uma imagem de uma caixa vazia"
                />
            </div>
        </section>
        <div v-else class="container image-centered" aria-live="polite" aria-atomic="true">
            <ImageResponsive
                small="topic_unselected_sm.png"
                lg="topic_unselected_lg.png"
                alt="Uma pessoa escrevendo em um diário suas tarefas pessoais"
            />
        </div>
    </div>

    <Teleport to="#modal">
        <Transition>
            <TaskFormAdd
                v-if="modal.show.value"
                @close="modal.hideModal"
                :topicId="selectedTopic?.id"
                :topicName="selectedTopic?.name"
                id="add-task-modal"
            />
        </Transition>
    </Teleport>

    <MySidebar :data="topics.data" />
</template>

<style scoped>
.container {
    position: relative;
}

#add-task-container {
    position: fixed;
    max-width: calc(1080px - var(--padding));
    width: calc(100% - var(--padding));
    bottom: calc(var(--padding) * 2);
    z-index: 980;
    display: flex;
    justify-content: flex-end;

    @media (max-width: 768px) {
        right: calc(var(--padding) * 2);
    }

    button {
        height: 5rem;
        aspect-ratio: 1;
        box-shadow: var(--shadow-md);

        i {
            font-size: 2rem;
        }
    }
}

.home-aside {
    border-right: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
    background-color: var(--bg-primary);
    padding: var(--padding);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: fixed;
    width: 30vw;
    inset: 10vh 0 0;
    z-index: 980;

    @media (width <=768px) {
        width: 100vw;
    }

    .divider {
        margin: 0.5rem 0 1rem;
    }
}

.task-container {
    padding: var(--padding) 0;
}
</style>
