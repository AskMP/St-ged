import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
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
    }),
  ],
})
