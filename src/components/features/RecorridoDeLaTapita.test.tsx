import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject, TraceEvent } from '@/types'
import { RecorridoDeLaTapita } from './RecorridoDeLaTapita'

const proyecto = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club', sponsorName: 'Club',
  description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42840,
  myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

const eventos: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas dejadas en el Punto R · Estadio.', date: '2026-10-04', done: true },
  { stage: 'validacion', title: 'Pesaje del lote', detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.', date: null, done: false, operator: 'Club' },
  { stage: 'lote', title: 'Lote del partido', detail: 'Los aportes del partido quedan agrupados en un lote.', date: null, done: false },
  { stage: 'producto', title: 'Instalación', detail: 'El banco se instala en el Estadio.', date: null, done: false },
]

describe('RecorridoDeLaTapita', () => {
  it('dice dónde está tu tapita, qué sigue y quién lo hace', () => {
    const { container } = render(<RecorridoDeLaTapita eventos={eventos} proyecto={proyecto} punto="Punto R · Estadio" propias={640 / 42840} />)
    const t = container.textContent ?? ''
    expect(t).toContain('El recorrido de tu tapita')
    expect(t).toContain('Tu tapita está en el Punto R · Estadio')
    expect(t).toContain('Lo que sigue: pesaje del lote, a cargo de Club')
    expect(t).toContain('Etapa 1 de 4')
    expect(container.querySelector('li[aria-current="step"]')?.textContent).toContain('Tu aporte')
    expect(container.querySelector('li[data-siguiente="true"]')?.textContent).toContain('lo que sigue')
  })

  it('las etapas pendientes no tienen fecha inventada, y el destino muestra el mismo avance', () => {
    const { container } = render(<RecorridoDeLaTapita eventos={eventos} proyecto={proyecto} propias={0} />)
    const t = container.textContent ?? ''
    expect(container.querySelectorAll('li').length).toBe(4)
    expect(t.match(/pendiente/g)?.length).toBe(3)
    expect(t).toContain('42.840 de 300.000 tapitas · 14%')
    expect(t).toContain('Tu tapita ya está en el recorrido')
    expect(t).not.toMatch(/en vivo|tiempo real/i)
  })

  it('la línea de cal no es hija directa de la lista', () => {
    const { container } = render(<RecorridoDeLaTapita eventos={eventos} proyecto={proyecto} propias={0} />)
    expect(container.querySelector('ol > span')).toBeNull()
  })

  it('si tu tapita todavía no entró, lo dice, no cuenta etapas y dibuja la forma del producto', () => {
    const sinHacer = eventos.map((e) => ({ ...e, done: false, date: null }))
    const { container } = render(
      <RecorridoDeLaTapita eventos={sinHacer} proyecto={{ ...proyecto, forma: 'arco' }} propias={0} />,
    )
    const t = container.textContent ?? ''
    expect(t).toContain('Tu tapita todavía no entró a este recorrido')
    expect(t).not.toContain('Tu tapita ya está en el recorrido')
    expect(t).not.toMatch(/Etapa \d+ de/)
    expect(container.querySelector('svg[data-forma="arco"]')).not.toBeNull()
  })
})
