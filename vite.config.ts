import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// En GitHub Pages el sitio vive bajo /reciclaje/. En dev, bajo /.
const BASE = '/reciclaje/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    /**
     * PWA + MSW coexistencia (patrón validado en otros proyectos del equipo).
     *
     * VitePWA con auto-register inyecta un <script> que registra el SW de
     * Workbox en el MISMO scope que el SW de MSW. El segundo registro pisa
     * al primero → las requests a /api/* salen al network → 404 + HTML del
     * SPA fallback. Por eso:
     *   - injectRegister: null  → no se auto-registra Workbox; MSW es el
     *     único SW mientras VITE_USE_MSW != 'false'.
     *   - selfDestroying: true  → el sw.js generado se auto-desregistra al
     *     activarse, limpiando instalaciones viejas de Workbox.
     * Cuando exista backend real (`npm run build:no-msw`), pasar a
     * injectRegister: 'auto' y selfDestroying: false.
     */
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      selfDestroying: true,
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'ReciclaXP · Reciclá, sumá XP, cambiá tu mundo',
        short_name: 'ReciclaXP',
        description:
          'Reciclá tapitas y materiales, sumá XP, canjeá beneficios en una red de lugares adheridos y seguí la trazabilidad e impacto real de tu aporte.',
        theme_color: '#059669',
        background_color: '#f3faf6',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: BASE,
        scope: BASE,
        lang: 'es-AR',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['lifestyle', 'social', 'utilities'],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /\/api\//, /^.*\/api\//],
        globIgnores: ['**/mockServiceWorker.js'],
        navigateFallback: `${BASE}index.html`,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5183,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
}))
