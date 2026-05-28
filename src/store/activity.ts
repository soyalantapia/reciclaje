import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Contribution } from '@/types'

interface ActivityState {
  /** Aportes registrados durante la sesión (se anteponen al historial). */
  sessionContributions: Contribution[]
  add: (c: Contribution) => void
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
