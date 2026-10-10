import { describe, expect, it } from 'vitest'
import type { RecyclePoint, Sponsor, SponsorMetrics } from '@/types'
import { conMesesHastaHoy, metricsFor, ultimosMeses } from './metrics'

const sponsor = { id: 's_club', name: 'Tu club', kgRecovered: 180, greenScore: 64 } as Sponsor
const punto = (id: string): RecyclePoint => ({ id, name: `Punto ${id}`, sponsorId: 's_club' }) as RecyclePoint

describe('ultimosMeses', () => {
  it('termina en el mes de hoy', () => {
    expect(ultimosMeses(5, new Date(2026, 9, 13))).toEqual(['Jun', 'Jul', 'Ago', 'Sep', 'Oct'])
  })
  it('cruza el año', () => {
    expect(ultimosMeses(5, new Date(2027, 1, 2))).toEqual(['Oct', 'Nov', 'Dic', 'Ene', 'Feb'])
  })
})

describe('metricsFor', () => {
  const hoy = new Date(2026, 9, 13)

  it('el gráfico por mes termina en el mes de hoy, no en mayo', () => {
    const m = metricsFor(sponsor, [punto('a')], hoy)
    expect(m.monthlySeries.map((s) => s.label)).toEqual(['Jun', 'Jul', 'Ago', 'Sep', 'Oct'])
  })

  it('los aportes por punto suman el total de aportes', () => {
    for (const n of [1, 2, 3, 5]) {
      const puntos = Array.from({ length: n }, (_, i) => punto(String(i)))
      const m = metricsFor(sponsor, puntos, hoy)
      expect(m.byPoint.reduce((t, p) => t + p.contributions, 0), `${n} puntos`).toBe(m.contributions)
    }
  })

  it('lo de cada mes no supera el total acumulado', () => {
    const m = metricsFor(sponsor, [punto('a'), punto('b')], hoy)
    expect(m.monthlySeries.reduce((t, s) => t + s.value, 0)).toBeLessThanOrEqual(m.contributions)
  })
})

describe('conMesesHastaHoy', () => {
  it('a las métricas cargadas a mano les pone los meses hasta hoy y conserva los valores', () => {
    const cargadas = {
      monthlySeries: [
        { label: 'Ene', value: 1 },
        { label: 'Feb', value: 2 },
        { label: 'Mar', value: 3 },
        { label: 'Abr', value: 4 },
        { label: 'May', value: 5 },
      ],
    } as SponsorMetrics
    const r = conMesesHastaHoy(cargadas, new Date(2026, 9, 13))
    expect(r.monthlySeries).toEqual([
      { label: 'Jun', value: 1 },
      { label: 'Jul', value: 2 },
      { label: 'Ago', value: 3 },
      { label: 'Sep', value: 4 },
      { label: 'Oct', value: 5 },
    ])
  })
})
