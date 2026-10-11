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
    expect(container.querySelector('[aria-label^="Banco de tapitas"]')).toBeNull()
    expect(container.querySelector('svg[aria-label="Mobiliario y cartelería reciclada"]')).not.toBeNull()
    // «Los titulares de la hinchada» es sólo del banco: los demás proyectos siguen con «Top aportantes».
    expect(container.textContent).toContain('Top aportantes')
    expect(container.textContent).not.toContain('hinchada')
  })

  it('la línea de cal no es hija directa de la lista y la etapa actual se anuncia como paso actual', () => {
    const { container } = render(<ImpactProgress project={banco} />)
    const lista = container.querySelector('ol')!
    expect(lista.querySelector(':scope > span')).toBeNull()
    expect(lista.parentElement?.querySelector(':scope > span[aria-hidden="true"]')).not.toBeNull()
    expect([...lista.children].every((hijo) => hijo.tagName === 'LI')).toBe(true)
    const actual = container.querySelector('li[aria-current="step"]')
    expect(actual?.textContent).toContain('Recolección')
    expect(container.querySelectorAll('li[aria-current]')).toHaveLength(1)
  })

  it('sin hitos o sin aportantes no dibuja encabezados vacíos', () => {
    const { container } = render(
      <ImpactProgress project={{ ...banco, milestones: [], topContributors: [] } as ImpactProject} />,
    )
    expect(container.querySelector('ol')).toBeNull()
    expect(container.textContent).not.toContain('Hitos del proyecto')
    expect(container.textContent).not.toContain('Los titulares de la hinchada')
    expect(container.textContent).not.toContain('Top aportantes')
  })
})
