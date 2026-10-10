import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

interface CommerceCampaignsState {
  campaigns: Campaign[]
  add: (c: Campaign) => void
  remove: (id: string) => void
  toggle: (id: string) => void
}

export const useCommerceCampaignsStore = create<CommerceCampaignsState>()(
  persist(
    (set) => ({
      campaigns: [],
      add: (c) => set((s) => ({ campaigns: [c, ...s.campaigns] })),
      remove: (id) => set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
      toggle: (id) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c,
          ),
        })),
    }),
    { name: claveDeAlmacenamiento('commerce-campaigns'), ...conVersionDeLosDatos<CommerceCampaignsState>() },
  ),
)
