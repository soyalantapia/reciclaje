import type { ActivityItem, Contribution, ImpactProject } from '@/types'
import { nombreCorto } from './aportesDeLaSesion'
import { formatNumber } from './utils'

/** Una fila de «la hinchada en el banco». */
export interface AporteDeLaHinchada {
  id: string
  nombre: string
  /** «dejó 50 tapitas» para lo de esta sesión; «lleva 3.120 tapitas» para el acumulado. */
  texto: string
  esTuyo: boolean
  /** Sólo en los aportes de esta sesión: su hora real. El acumulado no tiene hora. */
  cuando?: string
}

const esAporte = (i: ActivityItem): i is Contribution => !('kind' in i)

/**
 * Lo que muestra el banco de la hinchada: primero los aportes de esta sesión a ese proyecto, con
 * su hora real; después el acumulado de los que más aportan. No dice «en vivo» ni inventa
 * horarios: el acumulado de `topContributors` no tiene hora.
 */
export function ultimosAportesDeLaHinchada(
  proyecto: ImpactProject,
  actividad: ActivityItem[],
  nombreDelUsuario?: string,
  tope = 5,
): AporteDeLaHinchada[] {
  const corto = nombreDelUsuario ? nombreCorto(nombreDelUsuario) : undefined
  const deLaSesion: AporteDeLaHinchada[] = actividad
    .filter(esAporte)
    .filter((c) => c.projectId === proyecto.id && c.material === proyecto.material)
    .map((c) => ({
      id: c.id,
      nombre: corto ?? 'Un hincha',
      texto: `dejó ${formatNumber(c.units ?? 0)} ${proyecto.unitLabel}`,
      esTuyo: corto !== undefined,
      cuando: c.createdAt,
    }))
  const acumulado: AporteDeLaHinchada[] = proyecto.topContributors.map((t) => ({
    id: `top_${t.name}`,
    nombre: t.name,
    texto: `lleva ${formatNumber(t.units)} ${proyecto.unitLabel}`,
    esTuyo: t.name === corto,
  }))
  return [...deLaSesion, ...acumulado].slice(0, tope)
}
