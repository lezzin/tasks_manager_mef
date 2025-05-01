import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../libs/firebase";

import { useAuthStore } from "../stores/authStore";
import { PRINCIPAL_DOC_NAME, TASK_KANBAN_STATUSES } from "../utils/variables.ts";
import { filterField } from "../utils/stringUtils";
import { currentTime } from "../utils/dateUtils";

import { useTopic } from "./useTopic";
import type { Task, TaskAddInterface, TaskPriority, TaskStatus } from "@/interfaces/Task.ts";

const { user } = useAuthStore();

type TaskMap = Record<string, Task>;

const throwValidationError = (message: string, code: string): never => {
    const error = new Error(message);
    (error as any).code = code;
    throw error;
};

const validateTaskName = (name: string): void => {
    if (!name) {
        throwValidationError("Preencha o campo", "empty-name");
    }
};

const validateDeliveryDate = (date?: string): void => {
    if (date) {
        const taskDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate < today) {
            throwValidationError("Insira uma data futura ou atual.", "invalid-date");
        }
    }
};

const checkUserTasks = async (): Promise<boolean> => {
    let hasAnyTask = false;

    if (!user?.uid) return false;

    try {
        const docRef = doc(db, PRINCIPAL_DOC_NAME, user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return false;

        const userData = docSnap.data();
        hasAnyTask = !!userData.tasks && Object.entries(userData.tasks).length > 0;
    } catch (error) {
        console.error("Error fetching user tasks:", error);
    }

    return hasAnyTask;
};

const getUserTasks = async (userId: string): Promise<TaskMap> => {
    try {
        const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throwValidationError("Documento não encontrado.", "doc-not-found");

        const userData = docSnap.data();
        return userData?.tasks ? { ...userData.tasks } : {};
    } catch (error) {
        throw error;
    }
};

const getUserTasksByTopic = async (topicId: string, userId: string): Promise<Task[]> => {
    const tasks = await getUserTasks(userId);
    return Object.values(tasks).filter((task) => task?.topicId === topicId);
};

const getUserTasksWithTopic = async (userId: string): Promise<Task[]> => {
    const data = await getUserTasks(userId);
    const userTasks = Object.values(data);
    const { getTopicInfo } = useTopic();

    await Promise.all(
        userTasks.map(async (task) => {
            const topic = await getTopicInfo(task.topicId, userId);
            if (!topic) return;

            task.topicName = topic.name;
        })
    );

    return userTasks;
};

const updateTasks = async (userId: string, tasks: TaskMap | null): Promise<void> => {
    const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
    await updateDoc(docRef, { tasks });
};

const addTask = async (options: TaskAddInterface, userId: string): Promise<void> => {
    const { topicId, topicName, name, comment, priority, delivery_date } = options;

    validateTaskName(name);
    validateDeliveryDate(delivery_date);

    const newTask: Task = {
        id: Date.now().toString(36),
        name: filterField(name),
        status: false,
        created_at: currentTime(),
        priority,
        comment: String(comment).trim() ?? "",
        delivery_date,
        kanbanStatus: TASK_KANBAN_STATUSES.todo,
        topicId,
        topicName,
    };

    const allTasks = await getUserTasks(userId);
    const updatedTasks = { ...allTasks, [newTask.id]: newTask };
    await updateTasks(userId, updatedTasks);
};

const editTask = async (
    taskToUpdate: Task,
    newName: string,
    newComment: string,
    newPriority: TaskPriority,
    newDeliveryDate: string,
    userId: string
): Promise<void> => {
    validateTaskName(newName);
    validateDeliveryDate(newDeliveryDate);

    const updatedTask: Task = {
        ...taskToUpdate,
        name: filterField(newName),
        priority: newPriority,
        delivery_date: newDeliveryDate,
        comment: String(newComment).trim() ?? "",
    };

    const allTasks = await getUserTasks(userId);
    const updatedTasks = { ...allTasks, [updatedTask.id]: updatedTask };
    await updateTasks(userId, updatedTasks);
};

const changeStatus = async (taskToUpdate: Task, userId: string): Promise<boolean> => {
    const newStatus = !taskToUpdate.status;
    const updatedTask: Task = {
        ...taskToUpdate,
        status: newStatus,
        kanbanStatus: newStatus ? TASK_KANBAN_STATUSES.completed : TASK_KANBAN_STATUSES.todo,
    };

    const allTasks = await getUserTasks(userId);
    const updatedTasks = { ...allTasks, [updatedTask.id]: updatedTask };
    await updateTasks(userId, updatedTasks);

    return newStatus;
};

const changeKanbanStatus = async (
    taskToUpdate: Task,
    newKanbanStatus: TaskStatus,
    userId: string
): Promise<void> => {
    const updatedTask: Task = {
        ...taskToUpdate,
        kanbanStatus: newKanbanStatus,
        status: newKanbanStatus === TASK_KANBAN_STATUSES.completed,
    };

    const allTasks = await getUserTasks(userId);
    const updatedTasks = { ...allTasks, [updatedTask.id]: updatedTask };
    await updateTasks(userId, updatedTasks);
};

const deleteTask = async (taskToDelete: Task, userId: string): Promise<void> => {
    const allTasks = await getUserTasks(userId);
    const { [taskToDelete.id]: _, ...remainingTasks } = allTasks;
    await updateTasks(userId, remainingTasks);
};

export const useTask = () => {
    return {
        changeKanbanStatus,
        changeStatus,
        getUserTasks,
        deleteTask,
        addTask,
        editTask,
        getUserTasksByTopic,
        getUserTasksWithTopic,
        checkUserTasks,
    };
};
