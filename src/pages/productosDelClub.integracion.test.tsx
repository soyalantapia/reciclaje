// De punta a punta, sin simular la API: fetch → handlers reales del simulador → stores → pantallas.
// Publicar un producto, verlo en el inicio, aportar en su Punto R y que el panel y el informe lo cuenten.
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getResponse } from 'msw'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api'
import { handlers } from '@/services/mocks/handlers'
import { datos } from '@/services/mocks/datos'
import { crearProducto } from '@/lib/productosDelClub'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useActivityStore } from '@/store/activity'
import { useSessionStore } from '@/store/session'
import Home from '@/pages/Home'
import CommerceInforme from '@/pages/commerce/CommerceInforme'
import CommerceProducts from '@/pages/commerce/CommerceProducts'

const { points, projects, sponsors } = datos
const banco = projects[0]
const club = sponsors.find((s) => s.id === banco.sponsorId)!
const sede = points.find((p) => p.sponsorId === banco.sponsorId && p.id.endsWith('_sede'))!
const estadio = points.find((p) => p.sponsorId === banco.sponsorId && p.id.endsWith('_estadio'))!

beforeAll(() => {
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const res = await getResponse(handlers, new Request(new URL(url, location.origin), init))
    if (!res) throw new Error(`sin handler: ${url}`)
    return res
  })
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
  useActivityStore.setState({ sessionContributions: [] })
  useSessionStore.setState({ user: datos.currentUser, isAuthenticated: true, commerce: club })
})

const butacas = () =>
  crearProducto({
    id: 'pr_nuevo_INTEG', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
    club: { id: club.id, nombre: club.name }, creadoEn: new Date().toISOString(),
  })

describe('los productos del club, de punta a punta', () => {
  it('publicar → el inicio muestra la pestaña → aportar en su punto → el producto suma y el banco no', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    await screen.findByText('Sumá tus tapitas')
    expect(screen.queryByRole('group', { name: 'Productos de la hinchada' })).not.toBeInTheDocument()

    act(() => useCommerceProductsStore.getState().agregar(butacas()))
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' }, { timeout: 3000 })
    fireEvent.click(within(pestanas).getByRole('button', { name: /Butacas para la platea/ }))
    expect(screen.getByText('Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!')).toBeInTheDocument()

    // El hincha aporta en la sede, con el simulador de verdad.
    const res = await api.scan({ pointId: sede.id, material: 'tapitas', units: 50 })
    expect(res.contribution.projectId).toBe('pr_nuevo_INTEG')
    expect(res.project?.title).toBe('Butacas para la platea')
    act(() => useActivityStore.getState().add(res.contribution))
    await waitFor(() => expect(screen.queryByText('Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!')).not.toBeInTheDocument())
    expect(screen.getByText(/dejó 50 tapitas/)).toBeInTheDocument()

    // En el estadio, el aporte va al banco.
    const enElEstadio = await api.scan({ pointId: estadio.id, material: 'tapitas', units: 20 })
    expect(enElEstadio.contribution.projectId).toBe(banco.id)
  })

  it('el panel lista el banco más el producto, y el informe lo cuenta con lo de la sesión', async () => {
    useCommerceProductsStore.getState().agregar(butacas())
    const res = await api.scan({ pointId: sede.id, material: 'tapitas', units: 50 })
    useActivityStore.getState().add(res.contribution)

    const { unmount } = render(
      <MemoryRouter>
        <CommerceProducts />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Butacas para la platea')).toBeInTheDocument()
    expect(screen.getAllByText('Butacas para la platea')).toHaveLength(1)
    unmount()

    render(
      <MemoryRouter>
        <CommerceInforme />
      </MemoryRouter>,
    )
    const heading = await screen.findByRole('heading', { name: 'Lo que construye la hinchada' }, { timeout: 3000 })
    const seccion = heading.closest('section')!
    await waitFor(() => expect(seccion.textContent).toContain('50 de 119.000 tapitas'))
    expect(seccion.textContent).toContain('Junta en: Punto R · Sede social')
    // Sede ocupada: el banco sólo junta en el estadio.
    expect(seccion.textContent).toMatch(/Junta en: Punto R · Estadio(?!,)/)
  })
})

