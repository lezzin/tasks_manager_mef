<script setup lang="ts">
import type { Topic } from "@/interfaces/Topic";

import { RouterLink, useRouter } from "vue-router";
import { inject, markRaw, ref } from "vue";

import { useAuthStore } from "../../stores/authStore";

import { useConfirmModal } from "../../composables/useConfirmModal";
import { useToast } from "../../composables/useToast";
import { useModal } from "../../composables/useModal";
import { useTopic } from "../../composables/useTopic";

import TopicFormEdit from "../forms/TopicFormEdit.vue";
import UIButton from "../ui/UIButton.vue";
import CreatorLink from "../shared/CreatorLink.vue";
import { useSidebarStore } from "@/stores/sidebarStore";

const emit = defineEmits(["close"]);

const { deleteTopic, deleteAllTopics } = useTopic();
const { showToast } = useToast();
const { user } = useAuthStore();

const sidebarStore = useSidebarStore();
const router = useRouter();
const modal = useModal();

interface TopicNavigationProps {
    data?: Topic[] | null;
}

const props = defineProps<TopicNavigationProps>();

const { setConfirmModal } = useConfirmModal();

const selectedTopic = inject("selectedTopic") as any;
const editingTopic = ref<string>("");

const closeTopicsMenu = () => emit("close");

const openEditTopicModal = (topicName: string) => {
    editingTopic.value = topicName;
    modal.component.value = markRaw(TopicFormEdit) as any;
    modal.showModal();
};

const confirmTopicRemotion = (topicId: string) => {
    setConfirmModal(
        "Tem certeza que deseja excluir esse tópico? Essa ação não poderá ser desfeita!",
        () => handleDeleteTopic(topicId)
    );
};

const confirmAllTopicsRemotion = () => {
    setConfirmModal(
        "Tem certeza que deseja excluir TODOS os seus tópicos? Essa ação não poderá ser desfeita!",
        handleDeleteAllTopics
    );
};

const handleDeleteTopic = async (topicId: string) => {
    if (!user?.uid) return;

    try {
        await deleteTopic(topicId, user.uid);
        showToast("success", "Tópico excluído com sucesso.");
        selectedTopic.value = null;
        if (router.currentRoute.value.fullPath !== "/") router.push("/");
    } catch (error) {
        const err = error as Error;
        showToast("danger", err.message ?? "Erro desconhecido. Tente novamente mais tarde.");
    }
};

const handleDeleteAllTopics = async () => {
    if (!user?.uid) return;

    try {
        await deleteAllTopics(user.uid);
        showToast("success", "Todos os tópicos foram excluídos com sucesso.");
        selectedTopic.value = null;
    } catch (error) {
        const err = error as Error;
        showToast("danger", err.message ?? "Erro desconhecido. Tente novamente mais tarde.");
    }
};
</script>

<template>
    <div v-if="props.data?.length">
        <h2 class="subtitle">Seus tópicos</h2>
        <div class="topics-nav">
            <div
                class="topic"
                v-for="topic in props.data"
                :key="topic.id"
                :class="{ active: selectedTopic && topic.name === selectedTopic.name }"
            >
                <RouterLink
                    @click="closeTopicsMenu"
                    :to="'/topic/' + topic.id"
                    class="topic__link btn"
                    role="button"
                    :title="'Acessar tópico ' + topic.name"
                    aria-label="Acessar tópico"
                >
                    <p class="text text--bold">{{ topic.name }}</p>
                    <p class="text text--small text--muted">
                        {{
                            `${topic.tasks_length} ${
                                topic.tasks_length === 1 ? "tarefa" : "tarefas"
                            }`
                        }}
                    </p>
                </RouterLink>

                <div class="topic__actions">
                    <UIButton
                        isRounded
                        title="Editar tópico"
                        @click="openEditTopicModal(topic.name)"
                    >
                        <fa icon="pen" />
                    </UIButton>
                    <UIButton
                        isRounded
                        title="Excluir tópico"
                        @click="confirmTopicRemotion(topic.id)"
                    >
                        <fa icon="trash" />
                    </UIButton>
                </div>
            </div>
        </div>
    </div>

    <div class="footer" v-if="props.data?.length">
        <span class="divider"></span>

        <div class="footer__buttons">
            <UIButton title="Acessar Kanban" isLink to="/kanban" variant="outline-primary-small">
                <fa icon="chart-simple" />
                Acessar Kanban
            </UIButton>

            <UIButton
                title="Acessar Pomodoro"
                isLink
                to="/pomodoro"
                variant="outline-primary-small"
            >
                <fa icon="clock" />
                Acessar Pomodoro
            </UIButton>

            <UIButton
                title="Visualização geral"
                isLink
                @click="() => (sidebarStore.isTopicSidebarActive = false)"
                to="/general"
                variant="outline-primary-small"
            >
                <fa icon="eye" />
                Visão geral das tarefas
            </UIButton>

            <UIButton
                title="Excluir todos os tópicos"
                variant="outline-danger-small"
                @click="confirmAllTopicsRemotion"
            >
                <fa icon="trash" />
                Excluir todos os tópicos
            </UIButton>
        </div>

        <CreatorLink />
    </div>

    <p class="text text--center" v-else>Nenhum tópico cadastrado</p>

    <Teleport to="#modal">
        <Transition>
            <TopicFormEdit v-if="modal.show.value" @close="modal.hideModal" :topic="editingTopic" />
        </Transition>
    </Teleport>
</template>

<style scoped>
.topics-nav {
    display: flex;
    flex-direction: column;
    margin: 0.5rem 0 1rem;
    gap: 0.6rem;

    .topic {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-decoration: none;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        transition: all var(--screen-transition);
        padding: 0 1.5rem;

        &.active {
            background-color: var(--details-color);

            .topic__link,
            .topic__actions {
                color: var(--font-secondary);
            }
        }

        &:hover:not(.active) {
            background-color: var(--bg-secondary);
        }

        .topic__link {
            flex-direction: column;
            align-items: flex-start;
            flex: 1;
            padding: 1rem;

            &.router-link-exact-active .text--muted {
                opacity: 1;
            }

            &:hover {
                filter: none;
            }
        }

        .topic__actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            width: min-content;

            .btn {
                border: 1px solid transparent;

                &:hover {
                    filter: unset;
                    border-color: var(--border-color);
                }
            }
        }
    }
}

.footer {
    margin-top: auto;
}

.footer__buttons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 1rem;
}

.footer__buttons > * {
    flex: 1;
    width: fit-content;
}
</style>
