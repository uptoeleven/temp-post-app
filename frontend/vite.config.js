import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    base: "/",
    plugins: [react()],
    server: {
      open: false,
      port: 3000,
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
    },
  };
});
