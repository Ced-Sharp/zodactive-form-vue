import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ZodactiveVue",
      fileName: (format) =>
        format === "es" ? "zodactive-vue.js" : `zodactive-vue.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "zod"],
      output: {
        globals: {
          vue: "Vue",
          zod: "zod",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
