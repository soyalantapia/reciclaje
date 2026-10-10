import { describe, expect, it } from 'vitest'
import type { Campaign, MonthlyPrize } from '@/types'
import { campanasDelPanel, campanasParaLaHinchada } from './campanasDeLaRed'

const premio: MonthlyPrize = {
  sponsorId: 's_club',
  sponsorName: 'Talleres',
  title: 'Experiencia banco de suplentes',
  description: 'Quien más aporte vive un partido desde el banco.',
  emoji: '🏟️',
}
const premioGlobal: MonthlyPrize = { ...premio, sponsorId: 'reciclaxp', sponsorName: 'ReciclaXP', title: 'Kit circular del mes' }
const campana = (c: Partial<Campaign> = {}): Campaign => ({
  id: 'cmp_1',
  sponsorId: 's_club',
  kind: 'premio',
  title: 'Foto con el plantel',
  detail: 'Para quien más aporte este mes',
  reward: 'Foto con el plantel',
  active: true,
  createdAt: '2026-10-10T12:00:00Z',
  ...c,
})

describe('campanasDelPanel', () => {
  it('el premio que la hinchada ya ve en el ranking figura en el panel como campaña activa', () => {
    const r = campanasDelPanel('s_club', [], premio, [])
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ id: 'premio_s_club', kind: 'premio', title: premio.title, active: true })
  })

  it('las propias van primero, y el premio del simulador pausado figura como pausado', () => {
    const r = campanasDelPanel('s_club', [campana()], premio, ['premio_s_club'])
    expect(r.map((c) => [c.id, c.active])).toEqual([
      ['cmp_1', true],
      ['premio_s_club', false],
    ])
  })

  it('el premio o las campañas de otro sponsor no aparecen', () => {
    expect(campanasDelPanel('s_ypf', [campana()], premio, [])).toEqual([])
  })
})

describe('campanasParaLaHinchada', () => {
  it('sin campañas del club, la hinchada ve el premio del simulador', () => {
    expect(campanasParaLaHinchada(premio, 's_club', [], [])).toEqual({ premio, desafios: [] })
  })

  it('un premio del mes lanzado en el panel reemplaza al del simulador', () => {
    const r = campanasParaLaHinchada(premio, 's_club', [campana()], [])
    expect(r.premio).toMatchObject({ sponsorId: 's_club', sponsorName: 'Talleres', title: 'Foto con el plantel' })
  })

  it('la hinchada ve qué se gana, no sólo el título del premio', () => {
    const r = campanasParaLaHinchada(premio, 's_club', [campana({ reward: 'Foto en la práctica del jueves' })], [])
    expect(r.premio?.description).toBe('Para quien más aporte este mes · 🎁 Foto en la práctica del jueves')
  })

  it('lo pausado en el panel no se muestra: sin ningún premio activo, no hay premio', () => {
    expect(campanasParaLaHinchada(premio, 's_club', [campana({ active: false })], ['premio_s_club']).premio).toBeNull()
  })

  it('los desafíos activos del club también los ve la hinchada', () => {
    const d = campana({ id: 'cmp_2', kind: 'desafio', title: '1.000 tapitas en el clásico' })
    expect(campanasParaLaHinchada(premio, 's_club', [d], []).desafios.map((c) => c.id)).toEqual(['cmp_2'])
  })

  it('la pestaña global y las campañas de otro sponsor no se mezclan', () => {
    expect(campanasParaLaHinchada(premioGlobal, undefined, [campana()], [])).toEqual({ premio: premioGlobal, desafios: [] })
    expect(campanasParaLaHinchada(premio, 's_club', [campana({ sponsorId: 's_ypf' })], [])).toEqual({ premio, desafios: [] })
  })
})
