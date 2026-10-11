import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "early-database-theme",
    // Keep this classic blocking script external. Vite's module scripts are deferred.
    transformIndexHtml: { order: "post", handler: () => [{ tag: "script", attrs: { src: "/api/theme.js" }, injectTo: "head" }] },
  }],
  server: { proxy: { "/api": "http://127.0.0.1:4000" } },
});
