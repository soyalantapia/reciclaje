import { lazy, type ComponentType } from 'react'
import { claveDeAlmacenamiento } from '@/lib/escenario'

/**
 * lazy() con retry: tras un deploy, el index cacheado puede apuntar a chunks
 * viejos que ya no existen → "Failed to fetch dynamically imported module".
 * El primer fallo gatilla un reload (una vez por sesión) para tomar el bundle
 * nuevo; si vuelve a fallar, propaga al ErrorBoundary.
 *
 * Genérico en las props `P`, no en el componente: `ComponentType<unknown>` sólo acepta
 * pantallas sin props, y el mapa (`MapaDeCordoba`) las tiene. `any` no hace falta.
 */
export function lazyWithRetry<P>(
  factory: () => Promise<{ default: ComponentType<P> }>,
) {
  return lazy(async () => {
    const KEY = claveDeAlmacenamiento('chunk-reload')
    try {
      return await factory()
    } catch (err) {
      const reloaded =
        typeof window !== 'undefined' && window.sessionStorage.getItem(KEY) === '1'
      if (!reloaded && typeof window !== 'undefined') {
        window.sessionStorage.setItem(KEY, '1')
        window.location.reload()
        return new Promise<{ default: ComponentType<P> }>(() => {})
      }
      throw err
    }
  })
}
