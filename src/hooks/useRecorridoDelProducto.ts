import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { conAporteDeLaSesionEnLaTraza } from '@/lib/aportesDeLaSesion'
import { conPesajeEnLaTraza } from '@/lib/pesajes'
import { puntosDelProducto } from '@/lib/productosDelClub'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { usePesajesStore } from '@/store/pesajesDelClub'
import type { ImpactProject, TraceEvent } from '@/types'

/**
 * El recorrido de un producto como lo ve el hincha: con su último aporte de la sesión y, si el club ya
 * pesó en los Punto R del producto, con ese pesaje. Lo usan la trazabilidad y el inicio, para que los dos
 * digan lo mismo: el inicio no mostraba nada y quien cargaba un pesaje no sabía dónde verlo.
 */
export function useRecorridoDelProducto(project: ImpactProject | null | undefined, projectId: string) {
  const trazaDeLaApi = useApi(() => api.getProjectTrace(projectId), [projectId])
  const actividad = useActivityStore((s) => s.sessionContributions)
  const pesajes = usePesajesStore((s) => s.pesajes)
  const creados = useCommerceProductsStore((s) => s.creados)
  const { data: puntos } = useApi(() => api.getPoints(), [])
  const trace = trazaDeLaApi.data
  const eventos: TraceEvent[] | null =
    trace && project
      ? conPesajeEnLaTraza(
          conAporteDeLaSesionEnLaTraza(trace, project, actividad),
          pesajes,
          puntosDelProducto(project, puntos ?? [], creados).map((p) => p.id),
          project.sponsorName,
        )
      : trace
  return { ...trazaDeLaApi, eventos }
}
