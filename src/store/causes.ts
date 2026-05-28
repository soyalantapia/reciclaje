import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CausesState {
  /** XP que el usuario donó a cada causa (causeId → puntos). */
  donatedByCause: Record<string, number>
  donate: (causeId: string, points: number) => void
  clear: () => void
}

export const useCausesStore = create<CausesState>()(
  persist(
    (set) => ({
      donatedByCause: {},
      donate: (causeId, points) =>
        set((s) => ({
          donatedByCause: {
            ...s.donatedByCause,
            [causeId]: (s.donatedByCause[causeId] ?? 0) + points,
          },
        })),
      clear: () => set({ donatedByCause: {} }),
    }),
    { name: 'reciclaxp-causes', version: 1 },
  ),
)
