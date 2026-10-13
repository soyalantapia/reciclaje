import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Contribution, ImpactProject, RecyclePoint, TraceEvent } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { usePesajesStore } from '@/store/pesajesDelClub'
import { useActivityStore } from '@/store/activity'
import Home from './Home'

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Club', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [], topContributors: [{ name: 'Camila R.', units: 640, avatarColor: '#16a34a' }],
} as ImpactProject

const butacas = {
  ...banco, id: 'pr_nuevo_1', title: 'Butacas para la platea', goalUnits: 119000, collectedUnits: 0,
  myContributionUnits: 0, estimatedDate: '', topContributors: [], forma: 'butacas', puntoId: 'p_club_sede',
  creadoEn: '2026-10-10T12:00:00.000Z',
} as ImpactProject

const recorrido: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas en el Punto R · Estadio.', date: '2026-10-04', done: true },
  { stage: 'validacion', title: 'Pesaje del lote', detail: 'Al cierre de cada partido, el club pesa lo juntado.', date: null, done: false, operator: 'Club' },
  { stage: 'producto', title: 'Instalación', detail: 'El banco se instala en el Estadio.', date: null, done: false },
]

const estadio = { id: 'p_club_estadio', name: 'Punto R · Estadio', sponsorId: 's_club' } as RecyclePoint
const sede = { id: 'p_club_sede', name: 'Punto R · Sede social', sponsorId: 's_club' } as RecyclePoint

// Los proyectos que devuelve la API en cada caso: arranca siendo sólo el banco.
let proyectosDelCaso: ImpactProject[] = [banco]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve(proyectosDelCaso),
    getContributions: () => Promise.resolve([]),
    getCauses: () => Promise.resolve([]),
    getProjectTrace: () => Promise.resolve(recorrido),
    getPoints: () => Promise.resolve([estadio, sede]),
  },
}))

function verElInicio() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
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

describe('inicio del hincha', () => {
  beforeEach(() => {
    proyectosDelCaso = [banco]
    sessionStorage.clear()
  })

  it('arranca con el banco de la hinchada y su botón, sin el viejo «Escanear un aporte»', async () => {
    verElInicio()
    expect(await screen.findByText('Sumá tus tapitas')).toBeInTheDocument()
    expect(screen.getByText('42.840')).toBeInTheDocument()
    expect(screen.queryByText('Escanear un aporte')).not.toBeInTheDocument()
  })

  it('un proyecto que no es un banco sigue con «Tu impacto» y conserva el botón para escanear', async () => {
    proyectosDelCaso = [{ ...banco, id: 'pr_totem', title: 'Tótem reciclado', illustration: 'totem' } as ImpactProject]
    verElInicio()
    expect(await screen.findByText('Tu impacto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Escanear un aporte/ })).toHaveAttribute('href', '/escanear')
    expect(screen.queryByText('Sumá tus tapitas')).not.toBeInTheDocument()
  })

  it('con un solo producto no hay pestañas', async () => {
    verElInicio()
    await screen.findByText('Sumá tus tapitas')
    expect(screen.queryByRole('group', { name: 'Productos de la hinchada' })).not.toBeInTheDocument()
  })

  it('con un producto que publicó el club hay pestañas: el banco elegido de entrada y el nuevo marcado', async () => {
    proyectosDelCaso = [banco, butacas]
    verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    expect(within(pestanas).getByRole('button', { name: /Banco de suplentes/ })).toHaveAttribute('aria-pressed', 'true')
    expect(within(pestanas).getByRole('button', { name: /Butacas para la platea/ })).toHaveTextContent('nuevo')
    expect(screen.getByText('42.840')).toBeInTheDocument()
  })

  it('al tocar la pestaña del producto nuevo se ve ese producto, con su forma', async () => {
    proyectosDelCaso = [banco, butacas]
    const { container } = verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    fireEvent.click(within(pestanas).getByRole('button', { name: /Butacas para la platea/ }))
    expect(screen.getByRole('heading', { name: 'Butacas para la platea' })).toBeInTheDocument()
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
    expect(within(pestanas).getByRole('button', { name: /Butacas para la platea/ })).toHaveAttribute('aria-pressed', 'true')
    // Recién publicado, sin aportes: en vez de una lista vacía, la invitación a sumar la primera.
    expect(screen.getByText('Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!')).toBeInTheDocument()
  })

  it('si el club elimina el producto elegido, el inicio vuelve al banco y se van las pestañas', async () => {
    proyectosDelCaso = [banco, butacas]
    verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    fireEvent.click(within(pestanas).getByRole('button', { name: /Butacas para la platea/ }))
    // El panel lo elimina (en esta pestaña o en otra): el store cambia y el inicio vuelve a pedir.
    proyectosDelCaso = [banco]
    act(() => useCommerceProductsStore.setState({ creados: [] }))
    await waitFor(() =>
      expect(screen.queryByRole('group', { name: 'Productos de la hinchada' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('heading', { name: 'Banco de suplentes con el plástico de la hinchada' })).toBeInTheDocument()
  })

  it('con el banco elegido, «Sumá tus tapitas» no deja ningún Punto R elegido', async () => {
    proyectosDelCaso = [banco, butacas]
    verElInicio()
    await screen.findByRole('group', { name: 'Productos de la hinchada' })
    fireEvent.click(screen.getByRole('link', { name: /Sumá tus tapitas/ }))
    expect(sessionStorage.getItem(claveDeAlmacenamiento('scan-point'))).toBeNull()
  })

  it('con el producto nuevo elegido, «Sumá tus tapitas» deja su Punto R listo para el escáner', async () => {
    proyectosDelCaso = [banco, butacas]
    verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    fireEvent.click(within(pestanas).getByRole('button', { name: /Butacas para la platea/ }))
    fireEvent.click(screen.getByRole('link', { name: /Sumá tus tapitas/ }))
    expect(sessionStorage.getItem(claveDeAlmacenamiento('scan-point'))).toBe('p_club_sede')
  })
})

describe('tu tapita en el inicio', () => {
  beforeEach(() => {
    proyectosDelCaso = [banco]
    usePesajesStore.setState({ pesajes: [] })
    useActivityStore.setState({ sessionContributions: [] })
  })

  it('debajo del banco dice dónde va tu tapita y lleva al recorrido', async () => {
    verElInicio()
    const tarjeta = await screen.findByRole('link', { name: /el recorrido de tu tapita/i })
    expect(tarjeta.getAttribute('href')).toBe('/trazabilidad/pr_banco_club')
    expect(screen.getByText(/lo que sigue/i).textContent).toMatch(/pesaje del lote/i)
  })

  it('cuando el club carga el pesaje, el inicio muestra que tu tapita avanzó', async () => {
    verElInicio()
    await screen.findByRole('link', { name: /el recorrido de tu tapita/i })
    act(() => {
      usePesajesStore.getState().agregar({
        id: 'ps1', partido: 'Talleres vs. Instituto', fecha: '2026-10-12', puntoId: 'p_club_estadio',
        puntoNombre: 'Punto R · Estadio', kilos: 12.5, tapitas: 2975, creadoEn: '2026-10-12T15:00:00.000Z',
      })
    })
    expect((await screen.findByText(/tu tapita va por/i)).textContent).toMatch(/pesaje del lote/i)
  })

  it('con tu aporte de hoy en la Sede, un pesaje en el Estadio no mueve tu tapita; uno en la Sede, sí', async () => {
    const hoy = new Date()
    const dia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    const aporte: Contribution = {
      id: 'c_sesion', userId: 'u1', pointId: 'p_club_sede', pointName: 'Punto R · Sede social', sponsorId: 's_club',
      sponsorName: 'Club', material: 'tapitas', units: 50, xpEarned: 100, projectId: 'pr_banco_club',
      status: 'validado', createdAt: hoy.toISOString(),
    }
    useActivityStore.setState({ sessionContributions: [aporte] })
    verElInicio()
    await screen.findByRole('link', { name: /el recorrido de tu tapita/i })
    const pesar = (id: string, p: RecyclePoint) =>
      act(() => {
        usePesajesStore.getState().agregar({
          id, partido: 'Fecha 12', fecha: dia, puntoId: p.id, puntoNombre: p.name, kilos: 12.5, tapitas: 2975,
          creadoEn: hoy.toISOString(),
        })
      })
    pesar('ps_estadio', estadio)
    expect(screen.queryByText(/tu tapita va por/i)).toBeNull()
    pesar('ps_sede', sede)
    expect((await screen.findByText(/tu tapita va por/i)).textContent).toMatch(/pesaje del lote/i)
  })
})
