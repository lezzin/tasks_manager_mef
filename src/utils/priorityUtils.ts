import type { TaskPriority } from "@/interfaces/Task.ts";
import { TASK_PRIORITIES } from "./variables.ts";

export function getPriorityClass(priority: TaskPriority): string {
    return (
        {
            [TASK_PRIORITIES.high]: "priority-high",
            [TASK_PRIORITIES.medium]: "priority-medium",
            [TASK_PRIORITIES.low]: "priority-low",
            [TASK_PRIORITIES.completed]: "completed",
        }[priority] ?? ""
    );
}

export function getPriorityText(priority: TaskPriority): string {
    return (
        {
            [TASK_PRIORITIES.high]: "Alta prioridade",
            [TASK_PRIORITIES.medium]: "Média prioridade",
            [TASK_PRIORITIES.low]: "Baixa prioridade",
        }[priority] || ""
    );
}

export function getPriorityIcon(priority: TaskPriority): string {
    return (
        {
            [TASK_PRIORITIES.high]: "arrow-up",
            [TASK_PRIORITIES.medium]: "arrow-right",
            [TASK_PRIORITIES.low]: "arrow-down",
            [TASK_PRIORITIES.completed]: "check-circle",
        }[priority] || ""
    );
}
