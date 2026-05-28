import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityItem } from '@/types'

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
    { name: 'reciclaxp-activity', version: 1 },
  ),
)
