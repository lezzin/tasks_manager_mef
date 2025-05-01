import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig(() => {
    const env = loadEnv("mock", process.cwd(), "");
    const processEnvValues = {
        "process.env": Object.entries(env).reduce((prev, [key, val]) => {
            return {
                ...prev,
                [key]: val,
            };
        }, {}),
    };

    return {
        plugins: [vue()],
        define: processEnvValues,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
    };
});
