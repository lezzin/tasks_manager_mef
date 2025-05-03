<script setup lang="ts">
import type { Task } from "@/interfaces/Task";
import { computed, onMounted, ref, useAttrs, watch } from "vue";

import { getPriorityClass, getPriorityIcon, getPriorityText } from "../../utils/priorityUtils";
import { formatDate } from "../../utils/dateUtils";
import { useRoute, useRouter } from "vue-router";

import UIButton from "../ui/UIButton.vue";

const props = withDefaults(defineProps<TaskItemProps>(), {
    showPriorities: true,
    showEdit: true,
    showDelete: true,
    showComments: true,
    showCompletedStatus: true,
    variant: "normal",
});

const emit = defineEmits<{
    (e: "changeStatus", task: Task): void;
    (e: "openComment", comment: string): void;
    (e: "edit", task: Task): void;
    (e: "delete", task: Task): void;
}>();

interface TaskItemProps {
    task: Task;
    showPriorities?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showComments?: boolean;
    showCompletedStatus?: boolean;
    variant?: string;
}

const attrs = useAttrs();
const route = useRoute();
const router = useRouter();

const changeTaskStatus = (task: Task) => emit("changeStatus", task);
const openTaskComment = (comment: string) => emit("openComment", comment);
const openEditTaskModal = (task: Task) => emit("edit", task);
const deleteTask = (task: Task) => emit("delete", task);

const FOCUS_TIMEOUT = 2000;

const queryFocus = computed(() => route.query.focus as string | null);
const canFocus = computed(() => props.task.id === queryFocus.value);
const isFocusing = ref(false);

const classes = computed(() => {
    const base = ["task"];

    if (props.task.status && props.showCompletedStatus) {
        base.push("completed");
    }

    if (isFocusing.value) {
        base.push("task--focus");
    }

    return base.join(" ");
});

const focusOnTask = () => {
    if (!canFocus.value) return;

    isFocusing.value = true;
    router.replace({ query: { ...route.query, focus: undefined } });

    setTimeout(() => {
        isFocusing.value = false;
    }, FOCUS_TIMEOUT);
};

onMounted(focusOnTask);
</script>

<template>
    <div :class="classes" v-bind="attrs">
        <div class="task__information">
            <p :class="`text-${variant} truncate`" style="--line-clamp: 1">
                {{ task.name }}
            </p>

            <p class="task__information__bottom" v-if="showPriorities">
                <span :class="['tag', getPriorityClass(task.priority)]">
                    <fa :icon="getPriorityIcon(task.priority)" />
                    {{ getPriorityText(task.priority) }}
                </span>

                <template v-if="task.generatedByAI">
                    <div class="tag ai-image">
                        <img src="/src/assets/img/gemini-logo.png" alt="Logo do Gemini" />
                        <span>gerado com IA</span>
                    </div>
                </template>

                <span class="text text--icon text--small text--muted">
                    <fa icon="clock" />
                    Criado em: {{ task.created_at }}
                </span>
                <span class="text text--icon text--small text--muted" v-if="task.delivery_date">
                    <fa icon="bell" />
                    Entrega para: {{ formatDate(task.delivery_date) }}
                </span>
            </p>
        </div>
        <div class="task__action">
            <UIButton
                :variant="task.status ? 'primary' : 'outline-primary'"
                isRounded
                :title="`Marcar tarefa como ${task.status ? 'não concluída' : 'concluída'}`"
                @click.stop="changeTaskStatus(task)"
            >
                <fa icon="check" />
            </UIButton>
            <UIButton
                isBordered
                isRounded
                title="Visualizar comentários da tarefa"
                @click.stop="openTaskComment(task.comment)"
                v-if="showComments && task.comment"
            >
                <fa icon="comment" />
            </UIButton>
            <UIButton
                isBordered
                isRounded
                title="Editar tarefa"
                @click.stop="openEditTaskModal(task)"
                aria-label="Editar tarefa"
                v-if="showEdit"
            >
                <fa icon="pen" />
            </UIButton>
            <UIButton
                variant="danger"
                isRounded
                title="Excluir tarefa"
                @click="deleteTask(task)"
                v-if="showDelete"
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

.tag.ai-image {
    background: linear-gradient(90deg, rgba(0, 166, 255, 1) 0%, rgba(0, 255, 0, 0.8) 100%);

    img {
        width: 11px;
        aspect-ratio: 1;
        margin-right: 0.25rem;

        ~ span {
            font-weight: normal;
            color: var(--font-primary);
        }
    }
}
</style>
