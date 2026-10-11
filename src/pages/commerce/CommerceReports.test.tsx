import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { useSessionStore } from '@/store/session'
import CommerceReports from './CommerceReports'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([]),
    getSponsors: () => Promise.resolve([]),
    getProjects: () => Promise.resolve([]),
    getProjectTrace: () => Promise.resolve([]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
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

function verReportes(sponsor: Sponsor) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceReports />
    </MemoryRouter>,
  )
}

describe('Reportes', () => {
  it('a un club le muestra el informe para la Comisión Directiva, con «Descargar PDF» y «Descargar CSV»', async () => {
    verReportes(club)
    expect(await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Descargar PDF$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Descargar CSV$/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: 'Reportes' })).not.toBeInTheDocument()
  })

  it('a un comercio, el reporte de impacto', async () => {
    verReportes({ ...club, id: 's_cafe', category: 'comercio' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Reportes' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Informe para la Comisión Directiva' })).not.toBeInTheDocument()
  })
})
