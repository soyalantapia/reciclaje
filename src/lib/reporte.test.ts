import { describe, expect, it } from 'vitest'
import type { SponsorMetrics } from '@/types'
import { AVISO_DE_EJEMPLO, csvDelReporte } from './reporte'

const m: SponsorMetrics = {
  sponsorId: 's_club',
  sponsorName: 'Talleres',
  greenScore: 64,
  activeUsers: 162,
  contributions: 828,
  xpEmitted: 56304,
  benefitsRedeemed: 28,
  kgRecovered: 180,
  capsRecovered: 42840,
  monthlySeries: [{ label: 'Oct', value: 120 }],
  byPoint: [{ point: 'Punto R · Estadio', contributions: 380 }],
}

describe('csvDelReporte', () => {
  it('el archivo dice que son datos de ejemplo, como el PDF: viaja sin la pantalla que lo aclara', () => {
    const csv = csvDelReporte(m)
    expect(csv.replace('﻿', '').split('\n')[0]).toContain(AVISO_DE_EJEMPLO)
    expect(AVISO_DE_EJEMPLO).toMatch(/ejemplo/)
  })

  it('empieza con la marca BOM, para que Excel lea los acentos y el «·»', () => {
    expect(csvDelReporte(m).startsWith('﻿')).toBe(true)
  })

  it('trae los indicadores, los meses y los puntos', () => {
    const csv = csvDelReporte(m)
    expect(csv).toContain('Aportes,828')
    expect(csv).toContain('Aportes Oct,120')
    expect(csv).toContain('Punto: Punto R · Estadio,380')
  })
})
