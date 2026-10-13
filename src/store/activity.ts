import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityItem } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'
import { sincronizarEntrePestanas } from './sincronizar'

interface ActivityState {
  /** Actividad de la sesión (aportes reciclados y compras), se antepone al historial. */
  sessionContributions: ActivityItem[]
  add: (c: ActivityItem) => void
  clear: () => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      sessionContributions: [],
      add: (c) =>
        set((s) => ({ sessionContributions: [c, ...s.sessionContributions] })),
      clear: () => set({ sessionContributions: [] }),
    }),
    { name: claveDeAlmacenamiento('activity'), ...conVersionDeLosDatos<ActivityState>() },
  ),
)

// La app y el panel van en dos pestañas del mismo navegador: lo que escribe una, la otra lo toma sin recargar.
sincronizarEntrePestanas(useActivityStore)
