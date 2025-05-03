<script setup lang="ts">
import UIModal from "../ui/UIModal.vue";
import UIButton from "../ui/UIButton.vue";
import type { ConfirmModalInterface } from "@/interfaces/ConfirmModal";

interface ConfirmModalProps {
    modal: ConfirmModalInterface;
}

type ConfirmModalEmits = {
    (e: "close"): void;
};

const props = defineProps<ConfirmModalProps>();
const emit = defineEmits<ConfirmModalEmits>();

const closeShowingModal = () => emit("close");
const handleCallback = () => {
    props.modal?.callback && props.modal?.callback();
    emit("close");
};
</script>

<template>
    <UIModal titleId="confirm-modal-title" @close="closeShowingModal">
        <template #title>Confirmar ação</template>

        <template #body>
            <p class="text">{{ modal?.message }}</p>
        </template>

        <template #footer>
            <div class="btn-group">
                <UIButton variant="outline-danger" @click="closeShowingModal"> Cancelar </UIButton>

                <UIButton variant="primary" @click="handleCallback"> Confirmar </UIButton>
            </div>
        </template>
    </UIModal>
</template>

<style scoped>
.text {
    margin-block: 1rem;
}

.btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
</style>
