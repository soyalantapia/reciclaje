import type { ActivityItem, Contribution, ImpactProject } from '@/types'
import { esAporte, nombreCorto } from './aportesDeLaSesion'

/**
 * Los logros de la hincha (pedido de Juanpi del 12/10/2026: «más gamificación»). Se calculan con lo que
 * ya hay —historial, aportes de la sesión, racha y el banco— sin guardar nada nuevo. «Hincha de cancha»
 * pide un aporte en el Estadio hoy: Camila ya aportó ahí el 04/10, y así se desbloquea en vivo.
 */
export type IdDeLogro = 'primera' | 'racha' | 'titular' | 'cancha' | 'mil' | 'partidos'

export interface Logro {
  id: IdDeLogro
  titulo: string
  /** Qué hiciste (ganado) o qué hay que hacer (por ganar). */
  detalle: string
  ganado: boolean
  actual: number
  meta: number
}

export interface DatosDeLogros {
  historial: Contribution[]
  sesion: ActivityItem[]
  rachaDias: number
  /** El banco de la hinchada con los aportes de la sesión, si la demo tiene uno. */
  banco?: ImpactProject | null
  nombre?: string
  hoy?: Date
}

const esDelEstadio = (c: Contribution) => /_estadio$/.test(c.pointId)

/** El día local `AAAA-MM-DD` de un aporte. */
function dia(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function logro(id: IdDeLogro, titulo: string, ganado: string, porGanar: string, actual: number, meta: number): Logro {
  const hecho = actual >= meta
  return { id, titulo, detalle: hecho ? ganado : porGanar, ganado: hecho, actual: Math.min(actual, meta), meta }
}

export function logrosDe({ historial, sesion, rachaDias, banco, nombre, hoy = new Date() }: DatosDeLogros): Logro[] {
  // Un aporte de la sesión puede volver también en el historial: se cuenta una vez.
  const aportes = [...new Map([...historial, ...sesion.filter(esAporte)].map((c) => [c.id, c])).values()]
  const enElEstadio = aportes.filter(esDelEstadio)
  const corto = nombre ? nombreCorto(nombre) : undefined
  const puesto = banco && corto ? banco.topContributors.findIndex((c) => c.name === corto) + 1 : 0

  return [
    logro('primera', 'Primera tapita', 'Hiciste tu primer aporte.', 'Hacé tu primer aporte.', aportes.length, 1),
    logro('racha', 'Racha de 7 días', 'Reciclaste 7 días seguidos.', 'Reciclá 7 días seguidos.', rachaDias, 7),
    logro(
      'titular',
      'Titular de la hinchada',
      'Estás entre los 5 que más aportan al banco.',
      'Entrá entre los 5 que más aportan al banco.',
      puesto > 0 && puesto <= 5 ? 1 : 0,
      1,
    ),
    logro(
      'cancha',
      'Hincha de cancha',
      'Dejaste tapitas en el Estadio en día de partido.',
      'Dejá tapitas en el Punto R del Estadio en día de partido.',
      enElEstadio.some((c) => dia(c.createdAt) === dia(hoy.toISOString())) ? 1 : 0,
      1,
    ),
    logro('mil', '1.000 tapitas', 'Llevás 1.000 tapitas en el banco.', 'Llegá a 1.000 tapitas en el banco.', banco?.myContributionUnits ?? 0, 1000),
    logro(
      'partidos',
      'Tres partidos',
      'Aportaste en el Estadio en 3 partidos.',
      'Aportá en el Estadio en 3 partidos distintos.',
      new Set(enElEstadio.map((c) => dia(c.createdAt))).size,
      3,
    ),
  ]
}

/** Los logros que se ganaron entre un momento y otro: lo que festeja el aporte. */
export function logrosNuevos(antes: DatosDeLogros, despues: DatosDeLogros): Logro[] {
  const ganados = new Set(logrosDe(antes).filter((l) => l.ganado).map((l) => l.id))
  return logrosDe(despues).filter((l) => l.ganado && !ganados.has(l.id))
}
