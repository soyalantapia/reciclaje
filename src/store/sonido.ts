import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { claveDeAlmacenamiento } from '@/lib/escenario'

interface SonidoState {
  /** Si el festejo suena. Arranca prendido; se apaga en el festejo o en el perfil. */
  activo: boolean
  alternar: () => void
}

export const useSonidoStore = create<SonidoState>()(
  persist(
    (set) => ({
      activo: true,
      alternar: () => set((s) => ({ activo: !s.activo })),
    }),
    { name: claveDeAlmacenamiento('sonido'), version: 1 },
  ),
)
