import { describe, expect, it } from 'vitest'
import type { Benefit } from '@/types'
import { beneficiosDeLaRed, buscarBeneficio } from './beneficiosDeLaRed'

const b = (id: string, sponsorId = 's_club'): Benefit =>
  ({ id, title: id, sponsorId, sponsorName: 'Tu club', category: 'experiencia', costXp: 500, city: 'Red', description: '', stock: 100, emoji: '🎁' }) as Benefit

describe('beneficiosDeLaRed', () => {
  it('el hincha ve lo que el club publicó en su panel, primero', () => {
    const r = beneficiosDeLaRed([b('seed_1'), b('seed_2')], [b('b_new_foto')], [])
    expect(r.map((x) => x.id)).toEqual(['b_new_foto', 'seed_1', 'seed_2'])
  })

  it('lo que el club pausó no se le muestra al hincha (creado o del seed)', () => {
    const r = beneficiosDeLaRed([b('seed_1'), b('seed_2')], [b('b_new_foto')], ['seed_2', 'b_new_foto'])
    expect(r.map((x) => x.id)).toEqual(['seed_1'])
  })
})

describe('buscarBeneficio', () => {
  it('encuentra un beneficio creado en el panel, no sólo los del seed', () => {
    expect(buscarBeneficio('b_new_foto', [b('seed_1')], [b('b_new_foto')])?.id).toBe('b_new_foto')
    expect(buscarBeneficio('seed_1', [b('seed_1')], [])?.id).toBe('seed_1')
    expect(buscarBeneficio('no_existe', [b('seed_1')], [b('b_new_foto')])).toBeUndefined()
  })
})
