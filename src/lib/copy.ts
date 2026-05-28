export const ERRORS = {
  network: 'No pudimos conectar. Revisá tu conexión e intentá de nuevo.',
  notFound: 'No encontramos lo que buscabas.',
  serverError: 'Algo salió mal de nuestro lado. Probá de nuevo en un rato.',
  unauthorized: 'Necesitás iniciar sesión para continuar.',
  forbidden: 'No tenés permisos para esto.',
  unknown: 'Ocurrió un error inesperado.',
  insufficientXp: 'No te alcanzan los XP canjeables para este beneficio.',
} as const

/** Umbrales de nivel por XP de reputación. */
export const LEVELS: { min: number; name: string }[] = [
  { min: 0, name: 'Semilla' },
  { min: 1500, name: 'Brote' },
  { min: 4000, name: 'Reciclador' },
  { min: 9000, name: 'Reciclador Pro' },
  { min: 18000, name: 'Guardián Circular' },
  { min: 35000, name: 'Leyenda Eco' },
]

export function levelFor(reputationXp: number): { level: number; name: string } {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (reputationXp >= LEVELS[i].min) idx = i
  }
  return { level: idx + 1, name: LEVELS[idx].name }
}

/** XP que faltan para el próximo nivel (0 si está en el máximo). */
export function xpToNextLevel(reputationXp: number): number {
  const next = LEVELS.find((l) => l.min > reputationXp)
  return next ? next.min - reputationXp : 0
}
