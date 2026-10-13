import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { sincronizarEntrePestanas } from './sincronizar'

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
    { name: claveDeAlmacenamiento('causes'), version: 1 },
  ),
)

// La app y el panel van en dos pestañas del mismo navegador: lo que escribe una, la otra lo toma sin recargar.
sincronizarEntrePestanas(useCausesStore)
