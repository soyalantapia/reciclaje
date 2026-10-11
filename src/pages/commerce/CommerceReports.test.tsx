import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { useSessionStore } from '@/store/session'
import CommerceReports from './CommerceReports'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: { getPoints: () => Promise.resolve([]) },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

function verReportes(sponsor: Sponsor) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceReports />
    </MemoryRouter>,
  )
}

describe('Reportes', () => {
  it('a un club le ofrece el informe para la Comisión Directiva', async () => {
    verReportes(club)
    expect(await screen.findByRole('link', { name: /Informe para la Comisión Directiva/ })).toHaveAttribute(
      'href',
      '/comercio/informe',
    )
  })

  it('a un comercio no', async () => {
    verReportes({ ...club, id: 's_cafe', category: 'comercio' })
    await screen.findByRole('heading', { name: 'Reportes' })
    expect(screen.queryByRole('link', { name: /Informe para la Comisión Directiva/ })).not.toBeInTheDocument()
  })
})
