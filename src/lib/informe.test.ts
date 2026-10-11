import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { ETAPAS_DEL_PILOTO, SIN_PESAJES, topDeLaHinchada } from './informe'

const producto = (id: string, topContributors: ImpactProject['topContributors']) =>
  ({ id, topContributors }) as ImpactProject

describe('topDeLaHinchada', () => {
  it('suma a cada hincha lo de todos los productos y deja a los primeros', () => {
    const top = topDeLaHinchada(
      [
        producto('banco', [
          { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
          { name: 'Camila R.', units: 640, avatarColor: '#059669' },
        ]),
        producto('butacas', [{ name: 'Camila R.', units: 3000, avatarColor: '#059669' }]),
      ],
      5,
    )
    expect(top.map((c) => [c.name, c.units])).toEqual([
      ['Camila R.', 3640],
      ['Facu R.', 3120],
    ])
  })

  it('quien usa la demo suma también lo que aportó a un producto donde todavía no figura', () => {
    const banco = { ...producto('banco', [{ name: 'Camila R.', units: 640, avatarColor: '#059669' }]), myContributionUnits: 640 }
    const butacas = { ...producto('butacas', []), myContributionUnits: 50 }
    expect(topDeLaHinchada([banco, butacas], 5, 'Camila R.').map((c) => [c.name, c.units])).toEqual([['Camila R.', 690]])
    // Sin saber quién usa la demo, no se le atribuye nada a nadie.
    expect(topDeLaHinchada([banco, butacas]).map((c) => [c.name, c.units])).toEqual([['Camila R.', 640]])
  })

  it('corta en el tope y, sin aportantes, no inventa ninguno', () => {
    const muchos = Array.from({ length: 8 }, (_, i) => ({ name: `H${i}`, units: i, avatarColor: '#000' }))
    expect(topDeLaHinchada([producto('banco', muchos)])).toHaveLength(5)
    expect(topDeLaHinchada([])).toEqual([])
  })
})

describe('ETAPAS_DEL_PILOTO', () => {
  it('son las cuatro del piloto y cubren los 90 días sin huecos', () => {
    expect(ETAPAS_DEL_PILOTO.map((e) => e.nombre)).toEqual([
      'Preparación',
      'Lanzamiento controlado',
      'Operación en partidos',
      'Evaluación y decisión',
    ])
    expect(ETAPAS_DEL_PILOTO.map((e) => e.dias.match(/\d+/g)!.map(Number))).toEqual([
      [1, 20],
      [21, 35],
      [36, 75],
      [76, 90],
    ])
  })
})

describe('SIN_PESAJES', () => {
  it('no trae números de partidos: sólo dice desde cuándo se completa', () => {
    expect(SIN_PESAJES).toBe('Se completa con el pesaje de cada partido, desde la etapa 1 del piloto.')
  })
})
