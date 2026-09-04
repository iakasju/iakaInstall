import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Le coeur pur des scripts (pin, matrice, vocabulaire) est teste au meme
    // titre que le front — c'est lui qui garde la conformite de la release.
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.{test,spec}.mjs"],
    css: { include: [/chartes\.css/] },
  },
});
