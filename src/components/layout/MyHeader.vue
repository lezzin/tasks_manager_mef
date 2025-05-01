<script setup lang="ts">
import { baseUrl } from "../../utils/urlUtils";
import { auth } from "../../libs/firebase";

import { useRouter } from "vue-router";
import { ref } from "vue";
import { storeToRefs } from "pinia";

import { useToast } from "../../composables/useToast";
import { useAuthStore } from "../../stores/authStore.ts";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useLoadingStore } from "../../stores/loadingStore";

import UIButton from "../ui/UIButton.vue";
import UIDropdown from "../ui/UIDropdown.vue";
import { useConfirmModal } from "../../composables/useConfirmModal";

const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const { logout, deleteAccount } = authStore;
const { user } = storeToRefs(authStore);
const { showToast } = useToast();
const { setConfirmModal } = useConfirmModal();

const sidebarStore = useSidebarStore();

const router = useRouter();
const isAccountDropdownActive = ref(false);

const toggleAccountDropdown = () => {
    isAccountDropdownActive.value = !isAccountDropdownActive.value;
};

const logoutUser = async () => {
    loadingStore.showLoader();

    try {
        await logout();
        router.push("/login");
        isAccountDropdownActive.value = false;
    } catch (error) {
        const err = error as Error & { code?: string };

        const errors: Record<string, () => void> = {
            "auth/network-request-failed": () =>
                "Falha na conexão de rede. Verifique sua conexão e tente novamente.",
            "auth/internal-error": () => "Erro interno do servidor. Tente novamente mais tarde.",
            "auth/no-current-user": () => "Nenhum usuário autenticado no momento.",
        };

        (errors[err.code ?? ""] || (() => showToast("danger", `Erro ao sair: ${err.message}`)))();
    } finally {
        loadingStore.hideLoader();
    }
};

const confirmRemotion = () => {
    setConfirmModal("Deseja realmente excluir esse usuário?", async () => await removeUser());
};

const removeUser = async () => {
    loadingStore.showLoader();

    try {
        await deleteAccount();
        router.push("/login");
        isAccountDropdownActive.value = false;
    } catch (error) {
        const err = error as Error & { code?: string };

        const errors: Record<string, () => void> = {
            "auth/requires-recent-login": () =>
                "Para excluir sua conta, faça login e tente novamente.",
            "auth/network-request-failed": () =>
                "Falha na conexão de rede. Verifique sua conexão e tente novamente.",
        };

        (errors[err.code ?? ""] || (() => showToast("danger", `Erro ao sair: ${err.message}`)))();
    } finally {
        loadingStore.hideLoader();
    }
};
</script>

<template>
    <header class="header-wrapper">
        <div class="header container">
            <div class="header__logo">
                <UIButton
                    variant="primary"
                    isIcon
                    @click="sidebarStore.toggleSidebar"
                    v-if="sidebarStore.canShowSidebarToggler"
                    title="Alternar menu de tópicos"
                >
                    <fa :icon="sidebarStore.isTopicSidebarActive ? 'times' : 'bars'" />
                </UIButton>

                <RouterLink to="/" title="Acessar página inicial" class="logo">
                    <img
                        :src="baseUrl('logo.svg')"
                        alt="TaskFlow - logo do website"
                        width="44"
                        height="44"
                        loading="lazy"
                    />
                </RouterLink>
            </div>

            <UIDropdown
                :isActive="isAccountDropdownActive"
                @update:isActive="toggleAccountDropdown"
                v-if="user"
            >
                <template #trigger="{ trigger }">
                    <UIButton
                        isBordered
                        class="account"
                        title="Abrir/fechar dropdown"
                        @click="toggleAccountDropdown"
                    >
                        <div class="account__details">
                            <p class="text text--small">Olá, {{ user.displayName }}</p>
                            <p class="text text--smallest">{{ user.email }}</p>
                        </div>

                        <img
                            class="account__avatar"
                            :src="user.photoURL ?? baseUrl('default-profile.png')"
                            alt="Foto de perfil do usuário"
                            width="37"
                            height="37"
                            :title="`Logado como: ${user.email}`"
                        />

                        <span class="account__arrow">
                            <fa icon="caret-down" />
                        </span>
                    </UIButton>
                </template>

                <template #menu>
                    <UIButton
                        isDropdown
                        variant="outline-danger"
                        @click="logoutUser"
                        title="Sair da minha conta"
                    >
                        <fa icon="right-from-bracket" /> Sair da conta
                    </UIButton>
                    <UIButton
                        isDropdown
                        variant="danger"
                        @click="confirmRemotion"
                        title="Excluir minha conta"
                    >
                        <fa icon="trash" /> Excluir conta
                    </UIButton>
                </template>
            </UIDropdown>
        </div>
    </header>
</template>

<style scoped>
.header-wrapper {
    background-color: var(--details-color);
    height: 10vh;
    box-shadow: var(--shadow-sm);
    border-bottom: 1px solid var(--border-color);
    position: fixed;
    inset: 0 0 auto;
    z-index: 10;

    .header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;

        .header__logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--font-secondary);

            button svg {
                font-size: 3rem;
            }

            .logo {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
                font-size: 2rem;
            }
        }
    }
}

.btn.account {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    cursor: pointer;
    background-color: var(--bg-secondary);

    .account__details {
        text-align: right;

        .text--small {
            font-weight: 500;
        }
    }

    @media (width <=768px) {
        .account__details {
            display: none;
        }
    }

    .account__avatar {
        border-radius: 50%;
        border: 1px solid var(--border-color);
    }

    .account__arrow {
        transform: translateY(-2px);
        margin-inline: 0.5rem;
    }
}
</style>
