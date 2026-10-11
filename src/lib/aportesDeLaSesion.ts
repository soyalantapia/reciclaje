import type { ActivityItem, Contribution, Coupon, ImpactProject, RankingEntry, SponsorMetrics, TraceEvent } from '@/types'
import { TAPITAS_POR_KILO } from './metrics'

/** «Camila Ríos» → «Camila R.», como figura la persona en los rankings y entre los que más aportan. */
export function nombreCorto(nombre: string): string {
  const [nombrePila, apellido] = nombre.trim().split(/\s+/)
  return apellido ? `${nombrePila} ${apellido[0]}.` : (nombrePila ?? '')
}

export const esAporte = (item: ActivityItem): item is Contribution => !('kind' in item)

/**
 * El proyecto con los aportes que la persona registró en esta sesión.
 *
 * Los totales del proyecto vienen fijos del simulador y cada aporte nuevo queda en el store de
 * actividad (`src/store/activity.ts`). Sin esta suma, la pantalla de éxito decía «tu aporte suma a
 * un proyecto» y el proyecto seguía con el mismo número. Cuenta sólo los aportes de ese proyecto y
 * de su material: el plástico no se suma a una meta en tapitas.
 */
export function conAportesDeLaSesion(
  project: ImpactProject,
  actividad: ActivityItem[],
  nombreDelUsuario?: string,
): ImpactProject {
  const suma = actividad
    .filter(esAporte)
    .filter((c) => c.projectId === project.id && c.material === project.material)
    .reduce((total, c) => total + (c.units ?? 0), 0)
  if (suma === 0) return project

  const corto = nombreDelUsuario ? nombreCorto(nombreDelUsuario) : undefined
  const topContributors = project.topContributors
    .map((c) => (c.name === corto ? { ...c, units: c.units + suma } : c))
    .sort((a, b) => b.units - a.units)

  return {
    ...project,
    collectedUnits: project.collectedUnits + suma,
    myContributionUnits: project.myContributionUnits + suma,
    topContributors,
  }
}

const mismoMes = (iso: string, hoy: Date) => {
  const d = new Date(iso)
  return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth()
}

/**
 * El ranking del mes con el XP que la persona ganó en esta sesión: la gemela de
 * `conAportesDeLaSesion`. El ranking viene fijo del simulador, así que después de sumar XP la
 * billetera subía y la fila «vos» del ranking seguía igual. Con `sponsorId` (el ranking de una
 * sede) cuenta sólo lo ganado ahí; sin él (el global), todo. Reordena y renumera las posiciones.
 */
export function rankingConXpDeLaSesion(
  entries: RankingEntry[],
  actividad: ActivityItem[],
  sponsorId?: string,
  hoy: Date = new Date(),
): RankingEntry[] {
  const xp = actividad
    .filter((i) => (!sponsorId || i.sponsorId === sponsorId) && mismoMes(i.createdAt, hoy))
    .reduce((total, i) => total + i.xpEarned, 0)
  if (xp === 0) return entries

  return entries
    .map((e) => (e.isCurrentUser ? { ...e, xpThisMonth: e.xpThisMonth + xp } : e))
    .sort((a, b) => b.xpThisMonth - a.xpThisMonth)
    .map((e, i) => ({ ...e, position: i + 1 }))
}

const fechaLocal = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * La traza del proyecto con el último aporte de la sesión en el hito «Tu aporte»: la tercera gemela.
 * La pantalla de éxito manda a «Trazabilidad» y ahí el hito seguía con el aporte de ejemplo
 * (640 tapitas, 04/10), no con el que la persona acababa de registrar.
 */
export function conAporteDeLaSesionEnLaTraza(
  traza: TraceEvent[],
  project: ImpactProject,
  actividad: ActivityItem[],
): TraceEvent[] {
  const ultimo = actividad
    .filter(esAporte)
    .filter((c) => c.projectId === project.id && c.material === project.material)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  if (!ultimo) return traza
  return traza.map((e) =>
    e.stage === 'aporte'
      ? { ...e, detail: `${ultimo.units ?? 0} ${project.unitLabel} en ${ultimo.pointName}.`, date: fechaLocal(ultimo.createdAt), done: true }
      : e,
  )
}

/**
 * Las métricas del panel con lo que la hinchada hizo en esta sesión: la cuarta gemela. El hincha
 * aportaba, veía el banco en 42.890 y, en el mismo navegador, el panel del club seguía en 42.840
 * con los mismos aportes; un canje de un beneficio del club tampoco movía «Beneficios canjeados».
 * Suma los aportes de ese sponsor (con su punto y su mes), el XP de aportes y compras, y los
 * canjes de sus beneficios. Los usuarios activos no cambian: la persona ya estaba contada.
 */
export function metricasConLaSesion(
  m: SponsorMetrics,
  actividad: ActivityItem[],
  cupones: Coupon[],
  hoy: Date = new Date(),
): SponsorMetrics {
  const delSponsor = actividad.filter((i) => i.sponsorId === m.sponsorId)
  const aportes = delSponsor.filter(esAporte)
  const canjes = cupones.filter((c) => c.sponsorName === m.sponsorName).length
  if (delSponsor.length === 0 && canjes === 0) return m

  const tapitas = aportes.filter((c) => c.material === 'tapitas').reduce((t, c) => t + (c.units ?? 0), 0)
  const kilos = aportes.reduce((t, c) => t + (c.weightKg ?? 0), 0) + tapitas / TAPITAS_POR_KILO
  const delMes = aportes.filter((c) => mismoMes(c.createdAt, hoy)).length
  const porPunto = (punto: string) => aportes.filter((c) => c.pointName === punto).length

  return {
    ...m,
    contributions: m.contributions + aportes.length,
    xpEmitted: m.xpEmitted + delSponsor.reduce((t, i) => t + i.xpEarned, 0),
    benefitsRedeemed: m.benefitsRedeemed + canjes,
    kgRecovered: Math.round(m.kgRecovered + kilos),
    capsRecovered: m.capsRecovered + tapitas,
    monthlySeries: m.monthlySeries.map((s, i, serie) =>
      i === serie.length - 1 ? { ...s, value: s.value + delMes } : s,
    ),
    byPoint: m.byPoint.map((p) => ({ ...p, contributions: p.contributions + porPunto(p.point) })),
  }
}
