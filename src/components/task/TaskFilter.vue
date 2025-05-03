<script setup lang="ts">
import { ref, watch } from "vue";
import UIButton from "../ui/UIButton.vue";

interface TaskFilterProps {
    filterTask: string;
    searchTask: string;
}

type TaskFilterEmits = {
    (e: "search", value: string): void;
    (e: "filter", value: string): void;
};

const props = defineProps<TaskFilterProps>();
const emit = defineEmits<TaskFilterEmits>();

const localSearch = ref(props.searchTask);
const localFilter = ref(props.filterTask);

watch(
    () => props.searchTask,
    (newVal) => {
        localSearch.value = newVal;
    }
);

watch(
    () => props.filterTask,
    (newVal) => {
        localFilter.value = newVal;
    }
);

const handleSearchInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    localSearch.value = value;
    emit("search", value);
};

const handleFilterChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    localFilter.value = value;
    emit("filter", value);
};
</script>

<template>
    <header class="filter-container" role="banner">
        <form @submit.prevent aria-labelledby="search-task-label">
            <div class="form-group">
                <label for="search-task" id="search-task-label" class="text">Pesquisar</label>
                <div class="input-group">
                    <input
                        type="text"
                        id="search-task"
                        placeholder="Descrição da tarefa"
                        v-model="localSearch"
                        @input="handleSearchInput"
                        autocomplete="off"
                        aria-describedby="search-task-help"
                    />

                    <span id="search-task-help" class="sr-only">
                        Digite a descrição da tarefa para buscar
                    </span>

                    <UIButton type="submit" title="Pesquisar tarefa">
                        <fa icon="search" />
                        <span class="sr-only">Pesquisar</span>
                    </UIButton>
                </div>
            </div>
        </form>

        <form @submit.prevent aria-labelledby="filter-task-label">
            <div class="form-group">
                <label for="filter-task" id="filter-task-label" class="text">Filtrar</label>
                <div class="select">
                    <select
                        id="filter-task"
                        v-model="localFilter"
                        @change="handleFilterChange"
                        aria-describedby="filter-task-help"
                    >
                        <option value="all">Todas</option>
                        <option value="completed">Concluídas</option>
                        <option value="not-completed">Não concluídas</option>
                    </select>
                    <span id="filter-task-help" class="sr-only">
                        Escolha um filtro para as tarefas
                    </span>
                </div>
            </div>
        </form>
    </header>
</template>

<style scoped>
.filter-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;

    @media (width <=768px) {
        flex-wrap: wrap;

        form {
            width: 100%;
        }
    }
}
</style>
