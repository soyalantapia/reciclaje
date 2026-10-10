import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Coupon } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'

interface CouponsState {
  coupons: Coupon[]
  add: (coupon: Coupon) => void
  clear: () => void
}

export const useCouponsStore = create<CouponsState>()(
  persist(
    (set) => ({
      coupons: [],
      add: (coupon) => set((s) => ({ coupons: [coupon, ...s.coupons] })),
      clear: () => set({ coupons: [] }),
    }),
    { name: claveDeAlmacenamiento('coupons'), version: 1 },
  ),
)
