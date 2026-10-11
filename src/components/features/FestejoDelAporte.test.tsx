import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { FestejoDelAporte } from './FestejoDelAporte'

const proyecto = {
  id: 'pr_banco_club', title: 'Banco', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42890, myContributionUnits: 690,
  estimatedDate: '2027-03-31', illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

describe('FestejoDelAporte', () => {
  it('dice lo que sumaste sin prometer de más, y al tocar muestra el total final', () => {
    const { container, getByTestId, getByText } = render(<FestejoDelAporte proyecto={proyecto} unidades={50} xp={100} />)
    expect(container.textContent).toContain('+100 XP')
    expect(container.textContent).toContain('Tus 50 tapitas ya suman al banco de la hinchada')
    expect(container.querySelectorAll('circle[data-estado="tuya"]')).toHaveLength(1)
    // Antes de tocar, el marcador arranca en el total anterior: 42.890 - 50 = 42.840.
    expect(container.textContent).toContain('42.840')
    expect(container.textContent).not.toContain('42.890')
    // Antes de tocar, el XP espera su turno (todavía invisible).
    expect(getByText('+100 XP').style.opacity).toBe('0')
    fireEvent.click(getByTestId('festejo'))
    expect(container.textContent).toContain('42.890')
    // Después de tocar, el XP ya está en su estado final, sin esperar su demora.
    expect(getByText('+100 XP').style.opacity).not.toBe('0')
  })

  it('con un producto que publicó el club, lo nombra y dibuja su forma', () => {
    const butacas = {
      ...proyecto, id: 'pr_nuevo_1', title: 'Butacas para la platea', goalUnits: 119000, collectedUnits: 50,
      myContributionUnits: 50, forma: 'butacas', puntoId: 'p_club_sede',
    } as ImpactProject
    const { container } = render(<FestejoDelAporte proyecto={butacas} unidades={50} xp={100} />)
    expect(container.textContent).toContain('Talleres · Butacas para la platea')
    expect(container.textContent).toContain('Tus 50 tapitas ya suman a «Butacas para la platea»')
    expect(container.textContent).not.toContain('banco de la hinchada')
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
  })
})
