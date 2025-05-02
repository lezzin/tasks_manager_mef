<script setup lang="ts">
import { RouterView } from "vue-router";

import { useToast } from "./composables/useToast";
import { useConfirmModal } from "./composables/useConfirmModal";

import LoaderContainer from "./components/shared/LoaderContainer.vue";
import ConfirmModal from "./components/modal/ConfirmModal.vue";
import ToastFeedback from "./components/shared/ToastFeedback.vue";
import MyHeader from "./components/layout/MyHeader.vue";

const { toast, closeToast, showToast } = useToast();
const { modalData, hideConfirmModal } = useConfirmModal();
</script>

<template>
    <LoaderContainer />

    <MyHeader />

    <main>
        <RouterView></RouterView>
    </main>

    <Teleport to="#toast">
        <ToastFeedback :data="toast" @close="closeToast" />
    </Teleport>

    <Teleport to="#modal">
        <Transition>
            <ConfirmModal v-if="modalData.show" :modal="modalData" @close="hideConfirmModal" />
        </Transition>
    </Teleport>
</template>
