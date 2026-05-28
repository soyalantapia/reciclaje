import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Benefit } from '@/types'

interface CommerceBenefitsState {
  /** Beneficios creados por el comercio (se suman a los del seed). */
  created: Benefit[]
  /** Ids de beneficios pausados (creados o del seed). */
  pausedIds: string[]
  add: (b: Benefit) => void
  remove: (id: string) => void
  togglePause: (id: string) => void
}

export const useCommerceBenefitsStore = create<CommerceBenefitsState>()(
  persist(
    (set) => ({
      created: [],
      pausedIds: [],
      add: (b) => set((s) => ({ created: [b, ...s.created] })),
      remove: (id) =>
        set((s) => ({
          created: s.created.filter((b) => b.id !== id),
          pausedIds: s.pausedIds.filter((p) => p !== id),
        })),
      togglePause: (id) =>
        set((s) => ({
          pausedIds: s.pausedIds.includes(id)
            ? s.pausedIds.filter((p) => p !== id)
            : [...s.pausedIds, id],
        })),
    }),
    { name: 'reciclaxp-commerce-benefits', version: 1 },
  ),
)
