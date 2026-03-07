import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Stàged',
        short_name: 'Stàged',
        description: 'Free, offline-first household meal coordination',
        theme_color: '#ffffff',
        icons: [],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/index\.html$/,
            handler: 'CacheFirst',
            options: { cacheName: 'shell' },
          },
          {
            urlPattern: /\/api\/recipes/, // API recipes
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'recipes' },
          },
          {
            urlPattern: /\/api\/(lists|households)/,
            handler: 'NetworkFirst',
            options: { cacheName: 'lists' },
          },
        ],
      },
    }),
  ],
})
