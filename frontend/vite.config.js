import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite reads .env automatically. Anything prefixed with VITE_ is exposed
// to the app through import.meta.env (see src/api/axios.js).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
