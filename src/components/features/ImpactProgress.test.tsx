import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { ImpactProgress } from './ImpactProgress'

const banco = {
  id: 'pr_banco_club', title: 'Banco', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640,
  estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [
    { label: 'Recolección', done: false },
    { label: 'Pesaje y retiro', done: false },
    { label: 'Fabricación', done: false },
    { label: 'Instalación', done: false },
  ],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
    { name: 'Camila R.', units: 640, avatarColor: '#059669' },
  ],
} as ImpactProject

describe('ImpactProgress del banco', () => {
  it('dibuja el banco de tapitas, marca la etapa actual y destaca a la persona entre los titulares', () => {
    const { container } = render(<ImpactProgress project={banco} nombreCorto="Camila R." />)
    expect(container.querySelectorAll('circle[data-estado]')).toHaveLength(80)
    expect(container.querySelector('[data-hito-actual="true"]')?.textContent).toContain('Recolección')
    expect(container.textContent).toContain('Los titulares de la hinchada')
    expect(container.querySelector('[data-titular-tuyo="true"]')?.textContent).toContain('Camila R.')
  })

  it('un proyecto que no es un banco sigue con su ilustración', () => {
    const { container } = render(<ImpactProgress project={{ ...banco, illustration: 'totem' } as ImpactProject} />)
    expect(container.querySelectorAll('circle[data-estado]')).toHaveLength(0)
  })
})
