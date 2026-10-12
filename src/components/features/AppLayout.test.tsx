import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout'

// Sin red, los dos pedazos del mapa no se bajan: cada `import()` de la precarga se rechaza. Cada intento se cuenta, para
// que la prueba no pase de vacía si la precarga nunca saliera.
const intentos = vi.hoisted(() => ({ pantalla: 0, mapa: 0 }))
vi.mock('@/pages/MapPoints', () => {
  intentos.pantalla++
  throw new Error('Failed to fetch dynamically imported module')
})
vi.mock('@/components/features/MapaDeCordoba', () => {
  intentos.mapa++
  throw new Error('Failed to fetch dynamically imported module')
})

/** Chrome le da a la precarga un momento libre; acá se lo da ya, sin esperar el plazo de 1,5 s que usa Safari. */
function conUnMomentoLibre() {
  const idle = (cb: IdleRequestCallback) => {
    cb({ didTimeout: false, timeRemaining: () => 0 })
    return 1
  }
  Object.defineProperty(window, 'requestIdleCallback', { configurable: true, writable: true, value: idle })
  Object.defineProperty(window, 'cancelIdleCallback', { configurable: true, writable: true, value: () => {} })
}

afterEach(() => {
  // Primero se desmonta la pantalla (su limpieza llama a `cancelIdleCallback`) y recién después se saca el momento libre.
  cleanup()
  delete (window as { requestIdleCallback?: unknown }).requestIdleCallback
  delete (window as { cancelIdleCallback?: unknown }).cancelIdleCallback
})

describe('la precarga del mapa', () => {
  it('sin red falla en silencio: la pantalla se baja igual al abrirla, y no queda un «Uncaught (in promise)»', async () => {
    // Node avisa de una promesa rechazada que nadie atendió; el navegador la muestra como «Uncaught (in promise)».
    const sinAtender: unknown[] = []
    const alRechazar = (motivo: unknown) => {
      sinAtender.push(motivo)
    }
    process.on('unhandledRejection', alRechazar)
    try {
      conUnMomentoLibre()
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<p>Contenido de la pantalla</p>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
      expect(screen.getByText('Contenido de la pantalla')).toBeInTheDocument()

      // Los dos intentos salieron (la pantalla y el mapa)...
      await vi.waitFor(() => expect(intentos).toEqual({ pantalla: 1, mapa: 1 }))
      // ...y Node recién avisa de lo que nadie atendió cuando se vacía la cola de tareas.
      await new Promise((resolver) => setTimeout(resolver, 50))
      expect(sinAtender).toEqual([])
    } finally {
      process.off('unhandledRejection', alRechazar)
    }
  })
})
