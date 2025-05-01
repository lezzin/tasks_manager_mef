export interface Task {
    id: string;
    name: string;
    status: boolean;
    created_at: string;
    priority: number;
    comment?: string;
    delivery_date: string;
    kanbanStatus: string;
    topicId: string;
    topicName: string;
}

export type TaskAddInterface = Omit<Task, "id" | "status" | "created_at" | "kanbanStatus">;
export type TaskEditInterface = Omit<Task, "id" | "status" | "created_at" | "kanbanStatus">;
