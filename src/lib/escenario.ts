/**
 * Escenario de la demo, elegido al compilar con `VITE_ESCENARIO`.
 *
 * - `general`: la demo de siempre (la publicada en GitHub Pages). Sin la variable, es esta.
 * - `club`: el caso de un club para el piloto. Cambia el club de ejemplo por "el club",
 *   con sus Punto R, su producto con meta, el ranking de la hinchada y sus recompensas.
 *
 * El nombre real del club va en `VITE_CLUB_NOMBRE` dentro de `.env.local` (fuera del repo,
 * que es público): sin permiso escrito del club, su nombre, escudo y colores no se publican.
 */
export type Escenario = 'general' | 'club'

export function leerEscenario(valor: unknown): Escenario {
  return valor === 'club' ? 'club' : 'general'
}

export const ESCENARIO: Escenario = leerEscenario(import.meta.env.VITE_ESCENARIO)

function texto(valor: unknown, porDefecto: string): string {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : porDefecto
}

export interface DatosDelClub {
  nombre: string
  estadio: string
  sede: string
}

export const CLUB: DatosDelClub = {
  nombre: texto(import.meta.env.VITE_CLUB_NOMBRE, 'Tu club'),
  estadio: texto(import.meta.env.VITE_CLUB_ESTADIO, 'Estadio'),
  sede: texto(import.meta.env.VITE_CLUB_SEDE, 'Sede social'),
}

/**
 * Clave de localStorage/sessionStorage. El escenario club usa las suyas: si se abre en el
 * mismo navegador que la demo publicada, no le pisa ni le rompe el estado guardado.
 */
export function claveDeAlmacenamiento(nombre: string, escenario: Escenario = ESCENARIO): string {
  return escenario === 'club' ? `reciclaxp-club-${nombre}` : `reciclaxp-${nombre}`
}

/** Pestañas del ranking: en el club, la de la hinchada reemplaza a la del club de ejemplo. */
export const RANKING_TABS: { value: string; label: string }[] =
  ESCENARIO === 'club'
    ? [
        { value: 'global', label: 'Global' },
        { value: 'club', label: 'Hinchada' },
        { value: 'ypf', label: 'YPF' },
      ]
    : [
        { value: 'global', label: 'Global' },
        { value: 'river', label: 'River' },
        { value: 'ypf', label: 'YPF' },
      ]

/** Comercio al que entra la cuenta de prueba principal del panel. */
export const SLUG_COMERCIO_DEMO = ESCENARIO === 'club' ? 'club' : 'mcdonalds'
