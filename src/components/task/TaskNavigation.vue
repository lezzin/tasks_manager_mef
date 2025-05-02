<script setup lang="ts">
import type { Task } from "@/interfaces/Task";

import { useToast } from "@/composables/useToast";
import { useTask } from "@/composables/useTask";
import { useAuthStore } from "@/stores/authStore";
import { useModal } from "@/composables/useModal";
import { useConfirmModal } from "@/composables/useConfirmModal";

import { marked } from "marked";
import { inject, markRaw, ref, type PropType } from "vue";

import CommentModal from "./CommentModal.vue";
import TaskItem from "./TaskItem.vue";
import TaskFormEdit from "../forms/TaskFormEdit.vue";

const { changeStatus, deleteTask } = useTask();
const { setConfirmModal } = useConfirmModal();
const { showToast } = useToast();

interface TaskNavigationProps {
    topic: string;
    tasks: Task[];
}

const { user } = useAuthStore();
const modal = useModal();

const props = defineProps<TaskNavigationProps>();

const editingTask = ref<null | Task>(null);
const selectedComment = ref("");

const filterTask = inject("filterTask") as any;
const searchTask = inject("searchTask") as any;

const handleChangeTaskStatus = async (taskToUpdate: Task) => {
    if (!user?.uid) return;

    try {
        await changeStatus(taskToUpdate, user.uid);
        showToast("success", "Status de conclusão alterado com sucesso.");
        filterTask.value = "all";
        searchTask.value = "";
    } catch (error: any) {
        showToast("danger", "Erro ao alterar status da tarefa.");
    }
};

const confirmTaskRemotion = (taskToDelete: Task) => {
    setConfirmModal(
        "Tem certeza que deseja excluir essa tarefa? Essa ação não poderá ser desfeita!",
        () => handleDeleteTask(taskToDelete)
    );
};

const handleDeleteTask = async (taskToDelete: Task) => {
    if (!user?.uid) return;

    try {
        await deleteTask(taskToDelete, user.uid);
        showToast("success", "Tarefa excluída com sucesso!");
    } catch (error: any) {
        showToast("danger", "Erro ao excluir tarefa.");
    }
};

const openEditTaskModal = (task: Task) => {
    editingTask.value = task;
    modal.component.value = markRaw(TaskFormEdit) as any;
    modal.showModal();
};

const openTaskComment = async (comment: string) => {
    selectedComment.value = await marked(comment);
    modal.component.value = markRaw(CommentModal) as any;
    modal.showModal();
};
</script>

<template>
    <section aria-label="Lista de tarefas filtradas">
        <div class="task-nav">
            <TaskItem
                v-for="task in props.tasks"
                :key="task.id"
                :task="task"
                @changeStatus="handleChangeTaskStatus"
                @edit="openEditTaskModal"
                @openComment="openTaskComment"
                @delete="confirmTaskRemotion"
            />

            <p class="text text--center" v-if="props.tasks.length === 0">
                Nenhuma tarefa para esse filtro
            </p>
        </div>
    </section>

    <Teleport to="#modal">
        <Transition>
            <component
                :is="modal.component.value"
                v-if="modal.show.value"
                @close="modal.hideModal"
                v-bind="{ topic: props.topic, task: editingTask, comment: selectedComment }"
            />
        </Transition>
    </Teleport>
</template>

<style scoped>
.task-nav {
    display: grid;
    padding-bottom: 5rem;
    gap: 0.6rem;
}
</style>
