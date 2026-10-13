import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Coupon } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'
import { sincronizarEntrePestanas } from './sincronizar'

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
    { name: claveDeAlmacenamiento('coupons'), ...conVersionDeLosDatos<CouponsState>() },
  ),
)

// La app y el panel van en dos pestañas del mismo navegador: lo que escribe una, la otra lo toma sin recargar.
sincronizarEntrePestanas(useCouponsStore)
