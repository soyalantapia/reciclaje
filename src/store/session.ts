import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  setSession: (user: User) => void
  setPremium: (isPremium: boolean) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setSession: (user) => set({ user, isAuthenticated: true }),
      setPremium: (isPremium) =>
        set((s) => (s.user ? { user: { ...s.user, isPremium } } : s)),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'reciclaxp-session', version: 1 },
  ),
)
