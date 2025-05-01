import { PRINCIPAL_DOC_NAME, TOPIC_MAX_LENGTH, TOPIC_MIN_LENGTH } from "../utils/variables.ts";
import { currentTime } from "../utils/dateUtils";
import { filterField } from "../utils/stringUtils";
import { db } from "../libs/firebase";

import {
    doc,
    DocumentReference,
    getDoc,
    setDoc,
    updateDoc,
    type DocumentData,
} from "firebase/firestore";

import { useTask } from "./useTask";
import type { Topic } from "@/interfaces/Topic.ts";
import type { Task } from "@/interfaces/Task.ts";

interface UserDataInterface {
    topics: Record<string, Topic>;
    tasks: Record<string, Task>;
}

const throwValidationError = (message: string, code: string): never => {
    const error = new Error(message);
    (error as any).code = code;
    throw error;
};

const getUserData = async (
    docRef: DocumentReference<DocumentData, DocumentData>
): Promise<UserDataInterface | null> => {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserDataInterface) : null;
};

const validateTopicName = (name: string): void => {
    if (!name) throwValidationError("Preencha o campo", "name");

    if (name.length < TOPIC_MIN_LENGTH)
        throwValidationError(`Insira pelo menos ${TOPIC_MIN_LENGTH} letras!`, "name");

    if (name.length > TOPIC_MAX_LENGTH)
        throwValidationError(
            `Você atingiu o limite de caracteres! (${name.length} de ${TOPIC_MAX_LENGTH})`,
            "name"
        );
};

const getTopicInfo = async (topicId: string, userId: string): Promise<Topic | null> => {
    const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
    const userData = await getUserData(docRef);

    return userData?.topics?.[topicId] || null;
};

const addTopic = async (name: string, userId: string): Promise<void> => {
    const formattedTopicName = filterField(name);
    validateTopicName(formattedTopicName);

    const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
    const userData = await getUserData(docRef);

    const existingTopic = Object.values(userData?.topics || {}).find(
        (topic) => topic.name === formattedTopicName
    );
    if (existingTopic) throwValidationError("Esse tópico já existe", "name");

    const uniqueId = Date.now().toString(26);

    await setDoc(docRef, {}, { merge: true });
    await updateDoc(docRef, {
        [`topics.${uniqueId}`]: {
            id: uniqueId,
            name: formattedTopicName,
            created_at: currentTime(),
        },
    });
};

const editTopic = async (newName: string, oldName: string, userId: string): Promise<void> => {
    const formattedTopicName = filterField(newName);
    validateTopicName(formattedTopicName);

    if (formattedTopicName === oldName) throwValidationError("Nome igual ao antigo.", "same-name");

    const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
    const userData = await getUserData(docRef);

    if (!userData) return;

    const topicId = Object.keys(userData?.topics || {}).find(
        (id) => userData.topics[id].name === oldName
    );
    if (!topicId) throwValidationError("Tópico antigo não encontrado", "not-found");

    await updateDoc(docRef, {
        [`topics.${topicId}.name`]: formattedTopicName,
    });
};

const deleteTopic = async (topicId: string, userId: string): Promise<void> => {
    const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
    const userData = await getUserData(docRef);

    if (!userData || !userData.topics?.[topicId] || !userData.topics) {
        throwValidationError("Tópico não encontrado.", "not-found");
        return;
    }

    const { getUserTasks } = useTask();
    const tasks = (await getUserTasks(userId)) as Record<string, Task>;

    const updatedTasks = Object.values(tasks).filter((task) => task.topicId !== topicId);
    delete userData.topics[topicId];

    await updateDoc(docRef, {
        topics: userData.topics,
        tasks: updatedTasks.reduce<Record<string, Task>>((acc, task) => {
            acc[task.id] = task;
            return acc;
        }, {}),
    });
};

const deleteAllTopics = async (userId: string): Promise<void> => {
    const docRef = doc(db, PRINCIPAL_DOC_NAME, userId);
    const userData = await getUserData(docRef);

    if (!userData || !userData.topics || Object.keys(userData.topics).length === 0)
        throwValidationError("Nenhum tópico encontrado para excluir.", "not-found");

    await updateDoc(docRef, { topics: {}, tasks: {} });
};

export const useTopic = () => ({
    addTopic,
    editTopic,
    deleteTopic,
    deleteAllTopics,
    getTopicInfo,
});
