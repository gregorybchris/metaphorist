import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { metaphorDatasetPlugin } from "./vite-plugin-dataset.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), metaphorDatasetPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
