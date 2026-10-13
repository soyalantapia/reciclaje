import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sponsor, User } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'
import { sincronizarEntrePestanas } from './sincronizar'

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
    { name: claveDeAlmacenamiento('session'), ...conVersionDeLosDatos<SessionState>() },
  ),
)

// También la sesión: si el panel se abre antes que la app, el panel tiene que saber quién entró a la app en la otra
// pestaña (si no, mostraba «Un hincha dejó 50 tapitas» y a Camila con 640 tapitas mientras la app decía 690). Las
// rutas sólo miran `isAuthenticated` (app) y `commerce` (panel), así que una pestaña no echa a la otra.
sincronizarEntrePestanas(useSessionStore)
