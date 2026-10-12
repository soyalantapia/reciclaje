import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import MapPoints from './MapPoints'

// Tras un deploy, el navegador puede pedir un pedazo viejo que ya no existe. Las pantallas lo reintentan
// (`lazyWithRetry`); el mapa, que viene en su propio pedazo, tiene que hacer lo mismo. Acá el del mapa nunca llega,
// como cuando el servidor ya no lo tiene (así lo simula también la prueba de la precarga, en AppLayout.test.tsx).
vi.mock('@/components/features/MapaDeCordoba', () => {
  throw new Error('Failed to fetch dynamically imported module')
})
vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: { getPoints: () => Promise.resolve([]), getSponsors: () => Promise.resolve([]) },
}))

let recargar: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  // jsdom no deja espiar `location.reload` (no se puede redefinir): se reemplaza `location` entero.
  recargar = vi.fn()
  vi.stubGlobal('location', { ...window.location, reload: recargar })
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('el pedazo del mapa', () => {
  it('si no se baja, la página se recarga una vez para tomar el nuevo, como en las demás pantallas', async () => {
    render(
      <MemoryRouter initialEntries={['/mapa']}>
        <MapPoints />
      </MemoryRouter>,
    )
    await waitFor(() => expect(recargar).toHaveBeenCalledTimes(1))
    expect(sessionStorage.getItem(claveDeAlmacenamiento('chunk-reload'))).toBe('1')
    // Mientras tanto la pantalla sigue en pie: sólo el mapa espera.
    expect(screen.getByRole('heading', { level: 1, name: 'Puntos adheridos' })).toBeInTheDocument()
  })
})
