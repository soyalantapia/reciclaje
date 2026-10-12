import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor } from '@/types'
import { crearProducto } from '@/lib/productosDelClub'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { useSessionStore } from '@/store/session'
import CommerceProducts from './CommerceProducts'

const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', lat: 0, lng: 0,
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
    // Como el simulador: los del seed más los que publicó el club (handlers.ts, GET /projects).
    getProjects: () => Promise.resolve([banco, ...useCommerceProductsStore.getState().creados]),
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

afterEach(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
  useCreatedCommerceStore.setState({ commerce: null, point: null })
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
      fireEvent.change(within(dialogo).getByLabelText('Punto R'), { target: { value: 'p_club_sede' } })
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    }
    expect(useCommerceProductsStore.getState().creados).toHaveLength(1)
  })

  it('un doble clic en «Publicar» publica una sola vez, sin un aviso de rechazo después del éxito', async () => {
    const error = vi.spyOn(toast, 'error')
    const exito = vi.spyOn(toast, 'success')
    verProductos()
    const dialogo = await abrirNuevoProducto()
    const publicar = within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' })
    // El segundo clic llega al botón del formulario que se está cerrando, con la pantalla de antes.
    fireEvent.click(publicar)
    fireEvent.click(publicar)
    expect(useCommerceProductsStore.getState().creados).toHaveLength(1)
    expect(exito).toHaveBeenCalledOnce()
    expect(error).not.toHaveBeenCalled()
  })

  it('un club dado de alta en vivo publica en el Punto R que creó en el alta', async () => {
    const clubNuevo: Sponsor = { ...club, id: 's_new_ABC123', name: 'Club Atlético Nuevo', category: 'estadio' }
    const puntoDelAlta: RecyclePoint = { ...punto('p_new_XYZ789', 'Punto R · Tribuna'), sponsorId: clubNuevo.id }
    useCreatedCommerceStore.setState({ commerce: clubNuevo, point: puntoDelAlta })
    verProductos(clubNuevo)
    fireEvent.click(await screen.findByRole('button', { name: /Nuevo producto/ }))
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo producto' })
    const opciones = [...(within(dialogo).getByLabelText('Punto R') as HTMLSelectElement).options].map((o) => o.text)
    expect(opciones).toEqual(['Punto R · Tribuna'])
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    expect(useCommerceProductsStore.getState().creados).toMatchObject([{ puntoId: 'p_new_XYZ789', sponsorId: 's_new_ABC123' }])
  })

  it('después de publicar uno, el formulario vuelve a publicar otro en el otro Punto R, sin recargar', async () => {
    verProductos()
    const primero = await abrirNuevoProducto()
    fireEvent.click(within(primero).getByRole('button', { name: 'Publicar para la hinchada' }))
    const segundo = await abrirNuevoProducto()
    expect(within(segundo).getByLabelText('Punto R')).toHaveValue('p_club_estadio')
    fireEvent.click(within(segundo).getByRole('button', { name: 'Publicar para la hinchada' }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(2)
  })

  it('con la sede ya ocupada, el formulario propone el Punto R que queda libre', async () => {
    verProductos()
    const primero = await abrirNuevoProducto()
    fireEvent.click(within(primero).getByRole('button', { name: 'Publicar para la hinchada' }))
    const segundo = await abrirNuevoProducto()
    expect(within(segundo).getByLabelText('Punto R')).toHaveValue('p_club_estadio')
  })

  it('las cuatro formas son un grupo con su título, para quien usa un lector de pantalla', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    const formas = within(dialogo).getByRole('group', { name: '¿Qué construye la hinchada?' })
    expect(within(formas).getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Banco de suplentes', 'Butacas', 'Arco para las inferiores', 'Otro',
    ])
  })

  it('un producto publicado se puede eliminar', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    fireEvent.click(await screen.findByRole('button', { name: /Eliminar/ }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(0)
  })

  it('un producto que ya estaba publicado al abrir la pantalla también desaparece al eliminarlo', async () => {
    useCommerceProductsStore.setState({
      creados: [
        crearProducto({
          id: 'pr_nuevo_ABC123', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: puntos[1],
          club: { id: 's_club', nombre: 'Talleres' }, creadoEn: '2026-10-11T00:00:00.000Z',
        }),
      ],
    })
    verProductos()
    expect(await screen.findByText('Butacas para la platea')).toBeInTheDocument()
    // El simulador lo sirve también en /projects: no se lista dos veces.
    expect(screen.getAllByText('Butacas para la platea')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: /Eliminar/ }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(0)
    expect(screen.queryByText('Butacas para la platea')).not.toBeInTheDocument()
  })

  it('un comercio no tiene esta pantalla', () => {
    verProductos({ ...club, id: 's_cafe', category: 'comercio' })
    expect(screen.queryByRole('heading', { name: 'Productos' })).not.toBeInTheDocument()
  })
})
