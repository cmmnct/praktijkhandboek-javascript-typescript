/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/assets\/img\/.*\.(?:png|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dagen
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Memory geheugentrainer',
        short_name: 'MemoryApp',
        description: 'Een eenvoudige geheugentrainer met statistieken en notificatie service',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'assets/img/icons/0.75x/memoryldpi.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/assets/img/icons/1x/memory.png',
            sizes: '513x513',
            type: 'image/png',
          },
        ],
      },
    })

  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'], // Zorgt dat Vitest alleen de tests-map pakt
  }
})
