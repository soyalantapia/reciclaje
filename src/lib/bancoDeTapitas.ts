/** Cómo se ve cada tapita del dibujo del banco. */
export type EstadoTapita = 'vacia' | 'hinchada' | 'tuya'

/** El respaldo del banco: 16 columnas por 5 filas de tapitas. */
export const COLUMNAS_DEL_BANCO = 16
export const FILAS_DEL_BANCO = 5
export const TAPITAS_DEL_BANCO = COLUMNAS_DEL_BANCO * FILAS_DEL_BANCO

/**
 * Cuántas tapitas del dibujo se encienden para un avance entre 0 y 1. Con algo de avance se
 * enciende al menos una: un proyecto que arrancó no se ve vacío por redondeo.
 */
export function tapitasEncendidas(progreso: number, total: number): number {
  if (!(progreso > 0)) return 0
  if (progreso >= 1) return total
  return Math.min(total, Math.max(1, Math.round(progreso * total)))
}

/**
 * El estado de cada tapita, en orden de llenado (de abajo hacia arriba, de izquierda a derecha).
 * `propias` es la parte del avance que aportó la persona, entre 0 y 1. Las suyas son las últimas
 * encendidas: quedan arriba, a la vista, y si aportó algo tiene al menos una.
 */
export function estadosDelBanco({
  total,
  progreso,
  propias,
}: {
  total: number
  progreso: number
  propias: number
}): EstadoTapita[] {
  const encendidas = tapitasEncendidas(progreso, total)
  const tuyas =
    encendidas === 0 || !(propias > 0)
      ? 0
      : Math.min(encendidas, Math.max(1, Math.round(propias * encendidas)))
  return Array.from({ length: total }, (_, i) =>
    i >= encendidas ? 'vacia' : i >= encendidas - tuyas ? 'tuya' : 'hinchada',
  )
}
