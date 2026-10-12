import type { RecyclePoint, TraceEvent } from '@/types'
import { TAPITAS_POR_KILO } from './metrics'

/**
 * El pesaje del partido (E1.4 del piloto): al cierre de cada partido, el personal del club pesa lo
 * juntado en un Punto R y lo carga en el panel. Es «lo que sigue» del recorrido de la tapita. En la
 * demo vive en el navegador (`src/store/pesajesDelClub.ts`); en el piloto, en el servidor.
 */
export interface Pesaje {
  id: string
  partido: string
  /** Día del partido, `AAAA-MM-DD`. */
  fecha: string
  puntoId: string
  puntoNombre: string
  kilos: number
  /** Los kilos en tapitas, con la cuenta del panel (`TAPITAS_POR_KILO`). */
  tapitas: number
  /** Cuándo se cargó (ISO). */
  creadoEn: string
}

export interface NuevoPesaje {
  id: string
  partido: string
  fecha: string
  punto: RecyclePoint
  kilos: number
  creadoEn: string
}

/**
 * Los kilos como los escribe alguien de acá: coma decimal y punto de miles («12,5», «1.250», «1.250,5»).
 * Un punto con uno o dos decimales («12.5») se toma como decimal. Lo que no es un número da NaN.
 */
export function leerKilos(texto: string): number {
  const t = texto.trim()
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'))
  return t === '' ? NaN : Number(t.replace(',', '.'))
}

/** Más de 5 toneladas en un partido es un error de tipeo, no un pesaje. */
const MAXIMO_KG = 5000

export function kilosValidos(kilos: number): boolean {
  return Number.isFinite(kilos) && kilos > 0 && kilos <= MAXIMO_KG
}

export function crearPesaje(n: NuevoPesaje): Pesaje {
  return {
    id: n.id,
    partido: n.partido.trim(),
    fecha: n.fecha,
    puntoId: n.punto.id,
    puntoNombre: n.punto.name,
    kilos: n.kilos,
    tapitas: Math.round(n.kilos * TAPITAS_POR_KILO),
    creadoEn: n.creadoEn,
  }
}

/** Del partido más nuevo al más viejo; en el mismo día, el último cargado primero. */
export function pesajesDelInforme(pesajes: Pesaje[]): Pesaje[] {
  return [...pesajes].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn))
}

const kilosEnTexto = (kilos: number) => kilos.toLocaleString('es-AR', { maximumFractionDigits: 1 })

/** Dónde y cuándo dejaste tu tapita en esta sesión: el pesaje que la pesó es de ese punto y de ese día o después. */
export interface TuTapita {
  puntoId: string
  /** `AAAA-MM-DD`, en hora local. */
  fecha: string
}

/**
 * El recorrido con el pesaje del club: si hay uno en los Punto R del producto, «Pesaje del lote»
 * queda hecho con el más nuevo, y lo que sigue pasa a ser el lote. Sin pesaje, devuelve el mismo.
 *
 * Sólo si tu tapita ya entró al recorrido («Tu aporte» hecho). Con tu aporte de la sesión (`tuTapita`),
 * sólo cuenta un pesaje de ese Punto R y de ese día o después: antes, un pesaje en otro punto, o en un
 * producto al que no aportaste, mostraba «Tu tapita va por: pesaje del lote».
 */
export function conPesajeEnLaTraza(
  traza: TraceEvent[],
  pesajes: Pesaje[],
  puntoIds: string[],
  club: string,
  tuTapita?: TuTapita,
): TraceEvent[] {
  if (!traza.some((e) => e.stage === 'aporte' && e.done)) return traza
  const candidatos = pesajes.filter(
    (p) => puntoIds.includes(p.puntoId) && (!tuTapita || (p.puntoId === tuTapita.puntoId && p.fecha >= tuTapita.fecha)),
  )
  const ultimo = pesajesDelInforme(candidatos)[0]
  if (!ultimo) return traza
  return traza.map((e) =>
    e.stage === 'validacion'
      ? {
          ...e,
          done: true,
          date: ultimo.fecha,
          operator: club,
          detail: `${club} pesó ${kilosEnTexto(ultimo.kilos)} kg en el ${ultimo.puntoNombre} (${ultimo.partido}).`,
        }
      : e,
  )
}
