import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Contribution, ImpactProject, Sponsor } from '@/types'
import { useActivityStore } from '@/store/activity'
import { useSessionStore } from '@/store/session'
import CommerceResumen from './CommerceResumen'

// Los stores con persist leen localStorage al importarse y el de jsdom no sirve acá: uno en memoria.
// vi.hoisted corre antes que los imports, así que está instalado cuando se cargan los stores.
vi.hoisted(() => {
  const memoria = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => memoria.get(k) ?? null,
    setItem: (k: string, v: string) => void memoria.set(k, String(v)),
    removeItem: (k: string) => void memoria.delete(k),
    clear: () => memoria.clear(),
    key: (i: number) => [...memoria.keys()][i] ?? null,
    get length() {
      return memoria.size
    },
  } as Storage
})

const bancoDelClub = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Club', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [], topContributors: [{ name: 'Camila R.', units: 640, avatarColor: '#16a34a' }],
} as ImpactProject

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([]),
    getSponsors: () => Promise.resolve([]),
    getProjects: () => Promise.resolve([bancoDelClub]),
  },
}))

const sponsor = (id: string, name: string): Sponsor => ({
  id, name, slug: id, category: 'club', brandColor: '#16a34a', tagline: '', greenScore: 70, kgRecovered: 1200,
})

function verElResumenDe(sponsorDelPanel: Sponsor) {
  useSessionStore.setState({ commerce: sponsorDelPanel })
  render(
    <MemoryRouter>
      <CommerceResumen />
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

beforeEach(() => {
  useActivityStore.setState({ sessionContributions: [] })
})

describe('resumen del panel del club', () => {
  it('arranca con el banco de su hinchada, con los mismos números que ve el hincha', async () => {
    verElResumenDe(sponsor('s_club', 'Club'))
    expect(await screen.findByText('El banco de tu hinchada')).toBeInTheDocument()
    expect(screen.getByText('Banco de suplentes con el plástico de la hinchada')).toBeInTheDocument()
    expect(screen.getByText('42.840')).toBeInTheDocument()
    expect(screen.getByText('Camila R.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resumen' })).toBeInTheDocument()
  })

  it('suma lo que la hinchada hizo en esta sesión', async () => {
    const aporte: Contribution = {
      id: 'c_sesion', userId: 'u1', pointId: 'p1', pointName: 'Punto', sponsorId: 's_club', sponsorName: 'Club',
      material: 'tapitas', units: 50, xpEarned: 10, projectId: 'pr_banco_club', status: 'validado',
      createdAt: new Date().toISOString(),
    }
    useActivityStore.setState({ sessionContributions: [aporte] })
    verElResumenDe(sponsor('s_club', 'Club'))
    expect(await screen.findByText('42.890')).toBeInTheDocument()
    expect(screen.queryByText('42.840')).not.toBeInTheDocument()
  })

  it('una institución sin banco no lo muestra y el resumen queda como estaba', async () => {
    verElResumenDe(sponsor('s_otro', 'Otro'))
    expect(await screen.findByRole('heading', { name: 'Resumen' })).toBeInTheDocument()
    expect(screen.queryByText('El banco de tu hinchada')).not.toBeInTheDocument()
    expect(screen.queryByText('Banco de suplentes con el plástico de la hinchada')).not.toBeInTheDocument()
  })
})
