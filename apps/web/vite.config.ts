import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon.svg"],
      manifest: {
        name: "Stàged",
        short_name: "Stàged",
        description: "Free, offline-first household meal coordination",
        theme_color: "#16a34a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/index\.html$/,
            handler: "CacheFirst",
            options: { cacheName: "shell" },
          },
          {
            urlPattern: /\/api\/recipes/, // API recipes
            handler: "StaleWhileRevalidate",
            options: { cacheName: "recipes" },
          },
          {
            urlPattern: /\/api\/(lists|households)/,
            handler: "NetworkFirst",
            options: { cacheName: "lists" },
          },
        ],
      },
    }),
  ],
});
