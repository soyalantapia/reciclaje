import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

interface CommerceCampaignsState {
  /** Campañas creadas en el panel. */
  campaigns: Campaign[]
  /** Premios del simulador pausados desde el panel (ver `idDelPremio`). */
  pausedIds: string[]
  add: (c: Campaign) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  togglePause: (id: string) => void
}

export const useCommerceCampaignsStore = create<CommerceCampaignsState>()(
  persist(
    (set) => ({
      campaigns: [],
      pausedIds: [],
      add: (c) => set((s) => ({ campaigns: [c, ...s.campaigns] })),
      remove: (id) => set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
      toggle: (id) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c,
          ),
        })),
      togglePause: (id) =>
        set((s) => ({
          pausedIds: s.pausedIds.includes(id)
            ? s.pausedIds.filter((p) => p !== id)
            : [...s.pausedIds, id],
        })),
    }),
    { name: claveDeAlmacenamiento('commerce-campaigns'), ...conVersionDeLosDatos<CommerceCampaignsState>() },
  ),
)
