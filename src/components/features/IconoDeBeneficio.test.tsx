// La camiseta de Talleres no puede verse celeste (el 👕 de iPhone y Mac): en Córdoba es el color de Belgrano.
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AZUL_DE_TALLERES } from '@/lib/logos'
import { IconoDeBeneficio } from './IconoDeBeneficio'

describe('IconoDeBeneficio', () => {
  it('la camiseta de Talleres va a rayas con su azul, sin el emoji', () => {
    const { container } = render(<IconoDeBeneficio benefit={{ emoji: '👕', sponsorId: 's_club', sponsorName: 'Talleres' }} />)
    expect(screen.getByRole('img', { name: 'Camiseta del club' })).toBeTruthy()
    expect(container.textContent).not.toContain('👕')
    expect(container.querySelector(`g[fill="${AZUL_DE_TALLERES}"]`)?.querySelectorAll('rect')).toHaveLength(5)
  })

  it('en la demo general también: Talleres entra como s_talleres', () => {
    render(<IconoDeBeneficio benefit={{ emoji: '👕', sponsorId: 's_talleres', sponsorName: 'Talleres' }} />)
    expect(screen.getByRole('img', { name: 'Camiseta del club' })).toBeTruthy()
  })

  it('la remera de una marca y los demás beneficios siguen con su emoji', () => {
    const remera = render(<IconoDeBeneficio benefit={{ emoji: '👕', sponsorId: 's_adidas', sponsorName: 'Adidas' }} />)
    expect(remera.container.textContent).toBe('👕')
    const entrada = render(<IconoDeBeneficio benefit={{ emoji: '🎟️', sponsorId: 's_club', sponsorName: 'Talleres' }} />)
    expect(entrada.container.textContent).toBe('🎟️')
  })

  it('dos camisetas en la misma pantalla no comparten el recorte', () => {
    const { container } = render(
      <>
        <IconoDeBeneficio benefit={{ emoji: '👕', sponsorId: 's_club', sponsorName: 'Talleres' }} />
        <IconoDeBeneficio benefit={{ emoji: '👕', sponsorId: 's_club', sponsorName: 'Talleres' }} />
      </>,
    )
    const ids = [...container.querySelectorAll('clipPath')].map((c) => c.id)
    expect(new Set(ids).size).toBe(2)
    ids.forEach((id) => expect(id).toMatch(/^[a-zA-Z0-9-]+$/))
  })
})
