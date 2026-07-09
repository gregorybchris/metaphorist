import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { curationPlugin } from "./vite-plugin-curation.ts";
import { metaphorDatasetPlugin } from "./vite-plugin-dataset.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), metaphorDatasetPlugin(), curationPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3001,
  },
});
