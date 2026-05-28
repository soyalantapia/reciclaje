import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Arranca el SW de MSW.
 *
 *  - waitUntilReady: true     → la promesa no resuelve hasta que el SW
 *    controla la página; evita que los primeros fetch salgan al network.
 *  - onUnhandledRequest:'bypass' → deja pasar fonts/CDN sin ruido en consola.
 *  - updateViaCache:'none'    → fuerza descargar el SW fresco tras deploys
 *    (si agregamos un handler nuevo, no queremos el SW viejo cacheado).
 *
 * Workbox NO se registra automáticamente (vite.config: injectRegister:null),
 * así que MSW es el único SW en este scope.
 */
export async function startMockWorker() {
  if (import.meta.env.VITE_USE_MSW === 'false') return
  const base = import.meta.env.BASE_URL || '/'
  await worker.start({
    onUnhandledRequest: 'bypass',
    waitUntilReady: true,
    serviceWorker: {
      url: `${base}mockServiceWorker.js`,
      options: { updateViaCache: 'none' },
    },
  })
}
