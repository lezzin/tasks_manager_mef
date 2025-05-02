<script setup lang="ts">
import type { Task, TaskStates } from "@/interfaces/Task";
import { getPriorityClass, getPriorityIcon, getPriorityText } from "@/utils/priorityUtils";
import { formatDate } from "@/utils/dateUtils";

import { TASK_PRIORITIES } from "@/utils/variables";
import { computed } from "vue";
import { useSidebarStore } from "@/stores/sidebarStore";

interface TaskGeneralProps {
    task: Task;
    taskStates: TaskStates;
}

const props = defineProps<TaskGeneralProps>();

const sidebarStore = useSidebarStore();

const link = computed<string>(() => `/topic/${props.task.topicId}?focus=${props.task.id}`);
const label = computed<string>(
    () =>
        `Tarefa: ${props.task.name}, status: ${
            props.task.status ? "Concluída" : "Pendente"
        }, prioridade: ${getPriorityText(props.task.priority)}`
);
</script>

<template>
    <RouterLink
        :class="[
            'task',
            'task',
            task.status && TASK_PRIORITIES.completed,
            {
                'task--hovering': taskStates[task.id]?.isHovering,
                'task--focused': taskStates[task.id]?.isFocused,
            },
        ]"
        role="listitem"
        :to="link"
        @click="() => (sidebarStore.isTopicSidebarActive = false)"
        title="Acessar tópico {{ task.topicName }}"
        :aria-label="label"
    >
        <div class="task-header">
            <p class="task-title text text--small text--muted">
                {{ task.topicName }}
            </p>
            <div class="task-info">
                <p class="task-name text">{{ task.name }}</p>

                <div class="task-info--small">
                    <span :class="['tag', getPriorityClass(task.priority)]" aria-hidden="true">
                        <i :class="getPriorityIcon(task.priority)" aria-hidden="true"></i>
                        {{ getPriorityText(task.priority) }}
                    </span>

                    <p class="text text--icon text--small">
                        <fa icon="clock" />
                        Criado em: {{ task.created_at }}
                    </p>

                    <p class="text text--icon text--small" v-if="task.delivery_date">
                        <fa icon="bell" />
                        Entrega para: {{ formatDate(task.delivery_date) }}
                    </p>
                </div>
            </div>
        </div>
    </RouterLink>
</template>

<style scoped>
.task {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    background-color: var(--bg-primary);
    padding: var(--padding);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    text-decoration: none;
    transition: all 0.3s ease;

    &.completed .task-footer {
        --border-color: hsl(158, 40%, 70%);
    }

    &.task--hovering:not(.task--focused) {
        opacity: 0.4;
    }

    .task-header {
        display: grid;
        gap: 1rem;

        > .text {
            font-weight: 500;
        }

        .task-info {
            display: grid;
            gap: 1rem;

            .task-info--small {
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                gap: 0.5rem;

                .tag {
                    border-radius: calc(var(--radius) * 1.5);
                    margin-bottom: 0.25rem;
                }
            }
        }
    }

    .task-footer {
        width: 100%;
        margin-top: auto;

        .task-comment {
            height: 100%;
            padding: calc(var(--padding) / 2);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);

            div {
                * {
                    margin: revert;
                    padding: revert;
                }

                a {
                    pointer-events: none;
                    text-decoration: none;
                }
            }
        }
    }
}
</style>
