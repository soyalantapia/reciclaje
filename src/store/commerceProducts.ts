import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ImpactProject } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

const CLAVE = claveDeAlmacenamiento('commerce-products')

interface CommerceProductsState {
  /** Productos que el club publicó desde el panel (se suman a los del seed). El más nuevo, primero. */
  creados: ImpactProject[]
  agregar: (p: ImpactProject) => void
  quitar: (id: string) => void
}

export const useCommerceProductsStore = create<CommerceProductsState>()(
  persist(
    (set) => ({
      creados: [],
      agregar: (p) => set((s) => ({ creados: [p, ...s.creados] })),
      quitar: (id) => set((s) => ({ creados: s.creados.filter((p) => p.id !== id) })),
    }),
    { name: CLAVE, ...conVersionDeLosDatos<CommerceProductsState>() },
  ),
)

// El panel y la app del hincha suelen estar en dos pestañas del mismo navegador: lo que publica
// una, la otra lo toma sin recargar.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) void useCommerceProductsStore.persist.rehydrate()
  })
}
