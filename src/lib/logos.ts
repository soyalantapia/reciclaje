import { CLUB } from '@/lib/escenario'

/**
 * Los logos de la demo.
 *
 * - **Talleres** usa su escudo oficial (`public/clubes/talleres/escudo.svg`, de Wikimedia Commons:
 *   «Escudo Talleres 2015.svg», dominio público y marca registrada del club) y su azul. Alan decidió
 *   el 12/10/2026 mostrarlo en la demo para la reunión con el club. Si la demo se arma para otro club
 *   (`VITE_CLUB_NOMBRE`), el escudo de Talleres no aparece.
 * - **Las empresas de la red** llevan un logo hecho acá: su color y un ícono de su rubro. En la demo del
 *   club son nombres de ejemplo; en la general, marcas reales que no son aliadas: por eso nunca su logo real.
 */

/** El azul de Talleres para la paleta: el del escudo (#040D2D) es casi negro y no da tonos claros. */
export const AZUL_DE_TALLERES = '#0b2d6b'
const ESCUDO_DE_TALLERES = `${import.meta.env.BASE_URL}clubes/talleres/escudo.svg`

/** Los ids con que Talleres entra en cada demo: `s_club` en la del club, `s_talleres` en la general. */
const IDS_DE_TALLERES = new Set(['s_club', 's_talleres'])

/** ¿El club de la demo es Talleres? Con otro nombre (`VITE_CLUB_NOMBRE`), su escudo no va. */
export function esTalleres(nombre: string = CLUB.nombre): boolean {
  return nombre.trim().toLowerCase() === 'talleres'
}

/** La marca oficial de una institución, si la demo la trae: hoy sólo Talleres. */
export function marcaOficial(sponsor: { id: string; name: string }): { escudo: string; color: string } | null {
  return IDS_DE_TALLERES.has(sponsor.id) && esTalleres(sponsor.name) ? { escudo: ESCUDO_DE_TALLERES, color: AZUL_DE_TALLERES } : null
}

/** El rubro de cada empresa de la red, para el ícono de su logo. */
export type Rubro = 'combustible' | 'cafe' | 'bebida' | 'comida' | 'helado' | 'deporte' | 'municipio' | 'comercio'

const RUBRO_POR_ID: Record<string, Rubro> = {
  s_ypf: 'combustible',
  s_lumen: 'cafe',
  s_coca: 'bebida',
  s_mcdonalds: 'comida',
  s_starbucks: 'cafe',
  s_grido: 'helado',
  s_adidas: 'deporte',
  s_muni: 'municipio',
}

export function rubroDe(sponsorId: string): Rubro {
  return RUBRO_POR_ID[sponsorId] ?? 'comercio'
}

/** El escudo del club de la demo para la app del hincha: sólo en la demo del club y si el club es Talleres. */
export function escudoDeLaAppDelHincha(escenario: string, nombre: string = CLUB.nombre): string | undefined {
  return escenario === 'club' && esTalleres(nombre) ? ESCUDO_DE_TALLERES : undefined
}
