<script setup lang="ts">
import type { Task } from "@/interfaces/Task";
import { computed, onMounted, ref, useAttrs } from "vue";

import { getPriorityClass, getPriorityIcon, getPriorityText } from "../../utils/priorityUtils";
import { formatDate } from "../../utils/dateUtils";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";

import UIButton from "../ui/UIButton.vue";

interface TaskItemProps {
    task: Task;
    showPriorities?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showComments?: boolean;
    showCompletedStatus?: boolean;
    variant?: string;
}

const props = withDefaults(defineProps<TaskItemProps>(), {
    showPriorities: true,
    showEdit: true,
    showDelete: true,
    showComments: true,
    showCompletedStatus: true,
    variant: "normal",
});

const emit = defineEmits(["changeStatus", "openComment", "edit", "delete"]);

const attrs = useAttrs();
const route = useRoute();
const router = useRouter();

const changeTaskStatus = (task: Task) => emit("changeStatus", task);
const openTaskComment = (comment: string) => emit("openComment", comment);
const openEditTaskModal = (task: Task) => emit("edit", task);
const deleteTask = (task: Task) => emit("delete", task);

const FOCUS_TIMEOUT = 2000;

const queryFocus = computed(() => (route.query.focus as string) || null);
const canFocus = computed(() => props.task.id === queryFocus.value);

const allTaskClasses = ["task", props.task.status && props.showCompletedStatus ? "completed" : ""];
const classes = ref(allTaskClasses.join(" "));

const focusOnTask = () => {
    if (!canFocus.value) return;

    allTaskClasses.push("task--focus");
    classes.value = allTaskClasses.join(" ");
    router.replace({ query: {} });

    setTimeout(() => {
        allTaskClasses.pop();
        classes.value = allTaskClasses.join(" ");
    }, FOCUS_TIMEOUT);
};

onMounted(focusOnTask);
</script>

<template>
    <div :class="classes" v-bind="attrs">
        <div class="task__information">
            <p :class="`text-${props.variant} truncate`" style="--line-clamp: 1">
                {{ props.task.name }}
            </p>

            <p class="task__information__bottom" v-if="props.showPriorities">
                <span :class="['tag', getPriorityClass(props.task.priority)]">
                    <fa :icon="getPriorityIcon(props.task.priority)" />
                    {{ getPriorityText(props.task.priority) }}
                </span>
                <span class="text text--icon text--small text--muted">
                    <fa icon="clock" />
                    Criado em: {{ props.task.created_at }}
                </span>
                <span
                    class="text text--icon text--small text--muted"
                    v-if="props.task.delivery_date"
                >
                    <fa icon="bell" />
                    Entrega para: {{ formatDate(props.task.delivery_date) }}
                </span>
            </p>
        </div>
        <div class="task__action">
            <UIButton
                :variant="props.task.status ? 'primary' : 'outline-primary'"
                isRounded
                :title="`Marcar tarefa como ${props.task.status ? 'não concluída' : 'concluída'}`"
                @click.stop="changeTaskStatus(props.task)"
            >
                <fa icon="check" />
            </UIButton>
            <UIButton
                isBordered
                isRounded
                title="Visualizar comentários da tarefa"
                @click.stop="openTaskComment(props.task.comment)"
                v-if="props.showComments && props.task.comment"
            >
                <fa icon="comment" />
            </UIButton>
            <UIButton
                isBordered
                isRounded
                title="Editar tarefa"
                @click.stop="openEditTaskModal(props.task)"
                aria-label="Editar tarefa"
                v-if="props.showEdit"
            >
                <fa icon="pen" />
            </UIButton>
            <UIButton
                variant="danger"
                isRounded
                title="Excluir tarefa"
                @click="deleteTask(props.task)"
                v-if="props.showDelete"
            >
                <fa icon="trash" />
            </UIButton>
        </div>
    </div>
</template>

<style scoped>
.task {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
    padding: 1.4rem var(--padding);
    border-radius: var(--radius);
    background-color: var(--bg-primary);
    transition: all 0.3s ease;
}

.task--focus {
    box-shadow: var(--shadow-md);
    border-color: var(--details-color);
    background-color: var(--details-color-light-2);
}

.task.smaller {
    flex-wrap: nowrap;
}

.task__information {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    text-align: left;
    gap: 0.4rem;

    .text-normal {
        font-size: 2rem;
    }

    .text-smaller {
        font-size: 1.5rem;
    }

    .tag {
        border-radius: calc(var(--radius) * 1.8);
    }
}

.task__information__bottom {
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (width <=768px) {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.3rem;
    }
}

.task__action {
    display: flex;
    gap: 1rem;

    @media (width <=768px) {
        margin-left: auto;
    }
}
</style>
