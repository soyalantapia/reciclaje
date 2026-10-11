import { useMemo } from 'react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { useActivityStore } from '@/store/activity'
import { useCouponsStore } from '@/store/coupons'
import { metricsFor } from '@/lib/metrics'
import { metricasConLaSesion } from '@/lib/aportesDeLaSesion'

/**
 * Las métricas del panel con lo que la comunidad hizo en esta sesión (mismo navegador): aportes,
 * XP y canjes. Las usan el resumen, los reportes y el informe, así los tres dicen lo mismo; antes
 * la cuenta estaba copiada en cada pantalla.
 */
export function useMetricasDelPanel() {
  const commerce = useSessionStore((s) => s.commerce)
  const createdCommerce = useCreatedCommerceStore((s) => s.commerce)
  const createdPoint = useCreatedCommerceStore((s) => s.point)
  const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])
  const actividad = useActivityStore((s) => s.sessionContributions)
  const cupones = useCouponsStore((s) => s.coupons)

  const m = useMemo(() => {
    if (!commerce || !points) return null
    const extra = createdCommerce?.id === commerce.id && createdPoint ? [createdPoint] : []
    return metricasConLaSesion(metricsFor(commerce, [...points, ...extra]), actividad, cupones)
  }, [commerce, points, createdCommerce, createdPoint, actividad, cupones])

  return { m, points, loading, error, reload }
}
