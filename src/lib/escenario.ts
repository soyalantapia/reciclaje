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
/**
 * Las pestañas del ranking de cada escenario. `sponsorId` es la sede de la pestaña, para sumarle
 * sólo el XP ganado ahí (el global no tiene).
 */
export function pestanasDelRanking(escenario: Escenario = ESCENARIO): { value: string; label: string; sponsorId?: string }[] {
  return escenario === 'club'
    ? [
        { value: 'global', label: 'Global' },
        { value: 'club', label: 'Hinchada', sponsorId: 's_club' },
        { value: 'ypf', label: 'YPF', sponsorId: 's_ypf' },
      ]
    : [
        { value: 'global', label: 'Global' },
        { value: 'river', label: 'River', sponsorId: 's_river' },
        { value: 'ypf', label: 'YPF', sponsorId: 's_ypf' },
      ]
}

export const RANKING_TABS = pestanasDelRanking()

/** Comercio al que entra la cuenta de prueba principal del panel. */
export const SLUG_COMERCIO_DEMO = ESCENARIO === 'club' ? 'club' : 'mcdonalds'
