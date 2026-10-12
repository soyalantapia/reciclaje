import { lazy, type ComponentType } from 'react'
import { claveDeAlmacenamiento } from '@/lib/escenario'

/**
 * lazy() con retry: tras un deploy, el index cacheado puede apuntar a chunks
 * viejos que ya no existen → "Failed to fetch dynamically imported module".
 * El primer fallo gatilla un reload para tomar el bundle nuevo; si vuelve a
 * fallar, propaga al ErrorBoundary. La marca se borra recién cuando un pedazo
 * llega bien: borrarla al arrancar la app hacía que un pedazo que falla
 * siempre (p. ej. sin conexión) recargara en bucle.
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
      const modulo = await factory()
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(KEY)
      return modulo
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
