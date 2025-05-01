export type TaskStatus = "todo" | "doing" | "completed";
export type TaskPriority = 1 | 2 | 3 | 4;

export interface Task {
    id: string;
    name: string;
    status: boolean;
    created_at: string;
    priority: TaskPriority;
    comment?: string;
    delivery_date: string;
    kanbanStatus: TaskStatus;
    topicId: string;
    topicName: string;
}

export type TaskAddInterface = Omit<Task, "id" | "status" | "created_at" | "kanbanStatus">;
export type TaskEditInterface = Omit<Task, "id" | "status" | "created_at" | "kanbanStatus">;
