import type { Benefit } from '@/types'

/**
 * Los beneficios que ve el hincha: los del simulador más los que el comercio o el club publicó en su
 * panel (primero), sin los pausados. Los del panel viven en el navegador
 * (`src/store/commerceBenefits.ts`). Antes el panel decía «Beneficio publicado» y la app del hincha
 * no lo mostraba, y pausar uno en el panel no lo sacaba de la app.
 */
export function beneficiosDeLaRed(seeded: Benefit[], creados: Benefit[], pausados: string[]): Benefit[] {
  return [...creados, ...seeded].filter((b) => !pausados.includes(b.id))
}

/** Un beneficio por id, entre los del simulador y los creados en el panel (para canjearlo). */
export function buscarBeneficio(id: string, seeded: Benefit[], creados: Benefit[]): Benefit | undefined {
  return seeded.find((b) => b.id === id) ?? creados.find((b) => b.id === id)
}
