/**
 * Escenario de la demo, elegido al compilar con `VITE_ESCENARIO`.
 *
 * - `general`: la demo de siempre (la publicada en GitHub Pages). Sin la variable, es esta.
 * - `club`: el caso de un club para el piloto. Cambia el club de ejemplo por "el club",
 *   con sus Punto R, su producto con meta, el ranking de la hinchada y sus recompensas.
 *
 * El club es Talleres: Alan decidió el 10/10/2026 que las demos lo nombren. `VITE_CLUB_NOMBRE` lo
 * pisa para mostrarle la demo a otro club. El escudo y los colores del club NO se publican sin su
 * permiso escrito (es una de las preguntas de la reunión). Alan decidió el 12/10/2026 mostrar el escudo y el azul de
 * Talleres en la demo para la reunión (src/lib/logos.ts).
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
  nombre: texto(import.meta.env.VITE_CLUB_NOMBRE, 'Talleres'),
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

/**
 * Las pestañas del ranking de cada escenario. `sponsorId` es la sede de la pestaña, para sumarle
 * sólo el XP ganado ahí (el global no tiene).
 */
/**
 * El nombre de ejemplo de la estación de servicio en la demo del club: ahí las marcas reales de la
 * demo general (YPF, Coca-Cola…) van con nombres de ejemplo (ver `src/services/mocks/escenarioClub.ts`).
 */
export const ESTACION_DE_EJEMPLO = 'Norte Energía'

export function pestanasDelRanking(escenario: Escenario = ESCENARIO): { value: string; label: string; sponsorId?: string }[] {
  return escenario === 'club'
    ? [
        { value: 'global', label: 'Global' },
        { value: 'club', label: 'Hinchada', sponsorId: 's_club' },
        { value: 'ypf', label: ESTACION_DE_EJEMPLO, sponsorId: 's_ypf' },
      ]
    : [
        { value: 'global', label: 'Global' },
        { value: 'talleres', label: 'Talleres', sponsorId: 's_talleres' },
        { value: 'ypf', label: 'YPF', sponsorId: 's_ypf' },
      ]
}

export const RANKING_TABS = pestanasDelRanking()

/** Comercio al que entra la cuenta de prueba principal del panel. */
export const SLUG_COMERCIO_DEMO = ESCENARIO === 'club' ? 'club' : 'mcdonalds'

/**
 * La demo del club no muestra precios de lista: el club tiene un plan aparte, que sale de la
 * propuesta (decidido el 10/10/2026, antes de cerrar la tabla de precios). La demo general sí.
 */
export function muestraPrecios(escenario: Escenario = ESCENARIO): boolean {
  return escenario !== 'club'
}

/** El precio de un plan, o «A convenir» donde la demo no muestra precios. */
export function precioVisible(precio: string, escenario: Escenario = ESCENARIO): string {
  return muestraPrecios(escenario) ? precio : 'A convenir'
}
