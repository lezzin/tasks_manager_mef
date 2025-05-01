<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";

import { useToast } from "../../composables/useToast";
import { useTopic } from "../../composables/useTopic";
import { useAuthStore } from "../../stores/authStore";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useShowText } from "../../composables/useShowText";

import UIButton from "../ui/UIButton.vue";

const nameError = ref("");
const name = ref("");

const sidebarStore = useSidebarStore();
const showText = useShowText();

const { user } = useAuthStore();
const { addTopic } = useTopic();
const { showToast } = useToast();

const handleAddTopic = async () => {
    if (!user?.uid) return;

    try {
        await addTopic(name.value, user.uid);
        showToast("success", "Tópico criado com sucesso.");
        name.value = "";
    } catch (error) {
        const err = error as Error & { code?: string };

        if (err.code == "name") {
            nameError.value = err.message;
            return;
        }

        showToast("danger", "Erro desconhecido. Tente novamente mais tarde.");
    }
};

watch(name, () => (nameError.value = ""));

watchEffect(() => {
    if (!sidebarStore.isTopicSidebarActive) {
        nameError.value = "";
        name.value = "";
    }
});
</script>

<template>
    <form @submit.prevent="handleAddTopic" class="add-topic-form" aria-labelledby="add-topic-title">
        <h2 id="add-topic-title" class="sr-only">Adicionar Novo Tópico</h2>

        <div class="form-group">
            <div :class="['input-group', nameError ? 'input-error' : '']">
                <label for="new-topic" class="sr-only">Nome do novo tópico</label>
                <input
                    type="text"
                    id="new-topic"
                    placeholder="Adicionar novo tópico"
                    v-model="name"
                    :aria-invalid="!!nameError"
                    aria-describedby="topic-error"
                />

                <UIButton type="submit" title="Adicionar novo tópico">
                    <fa icon="plus" />
                </UIButton>
            </div>

            <p id="topic-error" class="text text--error" role="alert" v-if="nameError">
                {{ nameError }}
            </p>

            <p v-if="showText.getText('topicAddForm')" class="tip">
                Sugestão: insira o nome do deck que você está estudando!
                <span class="close-icon" @click="showText.setText('topicAddForm', false)">×</span>
            </p>
        </div>
    </form>
</template>

<style scoped>
.add-topic-form {
    width: 100%;
}
</style>
