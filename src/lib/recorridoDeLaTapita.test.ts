import { describe, expect, it } from 'vitest'
import type { Contribution, ImpactProject, TraceEvent } from '@/types'
import { estadoDelRecorrido, puntoDeTuTapita } from './recorridoDeLaTapita'

const etapa = (stage: TraceEvent['stage'], done: boolean): TraceEvent => ({ stage, title: stage, detail: '', date: done ? '2026-10-04' : null, done })
const siete = (hechas: boolean[]) =>
  (['aporte', 'validacion', 'lote', 'retiro', 'clasificacion', 'transformacion', 'producto'] as const).map((s, i) => etapa(s, hechas[i] ?? false))

describe('estadoDelRecorrido', () => {
  it('con sólo el aporte hecho, tu tapita está en la etapa 1 y lo que sigue es la 2', () => {
    expect(estadoDelRecorrido(siete([true]))).toEqual({ actual: 0, siguiente: 1, total: 7 })
  })
  it('con todo hecho no hay etapa siguiente', () => {
    expect(estadoDelRecorrido(siete([true, true, true, true, true, true, true]))).toEqual({ actual: 6, siguiente: null, total: 7 })
  })
  it('sin nada hecho, tu tapita no entró y lo que sigue es la primera', () => {
    expect(estadoDelRecorrido(siete([]))).toEqual({ actual: -1, siguiente: 0, total: 7 })
  })
  it('la actual es la última hecha, aunque haya un hueco antes', () => {
    expect(estadoDelRecorrido(siete([true, false, true]))).toEqual({ actual: 2, siguiente: 3, total: 7 })
  })
})

const proyecto = { id: 'pr_banco_club', material: 'tapitas' } as ImpactProject
const aporte = (c: Partial<Contribution>): Contribution => ({
  id: 'c', userId: 'u_me', pointId: 'p', pointName: 'Punto R · Estadio', sponsorId: 's_club', sponsorName: 'Club',
  material: 'tapitas', units: 50, xpEarned: 100, projectId: 'pr_banco_club', status: 'pendiente',
  createdAt: '2026-10-04T19:30:00-03:00', ...c,
})

describe('puntoDeTuTapita', () => {
  it('usa el aporte más reciente de la sesión a ese proyecto', () => {
    const sesion = [aporte({ id: 'a', pointName: 'Punto R · Sede social', createdAt: '2026-10-13T10:00:00-03:00' }), aporte({ id: 'b', pointName: 'Punto R · Estadio', createdAt: '2026-10-13T12:00:00-03:00' })]
    expect(puntoDeTuTapita(proyecto, sesion, [])).toBe('Punto R · Estadio')
  })
  it('sin sesión, usa el historial', () => {
    expect(puntoDeTuTapita(proyecto, [], [aporte({ pointName: 'Punto R · Sede social' })])).toBe('Punto R · Sede social')
  })
  it('ignora otros proyectos y otros materiales, y sin nada no nombra un punto', () => {
    expect(puntoDeTuTapita(proyecto, [aporte({ projectId: 'otro' }), aporte({ material: 'plastico' })], [])).toBeUndefined()
  })
})
