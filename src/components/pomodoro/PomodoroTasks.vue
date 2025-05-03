<script setup lang="ts">
import { PAGE_TITLES, TASK_KANBAN_STATUSES } from "../../utils/variables.ts";

import { onMounted, reactive, ref, markRaw } from "vue";
import { useRouter } from "vue-router";
import { marked } from "marked";

import { useAuthStore } from "../../stores/authStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { useToast } from "../../composables/useToast";
import { useModal } from "../../composables/useModal";
import { useTask } from "../../composables/useTask";

import CommentModal from "../../components/task/CommentModal.vue";
import UIButton from "../ui/UIButton.vue";

import type { Task } from "@/interfaces/Task.ts";
import TaskItem from "../task/TaskItem.vue";

defineProps({ hasTasks: { type: Boolean } });

const { user } = useAuthStore();
const loadingStore = useLoadingStore();

const { getUserTasksWithTopic, changeStatus } = useTask();
const { showToast } = useToast();
const router = useRouter();
const modal = useModal();

const tasks = reactive<{ data: Task[] | [] }>({ data: [] });

const isDropdownOpen = ref<boolean>(false);
const selectedComment = ref<string>("");

const loadTasks = async () => {
    if (!user?.uid) return;

    loadingStore.showLoader();

    try {
        tasks.data = await getUserTasksWithTopic(user.uid);
    } catch (error: any) {
        showToast("danger", error.message);

        if (error.code === "topic-not-found" || error.code === "doc-not-found") {
            router.push("/");
        }
    } finally {
        loadingStore.hideLoader();
    }
};

const handleChangeTaskStatus = async (taskToUpdate: Task) => {
    if (!user?.uid) return;

    try {
        const newStatus = await changeStatus(taskToUpdate, user.uid);
        taskToUpdate.status = newStatus;
        taskToUpdate.kanbanStatus = newStatus
            ? TASK_KANBAN_STATUSES.completed
            : TASK_KANBAN_STATUSES.todo;
        showToast("success", "Status de conclusão alterado com sucesso.");
    } catch (error: any) {
        showToast("danger", "Erro ao alterar status da tarefa.");
    }
};

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};

const openTaskComment = async (comment: string) => {
    selectedComment.value = await marked(comment);
    modal.component.value = markRaw(CommentModal) as any;
    modal.showModal();
};

onMounted(() => {
    document.title = PAGE_TITLES.pomodoro;
    loadTasks();
});
</script>

<template>
    <p class="text text--icon" v-if="!hasTasks">
        <fa icon="exclamation-circle" />
        <span> Crie uma nova tarefa para começar a utilizar o Pomodoro da melhor maneira.</span>
    </p>

    <div class="pomodoro-tasks-wrapper" v-else>
        <UIButton variant="outline-primary" @click="toggleDropdown" title="Exibir tarefas">
            <fa :icon="isDropdownOpen ? 'eye-slash' : 'eye'" />
            {{ isDropdownOpen ? "Fechar" : "Exibir" }} tarefas
        </UIButton>

        <Transition name="slide">
            <div class="task-nav" v-if="isDropdownOpen">
                <TaskItem
                    v-for="task in tasks.data"
                    :key="task.id"
                    :task="task"
                    @changeStatus="handleChangeTaskStatus"
                    :showPriorities="false"
                    :showEdit="false"
                    :showDelete="false"
                    :showCompletedStatus="false"
                    :showComment="true"
                    @openComment="openTaskComment"
                    variant="smaller"
                />
            </div>
        </Transition>

        <Teleport to="#modal">
            <Transition>
                <CommentModal
                    v-if="modal.show.value"
                    @close="modal.hideModal"
                    :comment="selectedComment"
                    id="comment-modal"
                />
            </Transition>
        </Teleport>
    </div>
</template>
<style scoped>
.pomodoro-tasks-wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
    width: 90%;
    max-width: 500px;
}

.task-nav {
    display: grid;
    gap: 0.6rem;
    max-height: 160px;
    width: 100%;
    overflow-y: auto;
    padding-inline: var(--padding);
}

.slide-enter-active,
.slide-leave-active {
    transition: all var(--screen-transition) ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>
