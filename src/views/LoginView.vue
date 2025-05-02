<script setup lang="ts">
import { GOOGLE_AUTH_ERRORS, PAGE_TITLES } from "../utils/variables.ts";

import { ref, watchEffect, onMounted } from "vue";
import { useRouter } from "vue-router";
import { signInWithPopup } from "firebase/auth";

import { useToast } from "../composables/useToast.ts";
import { useAuthStore } from "../stores/authStore.ts";
import { useLoadingStore } from "../stores/loadingStore.ts";
import { useSidebarStore } from "../stores/sidebarStore.ts";

import UIButton from "../components/ui/UIButton.vue";
import CreatorLink from "../components/shared/CreatorLink.vue";
import { baseUrl } from "../utils/urlUtils.ts";

const { provider, auth } = defineProps(["provider", "auth"]);
const { showToast } = useToast();
const { user } = useAuthStore();
const loadingStore = useLoadingStore();

const router = useRouter();
const { setShowSidebarToggler } = useSidebarStore();

const loading = ref(false);

async function loginGoogle() {
    loading.value = true;

    try {
        await signInWithPopup(auth, provider);
        router.push("/");
    } catch (error: any) {
        showToast("danger", GOOGLE_AUTH_ERRORS[error.code ?? "default"] ?? error.message);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    if (user) {
        router.push("/");
    }

    document.title = PAGE_TITLES.login;
    setShowSidebarToggler(false);
    loadingStore.hideLoader();
});

watchEffect(() => {
    if (user) {
        router.push("/");
    }
});
</script>

<template>
    <div class="form-wrapper">
        <form
            style="--form-width: 450px"
            @submit.prevent="loginGoogle"
            role="form"
            aria-labelledby="login-heading"
        >
            <h2 id="login-heading" class="sr-only">Formulário de Login com Google</h2>

            <img :src="baseUrl('logo-login.svg')" alt="Logo do MeF" />

            <UIButton
                type="submit"
                :title="loading ? 'Entrando...' : 'Entrar com o Google'"
                :disabled="loading"
                aria-label="Entrar com o Google"
                aria-live="polite"
                aria-busy="loading"
            >
                <img
                    :src="baseUrl('google-logo.png')"
                    alt="Logo do Google"
                    width="24"
                    height="24"
                />
                <span v-if="loading">Carregando...</span>
                <span v-else>Entrar com o Google</span>
            </UIButton>

            <CreatorLink />
        </form>
    </div>
</template>

<style scoped>
.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    gap: 1rem;
}
</style>
