<script setup lang="ts">
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
            </template>

            <template #footer>
                <div class="btn-group">
                    <UIButton variant="outline-danger" @click="closeShowingModal">
                        Cancelar
                    </UIButton>

                    <UIButton variant="primary" @click="handleCallback"> Confirmar </UIButton>
                </div>
            </template>
        </UIModal>
    </Teleport>
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
