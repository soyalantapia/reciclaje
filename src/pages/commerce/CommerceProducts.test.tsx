import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor } from '@/types'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useSessionStore } from '@/store/session'
import CommerceProducts from './CommerceProducts'

const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
const puntos = [punto('p_club_estadio', 'Punto R · Estadio'), punto('p_club_sede', 'Punto R · Sede social')]

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', etiqueta: 'Banco de suplentes',
  sponsorId: 's_club', sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas',
  goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31',
  illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve([banco]),
    getPoints: () => Promise.resolve(puntos),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

function verProductos(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceProducts />
    </MemoryRouter>,
  )
}

async function abrirNuevoProducto() {
  await screen.findByText('Banco de suplentes con el plástico de la hinchada')
  fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
  return screen.findByRole('dialog', { name: 'Nuevo producto' })
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

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
  useActivityStore.setState({ sessionContributions: [] })
  useSessionStore.setState({ user: null })
})

describe('Productos del panel del club', () => {
  it('lista el banco del club con su meta en kilos y dónde junta', async () => {
    verProductos()
    expect(await screen.findByText('Banco de suplentes con el plástico de la hinchada')).toBeInTheDocument()
    expect(screen.getByText('Meta: 1.261 kg · 300.000 tapitas')).toBeInTheDocument()
    expect(await screen.findByText('Punto R · Estadio, Punto R · Sede social')).toBeInTheDocument()
  })

  it('propone butacas de 500 kg en la sede, y al publicar el producto arranca en cero', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    expect(within(dialogo).getByRole('button', { name: 'Butacas' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('Butacas para la platea')
    expect(within(dialogo).getByText('≈ 119.000 tapitas, a 238 por kilo')).toBeInTheDocument()
    expect(within(dialogo).getByLabelText('Punto R')).toHaveValue('p_club_sede')
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))

    const [creado] = useCommerceProductsStore.getState().creados
    expect(creado).toMatchObject({
      title: 'Butacas para la platea', forma: 'butacas', puntoId: 'p_club_sede', goalUnits: 119000,
      collectedUnits: 0, sponsorId: 's_club', sponsorName: 'Talleres',
    })
    expect(await screen.findByText('Butacas para la platea')).toBeInTheDocument()
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('al elegir otra forma propone su nombre, y la meta cuenta las tapitas', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Arco para las inferiores' }))
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('Arco para las inferiores')
    fireEvent.change(within(dialogo).getByLabelText('Meta en kilos'), { target: { value: '250' } })
    expect(within(dialogo).getByText('≈ 59.500 tapitas, a 238 por kilo')).toBeInTheDocument()
  })

  it('sin nombre no publica', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Otro' }))
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('')
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(0)
  })

  it('no publica dos productos en el mismo Punto R', async () => {
    verProductos()
    for (let i = 0; i < 2; i++) {
      const dialogo = await abrirNuevoProducto()
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    }
    expect(useCommerceProductsStore.getState().creados).toHaveLength(1)
  })

  it('un producto publicado se puede eliminar', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    fireEvent.click(await screen.findByRole('button', { name: /Eliminar/ }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(0)
  })

  it('un comercio no tiene esta pantalla', () => {
    verProductos({ ...club, id: 's_cafe', category: 'comercio' })
    expect(screen.queryByRole('heading', { name: 'Productos' })).not.toBeInTheDocument()
  })
})
