import type { RecyclePoint, Sponsor, SponsorMetrics } from '@/types'

/**
 * Genera métricas deterministas para un comercio a partir de su sponsor + puntos.
 * Sirve igual para comercios del seed que para comercios recién creados (onboarding),
 * porque solo depende del objeto Sponsor (kgRecovered, greenScore) y sus puntos.
 */
export function metricsFor(sponsor: Sponsor, points: RecyclePoint[]): SponsorMetrics {
  const kg = sponsor.kgRecovered
  const contributions = Math.round(kg * 4.6)
  const monthBase = Math.max(60, Math.round(contributions / 16))
  const monthlySeries = ['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((label, i) => ({
    label,
    value: Math.round(monthBase * (1 + i * 0.4)),
  }))
  const sp = points.filter((p) => p.sponsorId === sponsor.id)
  const byPoint = sp.length
    ? sp.map((p, i) => ({
        point: p.name,
        contributions: Math.round(
          (contributions / sp.length) * (0.85 + (i % 3) * 0.15),
        ),
      }))
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
