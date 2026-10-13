import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { sincronizarEntrePestanas } from './sincronizar'

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

// La app y el panel van en dos pestañas del mismo navegador: lo que escribe una, la otra lo toma sin recargar.
sincronizarEntrePestanas(useSonidoStore)
