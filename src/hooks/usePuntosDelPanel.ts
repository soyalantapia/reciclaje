import { useMemo } from 'react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useCreatedCommerceStore } from '@/store/createdCommerce'

/**
 * Los Punto R que ve el panel: los del simulador más el que se creó en el alta, si es de quien
 * entró. Un club dado de alta en vivo no tiene puntos en el simulador: sin esto no podía publicar un
 * producto, y el informe decía que su producto no juntaba en ningún punto.
 */
export function usePuntosDelPanel() {
  const commerce = useSessionStore((s) => s.commerce)
  const createdCommerce = useCreatedCommerceStore((s) => s.commerce)
  const createdPoint = useCreatedCommerceStore((s) => s.point)
  const { data, loading, error, reload } = useApi(() => api.getPoints(), [])

  const points = useMemo(() => {
    if (!data) return null
    return commerce && createdCommerce?.id === commerce.id && createdPoint ? [...data, createdPoint] : data
  }, [data, commerce, createdCommerce, createdPoint])

  return { points, loading, error, reload }
}
