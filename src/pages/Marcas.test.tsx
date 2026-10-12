// En «Marcas de la red» el club va primero, como institución: ordenado por Huella Verde quedaba último.
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import Marcas from './Marcas'

const marca = (id: string, name: string, category: Sponsor['category'], greenScore: number): Sponsor => ({
  id, name, slug: id, category, brandColor: '#0b2d6b', tagline: '', greenScore, kgRecovered: 100,
})

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getSponsors: () =>
      Promise.resolve([
        marca('s_cafe', 'Café Andino', 'comercio', 84),
        marca('s_club', 'Talleres', 'club', 64),
        marca('s_bebidas', 'Bebidas Serranas', 'marca', 90),
      ]),
  },
}))

describe('marcas de la red', () => {
  it('el club va primero y las empresas siguen por Huella Verde', async () => {
    render(
      <MemoryRouter>
        <Marcas />
      </MemoryRouter>,
    )
    await screen.findByText('Talleres')
    const nombres = [...document.querySelectorAll('p.truncate.font-bold')].map((p) => p.textContent)
    expect(nombres).toEqual(['Talleres', 'Bebidas Serranas', 'Café Andino'])
  })
})
