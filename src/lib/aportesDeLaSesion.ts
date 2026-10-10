import type { ActivityItem, Contribution, ImpactProject, RankingEntry } from '@/types'

/** «Camila Ríos» → «Camila R.», como figura la persona en los rankings y entre los que más aportan. */
export function nombreCorto(nombre: string): string {
  const [nombrePila, apellido] = nombre.trim().split(/\s+/)
  return apellido ? `${nombrePila} ${apellido[0]}.` : (nombrePila ?? '')
}

const esAporte = (item: ActivityItem): item is Contribution => !('kind' in item)

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
