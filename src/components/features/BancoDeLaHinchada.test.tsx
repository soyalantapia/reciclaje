import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { BancoDeLaHinchada } from './BancoDeLaHinchada'

const butacas = {
  id: 'pr_nuevo_1', title: 'Butacas para la platea', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 119000, collectedUnits: 50, myContributionUnits: 50,
  estimatedDate: '', illustration: 'bench', milestones: [], topContributors: [], forma: 'butacas', puntoId: 'p_club_sede',
} as ImpactProject

describe('BancoDeLaHinchada con un producto que publicó el club', () => {
  it('dibuja su forma y titula la lista «La hinchada que suma»', () => {
    const items = [{ id: 'c1', nombre: 'Camila R.', texto: 'dejó 50 tapitas', esTuyo: true, cuando: '2026-10-10T12:00:00.000Z' }]
    const { container } = render(<BancoDeLaHinchada proyecto={butacas} items={items} propias={1} />)
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
    expect(container.textContent).toContain('La hinchada que suma')
    expect(container.textContent).not.toContain('La hinchada en el banco')
  })
})
