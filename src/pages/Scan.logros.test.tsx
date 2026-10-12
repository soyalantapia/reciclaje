// El festejo de un aporte en el Estadio desbloquea «Hincha de cancha»; en la sede, no hay logro nuevo.
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Contribution, ImpactProject, RecyclePoint } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { useActivityStore } from '@/store/activity'
import { useSessionStore } from '@/store/session'
import { useWalletStore } from '@/store/wallet'
import { prepararSonido } from '@/lib/sonido'
import Scan from './Scan'

vi.mock('@/lib/sonido', () => ({ prepararSonido: vi.fn(), sonarTapitas: vi.fn(), sonarLogro: vi.fn() }))

const punto = (id: string, name: string) =>
  ({ id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', lat: 0, lng: 0, acceptedMaterials: ['tapitas'], openNow: true }) as RecyclePoint

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640,
  estimatedDate: '', illustration: 'bench', milestones: [],
  topContributors: [{ name: 'Camila R.', units: 640, avatarColor: '#16a34a' }],
} as ImpactProject

// Camila ya aportó en el Estadio el 04/10: «Hincha de cancha» pide hacerlo hoy.
const historial: Contribution[] = [
  {
    id: 'h1', userId: 'u1', pointId: 'p_club_estadio', pointName: 'Punto R · Estadio', sponsorId: 's_club', sponsorName: 'Talleres',
    material: 'tapitas', units: 640, xpEarned: 1280, projectId: 'pr_banco_club', status: 'validado', createdAt: '2026-10-04T15:00:00.000Z',
  },
]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([punto('p_club_estadio', 'Punto R · Estadio'), punto('p_club_sede', 'Punto R · Sede social')]),
    getContributions: () => Promise.resolve(historial),
    getProjects: () => Promise.resolve([banco]),
    scan: ({ pointId, units }: { pointId: string; units: number }) =>
      Promise.resolve({
        xpEarned: 100,
        project: banco,
        contribution: {
          ...historial[0], id: `s_${pointId}`, pointId, pointName: pointId, units, xpEarned: 100, createdAt: new Date().toISOString(),
        },
      }),
  },
}))

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
  useActivityStore.setState({ sessionContributions: [] })
  useWalletStore.setState({ streakDays: 12 })
  useSessionStore.setState({ user: { name: 'Camila Rodríguez' } as never, isAuthenticated: true })
})

async function aportarEn(pointId: string) {
  sessionStorage.setItem(claveDeAlmacenamiento('scan-point'), pointId)
  render(
    <MemoryRouter>
      <Scan />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Registrar aporte/ }))
  await screen.findByText('¡Aporte registrado!')
}

describe('logros en el festejo', () => {
  it('aportar en el Estadio hoy desbloquea «Hincha de cancha»', async () => {
    await aportarEn('p_club_estadio')
    expect((await screen.findByRole('status')).textContent).toMatch(/¡Logro desbloqueado!.*Hincha de cancha/)
    // El toque de «Registrar aporte» habilita el audio: Chrome y Safari no dejan sonar sin un toque.
    expect(prepararSonido).toHaveBeenCalled()
  })

  it('aportar en la sede no desbloquea nada', async () => {
    await aportarEn('p_club_sede')
    expect(screen.queryByText('¡Logro desbloqueado!')).toBeNull()
  })
})
