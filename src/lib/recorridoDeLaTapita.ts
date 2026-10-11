import type { ActivityItem, Contribution, ImpactProject, TraceEvent } from '@/types'
import { esAporte } from './aportesDeLaSesion'

/** Dónde está tu tapita en el recorrido: la última etapa hecha, la que sigue y cuántas hay. */
export interface EstadoDelRecorrido {
  /** Índice de la última etapa hecha; -1 si todavía no entró al recorrido. */
  actual: number
  /** Índice de la primera etapa no hecha después de `actual`; `null` si ya llegó al final. */
  siguiente: number | null
  total: number
}

export function estadoDelRecorrido(eventos: TraceEvent[]): EstadoDelRecorrido {
  let actual = -1
  eventos.forEach((e, i) => {
    if (e.done) actual = i
  })
  const siguiente = eventos.findIndex((e, i) => i > actual && !e.done)
  return { actual, siguiente: siguiente === -1 ? null : siguiente, total: eventos.length }
}

/**
 * El punto donde la persona dejó su tapita: el aporte más reciente de esta sesión a ese proyecto
 * (y su material); si no hay, el de su historial. Sin ninguno, no se nombra un punto.
 */
export function puntoDeTuTapita(
  proyecto: ImpactProject,
  actividad: ActivityItem[],
  historial: Contribution[],
): string | undefined {
  const delProyecto = (c: Contribution) => c.projectId === proyecto.id && c.material === proyecto.material
  const masReciente = (lista: Contribution[]) =>
    [...lista].filter(delProyecto).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  return (masReciente(actividad.filter(esAporte)) ?? masReciente(historial))?.pointName
}
