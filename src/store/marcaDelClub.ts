import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

const CLAVE = claveDeAlmacenamiento('marca-del-club')

/** La marca que una institución cargó en su panel: su color y, si lo subió, su escudo (data URL PNG). */
export interface MarcaDelClub {
  color: string
  escudo?: string
}

interface MarcaDelClubState {
  /** Por id de la institución. Queda sólo en este navegador: no va al código ni se publica. */
  marcas: Record<string, MarcaDelClub>
  guardar: (sponsorId: string, marca: MarcaDelClub) => void
  quitar: (sponsorId: string) => void
}

export const useMarcaDelClubStore = create<MarcaDelClubState>()(
  persist(
    (set) => ({
      marcas: {},
      guardar: (sponsorId, marca) => set((s) => ({ marcas: { ...s.marcas, [sponsorId]: marca } })),
      quitar: (sponsorId) =>
        set((s) => ({ marcas: Object.fromEntries(Object.entries(s.marcas).filter(([id]) => id !== sponsorId)) })),
    }),
    { name: CLAVE, ...conVersionDeLosDatos<MarcaDelClubState>() },
  ),
)

// El panel suele estar abierto en más de una pestaña: lo que carga una, la otra lo toma sin recargar.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) void useMarcaDelClubStore.persist.rehydrate()
  })
}
