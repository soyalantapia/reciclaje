// Beneficios: cada categoría que el panel puede publicar tiene su pestaña. Faltaba «Merch», y la camiseta
// oficial del club sólo se veía en «Todos».
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Benefit } from '@/types'
import Marketplace from './Marketplace'

const beneficio = (id: string, title: string, category: Benefit['category']): Benefit => ({
  id, title, category, sponsorId: 's_club', sponsorName: 'Talleres', costXp: 1000, city: 'Córdoba',
  description: '', stock: 5, emoji: '🎁',
})

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getBenefits: () =>
      Promise.resolve([beneficio('b1', 'Camiseta oficial', 'merch'), beneficio('b2', 'Entrada para un partido de local', 'entrada')]),
    getSponsors: () => Promise.resolve([]),
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

describe('beneficios', () => {
  it('la pestaña «Merch» muestra la camiseta del club', async () => {
    render(
      <MemoryRouter>
        <Marketplace />
      </MemoryRouter>,
    )
    await screen.findByText('Camiseta oficial')
    fireEvent.click(screen.getByRole('tab', { name: 'Merch' }))
    expect(screen.getByText('Camiseta oficial')).toBeInTheDocument()
    expect(screen.queryByText('Entrada para un partido de local')).not.toBeInTheDocument()
  })
})
