import type { MaterialType, RecyclePoint } from '@/types'

/**
 * La lógica del mapa de Córdoba, sin Leaflet: filtros, distancias, orden y enlaces. La pantalla y el
 * componente del mapa la usan; se prueba sola.
 */

/** Un lugar en el mapa, en grados. */
export interface Lugar {
  lat: number
  lng: number
}

/** Un recuadro: [[sur, oeste], [norte, este]], como lo pide Leaflet. */
export type Recuadro = [[number, number], [number, number]]

/** El Centro y Nueva Córdoba: la vista con que abre el mapa. */
export const CENTRO_Y_NUEVA_CORDOBA: Recuadro = [
  [-31.4325, -64.1945],
  [-31.4065, -64.1735],
]

/** El centro de Córdoba (Plaza San Martín): para saber si una ubicación queda en la ciudad. */
export const CENTRO_DE_CORDOBA: Lugar = { lat: -31.416736, lng: -64.183581 }

/** Más lejos que esto del centro, la ubicación no es de Córdoba: no se mueve el mapa. */
export const RADIO_DE_CORDOBA_KM = 50

/** La distancia entre dos lugares sobre la Tierra (fórmula de Haversine), en kilómetros. */
export function distanciaKm(a: Lugar, b: Lugar): number {
  const radio = 6371
  const rad = (grados: number) => (grados * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * radio * Math.asin(Math.sqrt(h))
}

/** «a 350 m» por debajo del kilómetro (a la decena, desde 10 m); «a 1,2 km» desde ahí. */
export function textoDeDistancia(km: number): string {
  if (km < 1) return `a ${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`
  return `a ${km.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

/** Los chips de arriba del mapa. */
export interface Filtros {
  abiertos: boolean
  material: MaterialType | null
}

export function filtrarPuntos(puntos: RecyclePoint[], filtros: Filtros): RecyclePoint[] {
  return puntos.filter(
    (p) => (!filtros.abiertos || p.openNow) && (!filtros.material || p.acceptedMaterials.includes(filtros.material)),
  )
}

/** Los materiales que recibe la red, sin repetir y en el orden en que aparecen: un chip por cada uno. */
export function materialesDeLaRed(puntos: RecyclePoint[]): MaterialType[] {
  return [...new Set(puntos.flatMap((p) => p.acceptedMaterials))]
}

/** Primero los abiertos; con una ubicación, del más cercano al más lejano. No toca la lista que recibe. */
export function ordenarPuntos(puntos: RecyclePoint[], desde?: Lugar | null): RecyclePoint[] {
  return [...puntos].sort((a, b) => {
    if (a.openNow !== b.openNow) return a.openNow ? -1 : 1
    return desde ? distanciaKm(desde, a) - distanciaKm(desde, b) : 0
  })
}

/** «Cómo llegar»: Google Maps con el destino, para abrir en otra pestaña o en la app del teléfono. */
export function enlaceComoLlegar(lugar: Lugar): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`
}

export function estaEnCordoba(lugar: Lugar): boolean {
  return distanciaKm(lugar, CENTRO_DE_CORDOBA) <= RADIO_DE_CORDOBA_KM
}

/** El recuadro que encierra todos los lugares («Ver todos»); sin lugares, null. */
export function recuadroDe(lugares: Lugar[]): Recuadro | null {
  if (!lugares.length) return null
  const lats = lugares.map((l) => l.lat)
  const lngs = lugares.map((l) => l.lng)
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}
