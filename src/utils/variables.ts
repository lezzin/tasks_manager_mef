import type { TaskPriority, TaskPriorityString, TaskStatus } from "@/interfaces/Task";

const PRINCIPAL_DOC_NAME: string = "users";
const AI_USAGE_DOC_NAME: string = "ai_usage";

const PROJECT_TITLE: string = "Mentes em Flash";

type PageTitles = {
    login: string;
    not_found: string;
    home: {
        default: string;
        topic: (topicName: string) => string;
    };
    general: string;
    kanban: string;
    pomodoro: string;
};

const PAGE_TITLES: PageTitles = {
    login: `${PROJECT_TITLE} | Acessar sua conta`,
    not_found: `${PROJECT_TITLE} | Página não encontrada`,
    home: {
        default: `${PROJECT_TITLE} | Suas tarefas`,
        topic: (topicName: string): string => `${PROJECT_TITLE} | ${topicName}`,
    },
    general: `${PROJECT_TITLE} | Visão geral`,
    kanban: `${PROJECT_TITLE} | Kanban`,
    pomodoro: `${PROJECT_TITLE} | Pomodoro`,
};

const TASK_PRIORITIES: Record<TaskPriorityString, TaskPriority> = {
    low: 1,
    medium: 2,
    high: 3,
    completed: 4,
};

const TASK_KANBAN_STATUSES: Record<TaskStatus, TaskStatus> = {
    todo: "todo",
    doing: "doing",
    completed: "completed",
};

const TOAST_TIMEOUT: number = 5000;

const TOPIC_MAX_LENGTH: number = 20;
const TOPIC_MIN_LENGTH: number = 4;

const GOOGLE_AUTH_ERRORS: Record<string, string> = {
    "auth/popup-closed-by-user": "O processo de autenticação foi cancelado.",
    "auth/cancelled-popup-request": "Aguarde o processo de autenticação ser concluído.",
    "auth/popup-blocked":
        "O navegador bloqueou o pop-up de autenticação. Desative o bloqueador de pop-up.",
    "auth/account-exists-with-different-credential":
        "Essa conta já está associada a outro provedor de autenticação.",
    "auth/operation-not-allowed": "Autenticação com este provedor não está habilitada.",
    "auth/unauthorized-domain": "O domínio atual não está autorizado para autenticação.",
    "auth/user-disabled": "Esse email de usuário está desativado.",
    "auth/invalid-credential": "As credenciais fornecidas são inválidas ou expiraram.",
    "auth/web-storage-unsupported":
        "O navegador não é compatível com armazenamento da Web necessário para autenticação.",
    default: "Erro ao logar com o Google. Tente novamente mais tarde.",
};

export {
    TASK_KANBAN_STATUSES,
    TASK_PRIORITIES,
    TOAST_TIMEOUT,
    PAGE_TITLES,
    PRINCIPAL_DOC_NAME,
    AI_USAGE_DOC_NAME,
    TOPIC_MAX_LENGTH,
    TOPIC_MIN_LENGTH,
    GOOGLE_AUTH_ERRORS,
};
