import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Marcador } from './Marcador'
import { UltimosAportes } from './UltimosAportes'
import { BancoDeLaHinchada } from './BancoDeLaHinchada'

const estados = (c: HTMLElement, e: string) => c.querySelectorAll(`circle[data-estado="${e}"]`).length

describe('BancoDeTapitas', () => {
  it('dibuja 80 tapitas: 10 de la hinchada, 1 tuya y el resto vacías', () => {
    const { container } = render(<BancoDeTapitas progreso={42840 / 300000} propias={640 / 42840} />)
    expect([estados(container, 'hinchada'), estados(container, 'tuya'), estados(container, 'vacia')]).toEqual([10, 1, 69])
  })
})

describe('Marcador', () => {
  it('muestra el número con separador de miles y su etiqueta', () => {
    render(<Marcador valor={42890} etiqueta="tapitas de 300.000" />)
    expect(screen.getByText('42.890')).toBeInTheDocument()
    expect(screen.getByText('tapitas de 300.000')).toBeInTheDocument()
  })
})

describe('UltimosAportes', () => {
  it('marca el tuyo y muestra la hora sólo donde la hay', () => {
    const { container } = render(
      <UltimosAportes
        items={[
          { id: 'a', nombre: 'Camila R.', texto: 'dejó 50 tapitas', esTuyo: true, cuando: new Date().toISOString() },
          { id: 'b', nombre: 'Facu R.', texto: 'lleva 3.120 tapitas', esTuyo: false },
        ]}
      />,
    )
    expect(container.querySelectorAll('li[data-tuyo="true"]')).toHaveLength(1)
    expect(container.textContent).toContain('dejó 50 tapitas')
    expect(container.textContent).not.toMatch(/en vivo|tiempo real/i)
  })
})

describe('BancoDeLaHinchada', () => {
  it('cuenta el avance con los números del proyecto y no dice «en vivo»', () => {
    const proyecto = {
      id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
      sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
      collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
      milestones: [], topContributors: [],
    } as ImpactProject
    const { container } = render(
      <MemoryRouter>
        <BancoDeLaHinchada proyecto={proyecto} items={[]} propias={640 / 42840} enlace="/proyecto/pr_banco_club" />
      </MemoryRouter>,
    )
    expect(container.textContent).toContain('42.840')
    expect(container.textContent).toContain('14%')
    expect(container.textContent).not.toMatch(/en vivo|tiempo real/i)
  })
})
