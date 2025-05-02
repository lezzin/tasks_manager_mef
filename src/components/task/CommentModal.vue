<script setup lang="ts">
import UIModal from "../ui/UIModal.vue";

interface CommentModalProps {
    comment?: string;
}

const props = defineProps<CommentModalProps>();
const emit = defineEmits<{
    (e: "close"): void;
}>();

const closeShowingComment = () => {
    emit("close");
};
</script>

<template>
    <UIModal @close="closeShowingComment" titleId="comment-modal-title">
        <template #title>Comentários da tarefa</template>

        <template #body>
            <div
                class="markdown-content markdown-content--normal"
                v-html="props.comment"
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
