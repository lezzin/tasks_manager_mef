<script setup lang="ts">
import UIModal from "../ui/UIModal.vue";

interface CommentModalProps {
    comment?: string;
}

type CommentModalEmits = {
    (e: "close"): void;
};

defineProps<CommentModalProps>();
defineEmits<CommentModalEmits>();
</script>

<template>
    <UIModal @close="$emit('close')" titleId="comment-modal-title">
        <template #title>Comentários da tarefa</template>

        <template #body>
            <div
                class="markdown-content markdown-content--normal"
                v-html="comment"
                aria-live="polite"
                aria-describedby="comment-modal-title"
                role="document"
            ></div>
        </template>
    </UIModal>
</template>

<style scoped>
.markdown-content {
    overflow-y: auto;
    padding: var(--padding);
}

.markdown-content a {
    word-break: break-all;
    padding: var(--padding);
}
</style>
