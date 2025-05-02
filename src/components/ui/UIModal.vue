<script setup lang="ts">
import UIButton from "./UIButton.vue";

interface UIModalProps {
    titleId: string;
}

withDefaults(defineProps<UIModalProps>(), {
    titleId: "modal-title",
});
const emit = defineEmits(["close"]);

const closeModal = () => emit("close");
</script>

<template>
    <Transition name="modal">
        <aside
            class="modal"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            @click.self="closeModal"
        >
            <div class="modal__dialog">
                <div class="modal__header">
                    <h2 :id="titleId" class="modal__title">
                        <slot name="title">Modal</slot>
                    </h2>
                    <UIButton @click="closeModal" title="Fechar modal">
                        <fa icon="times" />
                    </UIButton>
                </div>

                <div class="modal__body">
                    <slot name="body"></slot>
                </div>

                <div class="modal__footer" v-if="$slots.footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </aside>
    </Transition>
</template>

<style scoped>
.modal {
    position: fixed;
    background-color: #000000b3;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 990;
}

.modal__dialog {
    background-color: var(--bg-primary);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    width: 95%;
    max-width: 500px;
    transition: transform var(--screen-transition) ease-in-out;
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr;
    max-height: 90dvh;
}

.modal__title {
    font-size: 2.4rem;
    font-weight: 600;
}

.modal__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--padding);
    background: var(--bg-secondary);
}

.modal__body {
    width: 100%;
    overflow-y: auto;
    padding: var(--padding);
}

.modal__footer {
    width: 100%;
    padding: var(--padding);
    border-top: 1px solid var(--border-color);
}
</style>
