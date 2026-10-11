import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Contribution, ImpactProject, TraceEvent } from '@/types'
import { useActivityStore } from '@/store/activity'
import { useSessionStore } from '@/store/session'
import Traceability from './Traceability'

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

const totemDelClub = {
  ...bancoDelClub, id: 'pr_totem_club', title: 'Tótem de reciclaje del club', illustration: 'totem',
} as ImpactProject

const recorrido: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas dejadas en el Punto R · Estadio.', date: '2026-10-04', done: true },
  { stage: 'validacion', title: 'Pesaje del lote', detail: 'Al cierre de cada partido, el personal del club pesa lo juntado.', date: null, done: false, operator: 'Club' },
  { stage: 'producto', title: 'Instalación', detail: 'El banco se instala en el Estadio.', date: null, done: false },
]

const aporteAlBanco: Contribution = {
  id: 'c_historial', userId: 'u1', pointId: 'p_r', pointName: 'Punto R · Estadio', sponsorId: 's_club',
  sponsorName: 'Club', material: 'tapitas', units: 640, xpEarned: 128, projectId: 'pr_banco_club',
  status: 'validado', createdAt: '2026-10-04T15:00:00.000Z',
}

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProject: (id: string) => Promise.resolve(id === 'pr_banco_club' ? bancoDelClub : totemDelClub),
    getProjectTrace: () => Promise.resolve(recorrido),
    getContributions: () => Promise.resolve([aporteAlBanco]),
  },
}))

function verLaTrazabilidadDe(projectId: string) {
  return render(
    <MemoryRouter initialEntries={[`/trazabilidad/${projectId}`]}>
      <Routes>
        <Route path="/trazabilidad/:projectId" element={<Traceability />} />
      </Routes>
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
  useSessionStore.setState({ user: null })
})

describe('trazabilidad de un proyecto', () => {
  it('la de un banco es el recorrido de tu tapita, con el punto y lo que sigue', async () => {
    const { container } = verLaTrazabilidadDe('pr_banco_club')
    expect(await screen.findByText('El recorrido de tu tapita')).toBeInTheDocument()
    // El punto sale del historial (la sesión no tiene aportes) y el encabezado de siempre no se repite.
    await screen.findByText('Punto R · Estadio')
    const texto = container.textContent ?? ''
    expect(texto).toContain('Tu tapita está en el Punto R · Estadio')
    expect(texto).toMatch(/lo que sigue/i)
    expect(screen.queryByRole('heading', { name: 'Trazabilidad' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Volver al proyecto/ })).toHaveAttribute('href', '/proyecto/pr_banco_club')
  })

  it('la de un proyecto que no es banco queda con su línea de tiempo de hoy', async () => {
    verLaTrazabilidadDe('pr_totem_club')
    // Se espera a que cargue la traza: antes de eso tampoco estaría el recorrido, y la prueba pasaría por vacío.
    expect(await screen.findByText('Pesaje del lote')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Trazabilidad' })).toBeInTheDocument()
    expect(screen.queryByText('El recorrido de tu tapita')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Volver al proyecto/ })).toBeInTheDocument()
  })
})
