import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecyclePoint, Sponsor } from '@/types'

interface CreatedCommerceState {
  /** Comercio creado vía onboarding (no está en el seed). */
  commerce: Sponsor | null
  /** Primer punto configurado en el onboarding. */
  point: RecyclePoint | null
  plan: string
  set: (commerce: Sponsor, point: RecyclePoint, plan: string) => void
  clear: () => void
}

export const useCreatedCommerceStore = create<CreatedCommerceState>()(
  persist(
    (set) => ({
      commerce: null,
      point: null,
      plan: 'Pro',
      set: (commerce, point, plan) => set({ commerce, point, plan }),
      clear: () => set({ commerce: null, point: null, plan: 'Pro' }),
    }),
    { name: 'reciclaxp-created-commerce', version: 1 },
  ),
)
