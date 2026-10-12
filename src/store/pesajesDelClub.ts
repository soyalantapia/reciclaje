import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pesaje } from '@/lib/pesajes'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

const CLAVE = claveDeAlmacenamiento('pesajes-del-club')

interface PesajesState {
  /** Los pesajes que el club cargó desde el panel. El más nuevo, primero. */
  pesajes: Pesaje[]
  agregar: (p: Pesaje) => void
  quitar: (id: string) => void
}

export const usePesajesStore = create<PesajesState>()(
  persist(
    (set) => ({
      pesajes: [],
      agregar: (p) => set((s) => ({ pesajes: [p, ...s.pesajes] })),
      quitar: (id) => set((s) => ({ pesajes: s.pesajes.filter((p) => p.id !== id) })),
    }),
    { name: CLAVE, ...conVersionDeLosDatos<PesajesState>() },
  ),
)

// Como los productos: el panel carga el pesaje y la app del hincha, abierta en otra pestaña del
// mismo navegador, lo toma sin recargar.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) void usePesajesStore.persist.rehydrate()
  })
}
