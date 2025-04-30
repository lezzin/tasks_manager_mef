<script setup>
import UIModal from "../ui/UIModal.vue";
import UIButton from "../ui/UIButton.vue";

defineProps({
    message: {
        type: String,
    },
});

const emit = defineEmits(["close", "callback"]);

const closeShowingModal = () => emit("close");
const handleCallback = () => {
    emit("close");
    emit("callback");
};
</script>

<template>
    <Teleport to="#modal">
        <UIModal titleId="confirm-modal-title" @close="closeShowingModal">
            <template #title>Confirmar ação</template>

            <template #body>
                <p class="text">{{ message }}</p>

                <div class="btn-group">
                    <UIButton variant="primary" @click="handleCallback">Confirmar</UIButton>
                    <UIButton variant="danger" @click="closeShowingModal">Cancelar</UIButton>
                </div>
            </template>
        </UIModal>
    </Teleport>
</template>

<style scoped>
.text {
    margin-block: 2rem;
}

.btn-group {
    display: flex;
    margin-top: 1rem;
    gap: 1rem;
}
</style>
