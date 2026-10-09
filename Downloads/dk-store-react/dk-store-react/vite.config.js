import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Two pages: the store (index.html) and the admin dashboard (admin.html).
// While developing, /api calls are forwarded to the server started with: node dk-store.cjs
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:3000" } },
  build: { rollupOptions: { input: { main: "index.html", admin: "admin.html" } } },
});
