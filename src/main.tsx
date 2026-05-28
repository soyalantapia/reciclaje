import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './routes'
import { useThemeEffect } from './hooks/useThemeEffect'
import './index.css'

function AppShell() {
  useThemeEffect()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </>
  )
}

/**
 * Cleanup defensivo de Service Workers huérfanos (Workbox viejo) que pudieran
 * pisar a MSW. Solo en producción; en dev MSW es el único SW. Si limpia algo,
 * recarga una vez (flag en sessionStorage evita loops).
 */
async function purgeOrphanServiceWorkers(): Promise<boolean> {
  if (import.meta.env.DEV) return false
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false
  const KEY = 'reciclaxp:sw-purged-v1'
  if (sessionStorage.getItem(KEY) === '1') return false

  const regs = await navigator.serviceWorker.getRegistrations()
  let purged = false
  for (const reg of regs) {
    const url =
      reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || ''
    if (url && !url.includes('mockServiceWorker.js')) {
      try {
        await reg.unregister()
        purged = true
      } catch {
        /* ignore */
      }
    }
  }
  if (purged && 'caches' in self) {
    try {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
    } catch {
      /* ignore */
    }
  }
  if (purged) {
    sessionStorage.setItem(KEY, '1')
    window.location.reload()
    return true
  }
  return false
}

async function bootstrap() {
  if (await purgeOrphanServiceWorkers()) return

  if (import.meta.env.VITE_USE_MSW !== 'false') {
    const { startMockWorker } = await import('./services/mocks/browser')
    await startMockWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppShell />
    </StrictMode>,
  )
}

bootstrap()
