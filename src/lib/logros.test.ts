import { describe, expect, it } from 'vitest'
import type { Contribution, ImpactProject } from '@/types'
import { logrosDe, logrosNuevos, type DatosDeLogros } from './logros'

const HOY = new Date('2026-10-13T15:00:00-03:00')

function aporte(id: string, pointId: string, createdAt: string, units = 50): Contribution {
  return {
    id, userId: 'u1', pointId, pointName: pointId, sponsorId: 's_club', sponsorName: 'Talleres',
    material: 'tapitas', units, xpEarned: 100, projectId: 'pr_banco_club', status: 'validado', createdAt,
  }
}

const banco = {
  id: 'pr_banco_club', myContributionUnits: 640, goalUnits: 300000, collectedUnits: 42840,
  topContributors: [
    { name: 'Facu R.', units: 3120 }, { name: 'Lu M.', units: 1190 }, { name: 'Nico P.', units: 860 },
    { name: 'Camila R.', units: 640 }, { name: 'Agus T.', units: 540 }, { name: 'Sofi L.', units: 300 },
  ],
} as ImpactProject

// Camila en la demo: un aporte en el Estadio el 04/10, otro en un café, 12 días de racha y 4.ª del banco.
const camila: DatosDeLogros = {
  historial: [aporte('h1', 'p_club_estadio', '2026-10-04T15:00:00-03:00', 640), aporte('h2', 'p_cafe', '2026-09-22T10:00:00-03:00', 95)],
  sesion: [],
  rachaDias: 12,
  banco,
  nombre: 'Camila Rodríguez',
  hoy: HOY,
}

const porId = (d: DatosDeLogros) => Object.fromEntries(logrosDe(d).map((l) => [l.id, l]))

describe('logros de la hincha', () => {
  it('son seis, en el mismo orden siempre', () => {
    expect(logrosDe(camila).map((l) => l.id)).toEqual(['primera', 'racha', 'titular', 'cancha', 'mil', 'partidos'])
  })

  it('Camila llega con tres ganados y tres por ganar, con su progreso', () => {
    const l = porId(camila)
    expect([l.primera.ganado, l.racha.ganado, l.titular.ganado]).toEqual([true, true, true])
    expect(l.cancha.ganado).toBe(false)
    expect(l.mil).toMatchObject({ ganado: false, actual: 640, meta: 1000 })
    expect(l.partidos).toMatchObject({ ganado: false, actual: 1, meta: 3 })
  })

  it('un aporte en el Estadio hoy gana «Hincha de cancha» y suma un partido', () => {
    const despues = { ...camila, sesion: [aporte('s1', 'p_club_estadio', '2026-10-13T12:30:00-03:00')] }
    const l = porId(despues)
    expect(l.cancha.ganado).toBe(true)
    expect(l.partidos.actual).toBe(2)
    expect(logrosNuevos(camila, despues).map((x) => x.id)).toEqual(['cancha'])
  })

  it('en la demo general el estadio de Talleres también cuenta', () => {
    const despues = { ...camila, sesion: [aporte('s1', 'p_talleres_estadio', '2026-10-13T12:30:00-03:00')] }
    expect(porId(despues).cancha.ganado).toBe(true)
  })

  it('un aporte en otro punto no gana «Hincha de cancha»', () => {
    const despues = { ...camila, sesion: [aporte('s1', 'p_club_sede', '2026-10-13T12:30:00-03:00')] }
    expect(logrosNuevos(camila, despues)).toEqual([])
  })

  it('un aporte que aparece en el historial y en la sesión se cuenta una vez', () => {
    const s1 = aporte('s1', 'p_club_estadio', '2026-10-13T12:30:00-03:00')
    expect(porId({ ...camila, historial: [...camila.historial, s1], sesion: [s1] }).partidos.actual).toBe(2)
  })

  it('sin aportes, sin racha y fuera del banco no hay nada ganado', () => {
    const nuevo: DatosDeLogros = { historial: [], sesion: [], rachaDias: 0, banco, nombre: 'Ana Pérez', hoy: HOY }
    expect(logrosDe(nuevo).filter((l) => l.ganado)).toEqual([])
    expect(porId(nuevo).racha).toMatchObject({ actual: 0, meta: 7 })
  })

  it('el progreso nunca pasa la meta', () => {
    expect(porId(camila).racha).toMatchObject({ actual: 7, meta: 7 })
  })
})
