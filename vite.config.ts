import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// iakaInstall front (Tauri 2). Port 3040 : 3020 (IakaCockpit) et 3030 (iakaFrameGUI)
// sont deja pris (M-R8) — discipline « ports hote distincts par projet ».
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 3040,
    strictPort: true,
  },
  build: {
    target: "es2020",
  },
});
