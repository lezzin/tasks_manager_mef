<script setup lang="ts">
import type { SuggestionResponse } from "@/interfaces/SuggestionResponse.ts";
import type { TaskAddInterface, TaskPriority } from "@/interfaces/Task.ts";

import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { TASK_PRIORITIES } from "../../utils/variables.ts";

import { useAuthStore } from "../../stores/authStore";
import { useGemini } from "../../composables/useGemini";
import { useToast } from "../../composables/useToast";
import { useTask } from "../../composables/useTask";

import InputRecognition from "../utilities/InputRecognition.vue";
import MarkdownEditor from "../utilities/MarkdownEditor.vue";
import UIButton from "../ui/UIButton.vue";
import UIDropdown from "../ui/UIDropdown.vue";
import UIModal from "../ui/UIModal.vue";

interface TaskFormAddProps {
    topicId?: string;
    topicName?: string;
    id: string;
}

type TaskFormAddEmits = {
    (e: "close"): void;
};

interface geminiSuggestedTaskProps {
    data: SuggestionResponse | null;
    usageRemaining: number | null;
}

const props = defineProps<TaskFormAddProps>();
const emit = defineEmits<TaskFormAddEmits>();

const { user } = useAuthStore();
const { suggestTask, getUsageCount } = useGemini();
const { showToast } = useToast();
const { addTask, getUserTasksByTopic } = useTask();

const filterTask = inject("filterTask") as any;
const searchTask = inject("searchTask") as any;

const geminiSuggestedTask = reactive<geminiSuggestedTaskProps>({
    data: null,
    usageRemaining: null,
});

const isGeminiDropdownActive = ref(false);
const isRequestingGemini = ref(false);

const taskName = ref<string>("");
const taskNameError = ref<string>("");

const taskPriority = ref<TaskPriority>(TASK_PRIORITIES.low);
const taskDate = ref<string>("");
const taskDateError = ref<string>("");
const taskComment = ref<string>("");
const generatedByAI = ref<boolean>(false);

const closeAddingTask = () => {
    taskName.value = "";
    taskDate.value = "";
    taskComment.value = "";
    taskPriority.value = TASK_PRIORITIES.low;
    filterTask.value = "all";
    searchTask.value = "";
    generatedByAI.value = false;

    emit("close");
};

const updateTaskName = (value: string) => {
    taskName.value = value;
    taskNameError.value = "";
};

const updateTaskComment = (value: string) => {
    taskComment.value = value;
};

const handleAddTask = async () => {
    if (!user?.uid || !props.topicId || !props.topicName) return;

    try {
        const options: TaskAddInterface = {
            topicId: props.topicId,
            topicName: props.topicName,
            name: taskName.value,
            comment: taskComment.value,
            priority: taskPriority.value,
            delivery_date: taskDate.value,
            generatedByAI: generatedByAI.value,
        };

        await addTask(options, user.uid);
        closeAddingTask();
        showToast("success", "Tarefa adicionada com sucesso.");
    } catch (error: any) {
        const errors: Record<string, string> = {
            "empty-name": "Preencha o campo de nome.",
            "invalid-date": "Formato de data incorreto.",
        };

        showToast("danger", errors[error.code] ?? "Erro desconhecido. Contate os administradores.");
    }
};

const toggleGeminiDropdown = () => {
    isGeminiDropdownActive.value = !isGeminiDropdownActive.value;
};

const requestSuggestion = async () => {
    isRequestingGemini.value = true;
    taskNameError.value = "";

    if (!user?.uid || !props.topicId) return;

    try {
        const selectedTopicTasks = await getUserTasksByTopic(props.topicId, user.uid);
        const suggestionResponse = await suggestTask(selectedTopicTasks, user.uid);

        if (suggestionResponse.error) {
            showToast("danger", suggestionResponse.error);
            return;
        }

        if (!user?.uid) return;

        geminiSuggestedTask.usageRemaining = await getUsageCount(user.uid);
        geminiSuggestedTask.data = suggestionResponse;

        taskName.value = geminiSuggestedTask.data.task ?? "";
        taskComment.value = geminiSuggestedTask.data.details ?? "";
        generatedByAI.value = true;
    } catch (error: any) {
        showToast("danger", `Erro ao obter sugestão de tarefa.`);
    } finally {
        isRequestingGemini.value = false;
    }
};

const addSubtaskToTaskName = (subtask: string) => {
    taskName.value = subtask;
};

const buttonHtml = computed(() => {
    if (!geminiSuggestedTask.usageRemaining) return 0;

    const usageCount =
        geminiSuggestedTask.usageRemaining > 0
            ? `${geminiSuggestedTask.usageRemaining} restantes`
            : "limite atingido";

    return isRequestingGemini.value ? "Criando sugestão..." : `Pedir sugestão à IA (${usageCount})`;
});

onMounted(async () => {
    if (!user?.uid) return;
    geminiSuggestedTask.usageRemaining = await getUsageCount(user.uid);
});

watch(taskDate, () => (taskDateError.value = ""));
</script>

<template>
    <UIModal @close="closeAddingTask" titleId="add-task-modal-title">
        <template #title>Adicionar tarefa</template>
        <template #body>
            <form @submit.prevent="handleAddTask" aria-describedby="modal-add-task-title">
                <div class="add-input">
                    <InputRecognition
                        label="Nome da tarefa"
                        placeholder="Adicionar tarefa..."
                        v-model:modelValue="taskName"
                        :errorMessage="taskNameError"
                        enableVoiceRecognition
                        inputId="add-task-name"
                        @update="updateTaskName"
                    />

                    <UIButton
                        v-if="!geminiSuggestedTask.data"
                        variant="outline-primary-smallest"
                        @click="requestSuggestion"
                        :disabled="geminiSuggestedTask.usageRemaining === 0 || isRequestingGemini"
                        title="Pedir uma sugestão"
                    >
                        <img
                            src="/src/assets/img/gemini-logo.png"
                            width="18"
                            height="18"
                            alt="Logo do Gemini"
                        />
                        <span> {{ buttonHtml }} </span>
                    </UIButton>

                    <UIDropdown
                        v-else
                        :isActive="isGeminiDropdownActive"
                        @trigger="toggleGeminiDropdown"
                    >
                        <template #trigger="{ trigger }">
                            <UIButton
                                variant="outline-primary-smallest"
                                @click="() => trigger"
                                :title="isGeminiDropdownActive ? 'Esconder' : 'Visualizar'"
                            >
                                <img
                                    src="/src/assets/img/gemini-logo.png"
                                    width="18"
                                    height="18"
                                    alt="Logo do Gemini"
                                />
                                <span>
                                    {{ isGeminiDropdownActive ? "Esconder" : "Visualizar" }}
                                    detalhes da sugestão
                                </span>
                            </UIButton>
                        </template>

                        <template #menu>
                            <div class="gemini__feedback text text--small">
                                <div class="feedback">
                                    <p
                                        class="text text--small"
                                        v-if="geminiSuggestedTask.usageRemaining"
                                    >
                                        Você tem
                                        <span class="text--bold">{{
                                            geminiSuggestedTask.usageRemaining
                                        }}</span>
                                        usos restantes.
                                    </p>
                                </div>

                                <div class="feedback">
                                    <h4>Justificativa:</h4>
                                    <p class="text text--small">
                                        {{ geminiSuggestedTask.data.justification }}
                                    </p>
                                </div>

                                <div
                                    v-if="
                                        geminiSuggestedTask?.data.subtasks &&
                                        geminiSuggestedTask?.data?.subtasks?.length > 0
                                    "
                                    class="feedback"
                                >
                                    <h4>Subtarefas sugeridas:</h4>
                                    <div class="gemini__suggestions">
                                        <button
                                            type="button"
                                            v-for="(subtask, index) in geminiSuggestedTask.data
                                                .subtasks"
                                            :key="index"
                                            @click="addSubtaskToTaskName(subtask)"
                                        >
                                            {{ subtask }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UIDropdown>
                </div>

                <div :class="['form-group', taskDateError ? 'input-error' : '']">
                    <label class="text" for="add-task-date">Data de entrega (opcional)</label>
                    <input
                        type="date"
                        v-model="taskDate"
                        id="add-task-date"
                        aria-describedby="add-task-date-help"
                    />
                    <small id="add-task-date-help" class="sr-only"
                        >Selecione uma data, se houver.</small
                    >
                    <p class="text text--error" v-if="taskDateError">
                        {{ taskDateError }}
                    </p>
                </div>

                <MarkdownEditor
                    label="Comentários (opcional)"
                    v-model:modelValue="taskComment"
                    @update="updateTaskComment"
                />

                <div class="form-group">
                    <label class="text" for="edit-task-priority">Prioridade</label>
                    <div class="select">
                        <select
                            id="edit-task-priority"
                            v-model="taskPriority"
                            aria-label="Selecionar prioridade"
                        >
                            <option value="1">Baixa</option>
                            <option value="2">Média</option>
                            <option value="3">Alta</option>
                        </select>
                    </div>
                </div>

                <UIButton
                    type="submit"
                    variant="primary"
                    title="Concluir adição da tarefa"
                    :disabled="isRequestingGemini"
                >
                    <fa icon="check" /> Adicionar tarefa
                </UIButton>
            </form>
        </template>
    </UIModal>
</template>

<style scoped>
.add-input {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
}

.add-input .dropdown {
    width: 100%;
}

.gemini__toggler {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.gemini__feedback {
    display: grid;
    gap: 1.5rem;
    padding: 1rem;

    .dropdown__menu {
        width: 100%;
    }
}

.feedback {
    display: grid;
    gap: 0.5rem;

    h4 {
        font-weight: 600;
    }
}

.gemini__suggestions {
    display: grid;

    button {
        text-align: left;
        padding: 0.4rem 0.8rem;
        padding: 0.5rem;
        border: none;
        cursor: pointer;
        background: transparent;
        color: var(--details-color);
        transition: color var(--screen-transition) ease;

        &:hover {
            color: var(--details-color-dark);
        }
    }
}
</style>
