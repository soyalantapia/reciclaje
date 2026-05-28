import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sponsor, User } from '@/types'

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  /** Identidad de comercio (B2B). Independiente de la sesión de usuario. */
  commerce: Sponsor | null
  setSession: (user: User) => void
  setPremium: (isPremium: boolean) => void
  loginAsCommerce: (commerce: Sponsor) => void
  logoutCommerce: () => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      commerce: null,
      setSession: (user) => set({ user, isAuthenticated: true }),
      setPremium: (isPremium) =>
        set((s) => (s.user ? { user: { ...s.user, isPremium } } : s)),
      loginAsCommerce: (commerce) => set({ commerce }),
      logoutCommerce: () => set({ commerce: null }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'reciclaxp-session', version: 1 },
  ),
)
