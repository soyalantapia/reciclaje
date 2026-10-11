// El cableado real del panel: la ruta /comercio/productos cuelga de CommerceLayout, y los dos menús
// (escritorio y celular) reciben la categoría de quien entra. Sin ella, «Productos» desaparece en silencio.
import { render, screen, waitFor, within } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor } from '@/types'
import { ESCENARIO } from '@/lib/escenario'
import { router } from '@/routes'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useSessionStore } from '@/store/session'
import { navDelPanel } from './CommerceSideNav'

/** Los textos de los enlaces de un menú, en orden. «Plan» depende del escenario: se compara con `navDelPanel`. */
const etiquetas = (menu: HTMLElement) => within(menu).getAllByRole('link').map((a) => a.textContent?.trim())

const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [], topContributors: [],
} as ImpactProject

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve([banco]),
    getPoints: () => Promise.resolve([punto('p_club_estadio', 'Punto R · Estadio'), punto('p_club_sede', 'Punto R · Sede social')]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
})

describe('humo del cableado de Productos', () => {
  it('la ruta real /comercio/productos existe, cuelga de CommerceLayout y muestra la pantalla', async () => {
    useSessionStore.setState({ commerce: club })
    const r = createMemoryRouter(router.routes, { initialEntries: ['/comercio/productos'] })
    render(<RouterProvider router={r} />)

    expect(await screen.findByRole('heading', { name: 'Productos' })).toBeInTheDocument()
    expect(await screen.findByText('Banco de suplentes con el plástico de la hinchada')).toBeInTheDocument()
    expect(r.state.location.pathname).toBe('/comercio/productos')

    // Los dos menús (escritorio y celular) salen del mismo `navDelPanel`: «Productos» va segundo en ambos.
    const menus = screen.getAllByRole('navigation')
    expect(menus).toHaveLength(2)
    for (const menu of menus) {
      const enlaces = etiquetas(menu)
      expect(enlaces).toEqual(navDelPanel(ESCENARIO, 'club').map((i) => i.label))
      expect(enlaces.slice(0, 2)).toEqual(['Resumen', 'Productos'])
    }
    // El de «Productos» es el enlace activo.
    const activos = screen.getAllByRole('link', { name: 'Productos' })
    expect(activos).toHaveLength(2)
    for (const a of activos) expect(a).toHaveAttribute('href', '/comercio/productos')
    for (const a of activos) expect(a).toHaveAttribute('aria-current', 'page')
  })

  it('para un estadio también está en los dos menús', async () => {
    useSessionStore.setState({ commerce: { ...club, category: 'estadio' } })
    const r = createMemoryRouter(router.routes, { initialEntries: ['/comercio'] })
    render(<RouterProvider router={r} />)
    await waitFor(() => expect(screen.getAllByRole('link', { name: 'Productos' })).toHaveLength(2))
  })

  it('un comercio no ve «Productos» en ningún menú, y si llega a la ruta lo mandan al resumen', async () => {
    useSessionStore.setState({ commerce: { ...club, id: 's_cafe', category: 'comercio' } })
    const r = createMemoryRouter(router.routes, { initialEntries: ['/comercio/productos'] })
    render(<RouterProvider router={r} />)
    await waitFor(() => expect(r.state.location.pathname).toBe('/comercio'))
    expect(screen.queryAllByRole('link', { name: /Productos/ })).toHaveLength(0)
    expect(screen.queryByRole('heading', { name: 'Productos' })).not.toBeInTheDocument()
    for (const menu of screen.getAllByRole('navigation')) {
      expect(etiquetas(menu)).toEqual(navDelPanel(ESCENARIO, 'comercio').map((i) => i.label))
      expect(etiquetas(menu)).not.toContain('Productos')
    }
  })
})

describe('humo del cableado de Marca', () => {
  it('la ruta real /comercio/marca existe, cuelga de CommerceLayout y está en los dos menús, activa', async () => {
    useSessionStore.setState({ commerce: club })
    const r = createMemoryRouter(router.routes, { initialEntries: ['/comercio/marca'] })
    render(<RouterProvider router={r} />)

    expect(await screen.findByRole('heading', { level: 1, name: 'La marca de Talleres' })).toBeInTheDocument()
    expect(r.state.location.pathname).toBe('/comercio/marca')

    // Los dos menús salen del mismo `navDelPanel`: «Marca» va después de «Reportes» en ambos.
    const menus = screen.getAllByRole('navigation')
    expect(menus).toHaveLength(2)
    for (const menu of menus) {
      const enlaces = etiquetas(menu)
      expect(enlaces).toEqual(navDelPanel(ESCENARIO, 'club').map((i) => i.label))
      expect(enlaces[enlaces.indexOf('Reportes') + 1]).toBe('Marca')
    }
    const activos = screen.getAllByRole('link', { name: 'Marca' })
    expect(activos).toHaveLength(2)
    for (const a of activos) expect(a).toHaveAttribute('href', '/comercio/marca')
    for (const a of activos) expect(a).toHaveAttribute('aria-current', 'page')
  })

  it('para un estadio también está en los dos menús', async () => {
    useSessionStore.setState({ commerce: { ...club, category: 'estadio' } })
    const r = createMemoryRouter(router.routes, { initialEntries: ['/comercio'] })
    render(<RouterProvider router={r} />)
    await waitFor(() => expect(screen.getAllByRole('link', { name: 'Marca' })).toHaveLength(2))
  })

  it('un comercio no ve «Marca» en ningún menú, y si llega a la ruta lo mandan al resumen', async () => {
    useSessionStore.setState({ commerce: { ...club, id: 's_cafe', category: 'comercio' } })
    const r = createMemoryRouter(router.routes, { initialEntries: ['/comercio/marca'] })
    render(<RouterProvider router={r} />)
    await waitFor(() => expect(r.state.location.pathname).toBe('/comercio'))
    expect(screen.queryAllByRole('link', { name: 'Marca' })).toHaveLength(0)
    expect(screen.queryByRole('heading', { name: /La marca de/ })).not.toBeInTheDocument()
    for (const menu of screen.getAllByRole('navigation')) {
      expect(etiquetas(menu)).toEqual(navDelPanel(ESCENARIO, 'comercio').map((i) => i.label))
      expect(etiquetas(menu)).not.toContain('Marca')
    }
  })
})
