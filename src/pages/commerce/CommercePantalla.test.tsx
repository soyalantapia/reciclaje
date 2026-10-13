import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor } from '@/types'
import { crearProducto } from '@/lib/productosDelClub'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { useSessionStore } from '@/store/session'
import CommercePantalla, { SEGUNDOS_POR_PRODUCTO } from './CommercePantalla'

// jsdom no dibuja en un canvas: el QR se reemplaza por una imagen fija.
vi.mock('@/lib/qr', () => ({ qrPngDataUrl: () => Promise.resolve('data:image/png;base64,QR') }))

const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', lat: 0, lng: 0,
  acceptedMaterials: ['tapitas'], openNow: true,
})
const estadio = punto('p_club_estadio', 'Punto R · Estadio')
const sede = punto('p_club_sede', 'Punto R · Sede social')

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench', milestones: [],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '' },
    { name: 'Lu M.', units: 1190, avatarColor: '' },
  ],
} as ImpactProject

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve([banco, ...useCommerceProductsStore.getState().creados]),
    getPoints: () => Promise.resolve([estadio, sede]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

function verLaPantalla(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommercePantalla />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
  useCreatedCommerceStore.setState({ commerce: null, point: null })
  useActivityStore.setState({ sessionContributions: [] })
  useSessionStore.setState({ user: null })
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('la pantalla del estadio', () => {
  it('muestra el banco con su marcador, los que más aportan, el QR de su Punto R y que son datos de ejemplo', async () => {
    verLaPantalla()
    expect(await screen.findByRole('heading', { level: 1, name: 'Banco de suplentes con el plástico de la hinchada' })).toBeInTheDocument()
    expect(screen.getByText('42.840')).toBeInTheDocument()
    expect(screen.getByText('tapitas · 14%')).toBeInTheDocument()
    const top = screen.getByRole('heading', { name: 'Los que más aportan' }).closest('section')!
    expect(within(top).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1Facu R.3.120', '2Lu M.1.190'])
    expect(await screen.findByRole('img', { name: 'QR del Punto R · Estadio' })).toHaveAttribute('src', 'data:image/png;base64,QR')
    expect(screen.getByText('Datos de ejemplo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Panel/ })).toHaveAttribute('href', '/comercio')
  })

  it('con un producto publicado, pasa de uno al otro, con su patrocinador y el QR de su punto', async () => {
    useCommerceProductsStore.setState({
      creados: [
        crearProducto({
          id: 'pr_butacas', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
          club: { id: 's_club', nombre: 'Talleres' }, creadoEn: '2026-10-12T10:00:00Z',
          patrocinador: { id: 's_ypf', nombre: 'Norte Energía', color: '#0f3d91' },
        }),
      ],
    })
    vi.useFakeTimers({ shouldAdvanceTime: true })
    verLaPantalla()
    expect(await screen.findByRole('heading', { level: 1, name: /Banco de suplentes/ })).toBeInTheDocument()
    // Que React registre el temporizador de la rotación antes de adelantar el reloj: con la máquina
    // cargada, el efecto podía correr después y la rotación no llegaba nunca.
    await act(async () => {})
    await act(async () => {
      vi.advanceTimersByTime(SEGUNDOS_POR_PRODUCTO * 1000)
    })
    expect(await screen.findByRole('heading', { level: 1, name: 'Butacas para la platea' })).toBeInTheDocument()
    expect(screen.getByText('Con el apoyo de Norte Energía')).toBeInTheDocument()
    // Recién publicado nadie aportó todavía: en lugar de una lista vacía, la invitación.
    expect(screen.queryByRole('heading', { name: 'Los que más aportan' })).not.toBeInTheDocument()
    expect(screen.getByText('Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: 'QR del Punto R · Sede social' })).toBeInTheDocument()
  })

  it('los números del top van en dorado fijo, no con la paleta del club: con el azul de Talleres quedaban oscuro sobre oscuro', async () => {
    verLaPantalla()
    const top = (await screen.findByRole('heading', { name: 'Los que más aportan' })).closest('section')!
    const numero = within(top).getByText('1')
    expect(numero.className).toMatch(/bg-xp-400/)
    expect(numero.className).not.toMatch(/eco-/)
  })

  it('un club sin productos (dado de alta en vivo) no queda en «Cargando…»: dice cómo empezar', async () => {
    verLaPantalla({ ...club, id: 's_club_nuevo', name: 'Club Nuevo' })
    expect(await screen.findByText(/Todavía no hay productos/)).toBeInTheDocument()
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
  })
})
