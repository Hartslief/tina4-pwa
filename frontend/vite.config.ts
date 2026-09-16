import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    resolve: {
        alias: {
            // import.meta.dirname, not __dirname: Vite's native config loader does
            // not define __dirname, and it becomes the default in a future major.
            "@": resolve(import.meta.dirname, "src"),
        },
    },
    test: {
        // tina4-js is a Web Components framework: importing it touches HTMLElement
        // at module load, so tests need a DOM. Without this every test file fails
        // to import with "ReferenceError: HTMLElement is not defined".
        environment: "jsdom",
    },
    server: {
        port: 5173,
        // Proxy API calls to tina4-php/python backend in dev
        proxy: { "/api": "http://localhost:7146" },
    },
});
