import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject } from '@/types'
import Home from './Home'

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Club', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [], topContributors: [{ name: 'Camila R.', units: 640, avatarColor: '#16a34a' }],
} as ImpactProject

// El proyecto que devuelve la API en cada caso: arranca siendo el banco.
let proyectoDelCaso: ImpactProject = banco

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve([proyectoDelCaso]),
    getContributions: () => Promise.resolve([]),
    getCauses: () => Promise.resolve([]),
  },
}))

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
    proyectoDelCaso = banco
  })

  it('arranca con el banco de la hinchada y su botón, sin el viejo «Escanear un aporte»', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Sumá tus tapitas')).toBeInTheDocument()
    expect(screen.getByText('42.840')).toBeInTheDocument()
    expect(screen.queryByText('Escanear un aporte')).not.toBeInTheDocument()
  })

  it('un proyecto que no es un banco sigue con «Tu impacto» y conserva el botón para escanear', async () => {
    proyectoDelCaso = { ...banco, id: 'pr_totem', title: 'Tótem reciclado', illustration: 'totem' } as ImpactProject
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Tu impacto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Escanear un aporte/ })).toHaveAttribute('href', '/escanear')
    expect(screen.queryByText('Sumá tus tapitas')).not.toBeInTheDocument()
  })
})
