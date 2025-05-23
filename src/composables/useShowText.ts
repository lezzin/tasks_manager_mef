import { ref } from "vue";

const STORAGE_KEY = "texts-to-show";

const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
const texts = ref({ topicAddForm: true, ...stored });

const getText = (key?: string): string | null => (key ? texts.value?.[key] : null);

const setText = (key: string, value: boolean) => {
    texts.value[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(texts.value));
};

export const useShowText = () => {
    return {
        getText,
        setText,
        texts,
    };
};
