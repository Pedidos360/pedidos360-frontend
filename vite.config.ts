import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// El frontend consulta /api/* en desarrollo y Vite lo reenvía al BFF
// accesible mediante el túnel SSH local (127.0.0.1:18090).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:18090",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api(?=\/|$)/, ""),
      },
    },
  },
});
