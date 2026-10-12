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

  it('sin aportes todavía, muestra la invitación en lugar de una lista vacía', () => {
    const recien = { ...butacas, collectedUnits: 0, myContributionUnits: 0 }
    const invitacion = 'Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!'
    const { container, rerender } = render(<BancoDeLaHinchada proyecto={recien} items={[]} propias={0} invitacion={invitacion} />)
    expect(container.textContent).toContain(invitacion)
    // Con aportes, va la lista y no la invitación.
    const items = [{ id: 'c1', nombre: 'Camila R.', texto: 'dejó 50 tapitas', esTuyo: true }]
    rerender(<BancoDeLaHinchada proyecto={butacas} items={items} propias={1} invitacion={invitacion} />)
    expect(container.textContent).not.toContain(invitacion)
    expect(container.textContent).toContain('La hinchada que suma')
  })

  it('con una empresa que lo acompaña, lo dice debajo del título con su color; sin ella, no dice nada', () => {
    const con = { ...butacas, patrocinador: { id: 's_ypf', nombre: 'Norte Energía', color: '#0f3d91' } }
    const { container, rerender } = render(<BancoDeLaHinchada proyecto={con} items={[]} propias={0} />)
    const apoyo = container.querySelector('[data-apoyo]')!
    expect(apoyo.textContent).toBe('Con el apoyo de Norte Energía')
    // El logo de la empresa, con su color.
    expect((apoyo.querySelector('[data-logo="s_ypf"]') as HTMLElement).style.backgroundColor).toBe('rgb(15, 61, 145)')
    rerender(<BancoDeLaHinchada proyecto={butacas} items={[]} propias={0} />)
    expect(container.querySelector('[data-apoyo]')).toBeNull()
  })

  it('un producto de Talleres lleva su escudo al lado del nombre del club', () => {
    const { container } = render(<BancoDeLaHinchada proyecto={{ ...butacas, sponsorId: 's_club' }} items={[]} propias={0} />)
    expect(container.querySelector('img[data-escudo="s_club"]')?.getAttribute('src')).toMatch(/clubes\/talleres\/escudo\.svg$/)
  })
})
