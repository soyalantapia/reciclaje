// Al imprimir, el aviso «Demo · los números son de ejemplo» sólo se oculta en el informe, que lleva
// el suyo arriba y al pie. En el resto del panel se imprime: un resumen impreso circula sin la pantalla.
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { router } from '@/routes'
import { useSessionStore } from '@/store/session'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([]),
    getSponsors: () => Promise.resolve([]),
    getProjects: () => Promise.resolve([]),
    getProjectTrace: () => Promise.resolve([]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

beforeAll(() => {
  // jsdom no trae IntersectionObserver: las animaciones al entrar en pantalla lo usan.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

async function verElPanelEn(ruta: string) {
  useSessionStore.setState({ commerce: club })
  render(<RouterProvider router={createMemoryRouter(router.routes, { initialEntries: [ruta] })} />)
  return screen.findByRole('note')
}

describe('el aviso de la demo al imprimir', () => {
  it('en Reportes se imprime', async () => {
    const aviso = await verElPanelEn('/comercio/reportes')
    expect(aviso).toHaveTextContent('Demo · los números son de ejemplo')
    expect(aviso.closest('[data-no-imprimir]')).toBeNull()
  })

  it('en el informe no, porque el informe lleva el suyo', async () => {
    const aviso = await verElPanelEn('/comercio/informe')
    expect(aviso.closest('[data-no-imprimir]')).not.toBeNull()
  })
})
