<script setup>
import { RouterView } from "vue-router";

import { useToast } from "./composables/useToast";

import LoaderContainer from "./components/shared/LoaderContainer.vue";
import ToastFeedback from "./components/shared/ToastFeedback.vue";
import MyHeader from "./components/layout/MyHeader.vue";

const { toast, closeToast } = useToast();
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
</template>
