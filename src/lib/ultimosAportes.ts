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

/** Cuántos aportes de esta sesión entran en la lista: el resto del lugar es para los que más aportan. */
const FILAS_DE_LA_SESION = 2

/**
 * Lo que muestra el banco de la hinchada: primero los aportes de esta sesión a ese proyecto (los
 * 2 más nuevos, tal como vienen), con su hora real; después el acumulado de los que más aportan.
 * No dice «en vivo» ni inventa horarios: el acumulado de `topContributors` no tiene hora.
 */
export function ultimosAportesDeLaHinchada(
  proyecto: ImpactProject,
  actividad: ActivityItem[],
  nombreDelUsuario?: string,
  tope = 5,
): AporteDeLaHinchada[] {
  // Un nombre de sólo espacios no es un nombre: figura como «Un hincha».
  const corto = (nombreDelUsuario && nombreCorto(nombreDelUsuario)) || undefined
  const deLaSesion: AporteDeLaHinchada[] = actividad
    .filter(esAporte)
    .filter((c) => c.projectId === proyecto.id && c.material === proyecto.material)
    .slice(0, FILAS_DE_LA_SESION)
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
