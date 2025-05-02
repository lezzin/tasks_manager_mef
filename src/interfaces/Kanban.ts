import type { Firestore } from "firebase/firestore";
import type { Task } from "./Task";

export interface KanbanViewProps {
    db: Firestore;
}

export interface TaskList {
    todo: Task[];
    doing: Task[];
    completed: Task[];
}

export type TaskDirection = "prev" | "next";
export type DragAction = "start" | "end";