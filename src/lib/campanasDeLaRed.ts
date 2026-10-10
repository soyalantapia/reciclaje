import type { Campaign, MonthlyPrize } from '@/types'

/**
 * Campañas del panel y lo que la hinchada ve en el ranking. Es la gemela de `beneficiosDeLaRed`:
 * antes el panel decía «Todavía no lanzaste campañas» mientras la hinchada ya veía el premio del
 * club, y una campaña lanzada en el panel no le llegaba a nadie. Las campañas creadas en el panel
 * viven en el navegador (`src/store/commerceCampaigns.ts`), así que esto vale en el mismo
 * navegador; entre aparatos distintos hace falta el servidor del piloto.
 */

/** Id con el que el premio del simulador figura como campaña en el panel (y con el que se pausa). */
export const idDelPremio = (sponsorId: string) => `premio_${sponsorId}`

function premioComoCampana(premio: MonthlyPrize, pausadas: string[]): Campaign {
  const id = idDelPremio(premio.sponsorId)
  return {
    id,
    sponsorId: premio.sponsorId,
    kind: 'premio',
    title: premio.title,
    detail: premio.description,
    reward: premio.title,
    active: !pausadas.includes(id),
    createdAt: '',
  }
}

/** Lo que el panel lista: las campañas propias primero y, si lo tiene, el premio que ya ve la hinchada. */
export function campanasDelPanel(
  sponsorId: string,
  propias: Campaign[],
  premioDelSimulador: MonthlyPrize | undefined,
  pausadas: string[],
): Campaign[] {
  const mias = propias.filter((c) => c.sponsorId === sponsorId)
  return premioDelSimulador?.sponsorId === sponsorId
    ? [...mias, premioComoCampana(premioDelSimulador, pausadas)]
    : mias
}

/**
 * Lo que la hinchada ve en la pestaña del ranking de un sponsor: el premio del mes más reciente
 * lanzado en el panel (o, si no hay, el del simulador sin pausar) y los desafíos activos.
 * La pestaña global (`sponsorId` sin definir) queda como está.
 */
export function campanasParaLaHinchada(
  premioDelSimulador: MonthlyPrize,
  sponsorId: string | undefined,
  propias: Campaign[],
  pausadas: string[],
): { premio: MonthlyPrize | null; desafios: Campaign[] } {
  if (!sponsorId) return { premio: premioDelSimulador, desafios: [] }

  const activas = propias.filter((c) => c.sponsorId === sponsorId && c.active)
  const lanzado = activas.find((c) => c.kind === 'premio')
  const desafios = activas.filter((c) => c.kind === 'desafio')

  if (lanzado) {
    return {
      premio: {
        sponsorId,
        sponsorName: premioDelSimulador.sponsorName,
        title: lanzado.title,
        description: lanzado.reward !== lanzado.title ? `${lanzado.detail} · 🎁 ${lanzado.reward}` : lanzado.detail,
        emoji: '🏆',
      },
      desafios,
    }
  }
  const delSimulador =
    premioDelSimulador.sponsorId === sponsorId && !pausadas.includes(idDelPremio(sponsorId))
      ? premioDelSimulador
      : null
  return { premio: delSimulador, desafios }
}
