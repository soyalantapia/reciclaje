import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { logrosDe, type DatosDeLogros } from '@/lib/logros'
import { useActivityStore } from '@/store/activity'
import { useSessionStore } from '@/store/session'
import { useWalletStore } from '@/store/wallet'

/** Lo que miran los logros: el historial, los aportes de la sesión, la racha y el banco de la hinchada. */
export function useDatosDeLogros(): DatosDeLogros | null {
  const { data: historial } = useApi(() => api.getContributions(), [])
  const { data: proyectos } = useApi(() => api.getProjects(), [])
  const sesion = useActivityStore((s) => s.sessionContributions)
  const rachaDias = useWalletStore((s) => s.streakDays)
  const nombre = useSessionStore((s) => s.user?.name)
  if (!historial) return null
  const banco = proyectos?.find((p) => p.illustration === 'bench')
  return {
    historial,
    sesion,
    rachaDias,
    banco: banco && conAportesDeLaSesion(banco, sesion, nombre),
    nombre,
  }
}

export function useLogros() {
  const datos = useDatosDeLogros()
  return datos ? logrosDe(datos) : null
}
