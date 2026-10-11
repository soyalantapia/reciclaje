import { useMemo } from 'react'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCouponsStore } from '@/store/coupons'
import { metricsFor } from '@/lib/metrics'
import { metricasConLaSesion } from '@/lib/aportesDeLaSesion'
import { usePuntosDelPanel } from './usePuntosDelPanel'

/**
 * Las métricas del panel con lo que la comunidad hizo en esta sesión (mismo navegador): aportes,
 * XP y canjes. Las usan el resumen, los reportes y el informe, así los tres dicen lo mismo; antes
 * la cuenta estaba copiada en cada pantalla. Los puntos que devuelve incluyen el del alta.
 */
export function useMetricasDelPanel() {
  const commerce = useSessionStore((s) => s.commerce)
  const { points, loading, error, reload } = usePuntosDelPanel()
  const actividad = useActivityStore((s) => s.sessionContributions)
  const cupones = useCouponsStore((s) => s.coupons)

  const m = useMemo(() => {
    if (!commerce || !points) return null
    return metricasConLaSesion(metricsFor(commerce, points), actividad, cupones)
  }, [commerce, points, actividad, cupones])

  return { m, points, loading, error, reload }
}
