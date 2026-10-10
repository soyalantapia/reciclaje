import type { RecyclePoint, Sponsor, SponsorMetrics } from '@/types'

/**
 * Genera métricas deterministas para un comercio a partir de su sponsor + puntos.
 * Sirve igual para comercios del seed que para comercios recién creados (onboarding),
 * porque solo depende del objeto Sponsor (kgRecovered, greenScore) y sus puntos.
 */
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Los últimos `n` meses terminando en el de `hoy`: el 13/10 da Jun…Oct. */
export function ultimosMeses(n: number, hoy: Date = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => MESES[(hoy.getMonth() - (n - 1 - i) + 120) % 12])
}

/**
 * Las métricas cargadas a mano traen la serie con meses fijos (Ene…May). Se conservan los valores
 * y se rotulan con los últimos meses hasta hoy, para que en octubre el gráfico no termine en mayo.
 */
export function conMesesHastaHoy(m: SponsorMetrics, hoy: Date = new Date()): SponsorMetrics {
  const meses = ultimosMeses(m.monthlySeries.length, hoy)
  return { ...m, monthlySeries: m.monthlySeries.map((s, i) => ({ ...s, label: meses[i] })) }
}

/**
 * Reparte `total` según `pesos` y la suma da exactamente `total`: el último se lleva el redondeo.
 * Antes cada punto se redondeaba por su cuenta con pesos sin normalizar, y en el panel del club
 * los dos Punto R sumaban 766 con un total de 828.
 */
function repartir(total: number, pesos: number[]): number[] {
  const suma = pesos.reduce((t, p) => t + p, 0)
  const partes = pesos.map((p) => Math.round((total * p) / suma))
  partes[partes.length - 1] = total - partes.slice(0, -1).reduce((t, p) => t + p, 0)
  return partes
}

export function metricsFor(sponsor: Sponsor, points: RecyclePoint[], hoy: Date = new Date()): SponsorMetrics {
  const kg = sponsor.kgRecovered
  // `contributions` es el acumulado, como en las métricas cargadas a mano: la suma por punto da eso,
  // y la serie es lo de cada mes.
  const contributions = Math.round(kg * 4.6)
  const monthBase = Math.max(60, Math.round(contributions / 16))
  const monthlySeries = ultimosMeses(5, hoy).map((label, i) => ({
    label,
    value: Math.round(monthBase * (1 + i * 0.4)),
  }))
  const sp = points.filter((p) => p.sponsorId === sponsor.id)
  const reparto = repartir(contributions, sp.map((_, i) => 0.85 + (i % 3) * 0.15))
  const byPoint = sp.length
    ? sp.map((p, i) => ({ point: p.name, contributions: reparto[i] }))
    : [{ point: 'Canal online / e-commerce', contributions }]
  return {
    sponsorId: sponsor.id,
    sponsorName: sponsor.name,
    greenScore: sponsor.greenScore,
    activeUsers: Math.round(kg * 0.9),
    contributions,
    xpEmitted: Math.round(contributions * 68),
    benefitsRedeemed: Math.round(contributions * 0.034),
    kgRecovered: kg,
    capsRecovered: Math.round(kg * 238),
    monthlySeries,
    byPoint,
  }
}
