import type { SponsorMetrics } from '@/types'
import { objectsToCsv } from './utils'

/** Lo que dicen el PDF y el CSV del reporte: los dos salen de la demo y pueden circular sin ella. */
export const AVISO_DE_EJEMPLO =
  'Datos de ejemplo de la demo: no sirve como respaldo de RSE ni para auditoría.'

/** Las filas del reporte de impacto: los indicadores, los aportes por mes y por punto. */
export function filasDelReporte(m: SponsorMetrics): { metrica: string; valor: number }[] {
  return [
    { metrica: 'Usuarios activos', valor: m.activeUsers },
    { metrica: 'Aportes', valor: m.contributions },
    { metrica: 'XP emitidos', valor: m.xpEmitted },
    { metrica: 'Beneficios canjeados', valor: m.benefitsRedeemed },
    { metrica: 'Kg recuperados', valor: m.kgRecovered },
    { metrica: 'Tapitas recuperadas', valor: m.capsRecovered },
    { metrica: 'Huella Verde (0-100)', valor: m.greenScore },
    ...m.monthlySeries.map((s) => ({ metrica: `Aportes ${s.label}`, valor: s.value })),
    ...m.byPoint.map((p) => ({ metrica: `Punto: ${p.point}`, valor: p.contributions })),
  ]
}

/**
 * El CSV del reporte. Antes eran sólo los números: el archivo se descarga y se reenvía sin la
 * pantalla que dice que son de ejemplo, así que la primera línea lo dice. Empieza con la marca BOM
 * para que Excel lea bien los acentos y el «·» de «Punto R · Estadio».
 */
export function csvDelReporte(m: SponsorMetrics): string {
  return `﻿"${AVISO_DE_EJEMPLO}"\n${objectsToCsv(filasDelReporte(m))}`
}
