/**
 * El puesto de un comercio o una institución en la red, por Huella Verde. Antes el panel decía
 * «Top 12% de la red» a cualquiera, mientras «Marcas de la red» mostraba al club último.
 */
export interface Posicion {
  puesto: number
  total: number
  /** El que está inmediatamente arriba, y a cuántos puntos. El primero no tiene. */
  siguiente?: { nombre: string; diferencia: number }
}

interface MiembroDeLaRed {
  id: string
  name: string
  greenScore: number
}

export function posicionEnLaRed(id: string, huella: number, red: MiembroDeLaRed[]): Posicion {
  const otros = red.filter((m) => m.id !== id)
  const arriba = otros.filter((m) => m.greenScore > huella).sort((a, b) => a.greenScore - b.greenScore)
  const posicion: Posicion = { puesto: arriba.length + 1, total: otros.length + 1 }
  if (arriba.length) {
    posicion.siguiente = { nombre: arriba[0].name, diferencia: arriba[0].greenScore - huella }
  }
  return posicion
}

export function textoDePosicion(p: Posicion): string {
  if (!p.siguiente) return 'Primer puesto de la red 🌎'
  return `Puesto ${p.puesto} de ${p.total} en la red · a ${p.siguiente.diferencia} puntos de ${p.siguiente.nombre}`
}

/**
 * ¿Se muestra el puesto en la red? A una institución no: su Huella Verde no compite con la de un comercio,
 * y en la demo dejaba a Talleres «Puesto 8 de 8» en el informe para su Comisión Directiva (decidido por
 * Alan el 12/10/2026).
 */
export function muestraPuestoEnLaRed(sponsor: { category: string }): boolean {
  return sponsor.category !== 'club'
}
