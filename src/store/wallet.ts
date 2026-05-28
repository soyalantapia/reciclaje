import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { levelFor } from '@/lib/copy'

interface WalletState {
  userId: string | null
  reputationXp: number
  spendableXp: number
  streakDays: number
  level: number
  levelName: string
  /** Inicializa la wallet desde el user. Solo reseed si cambió de usuario. */
  hydrateFromUser: (user: User) => void
  /** Suma XP por un aporte: sube reputación (ranking) y saldo canjeable. */
  earn: (xp: number) => void
  /** Descuenta saldo canjeable. Devuelve false si no alcanza. */
  spend: (xp: number) => boolean
  reset: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      userId: null,
      reputationXp: 0,
      spendableXp: 0,
      streakDays: 0,
      level: 1,
      levelName: 'Semilla',
      hydrateFromUser: (user) => {
        // No pisar el saldo de un usuario que ya jugó la demo (refresh).
        if (get().userId === user.id) return
        const { level, name } = levelFor(user.reputationXp)
        set({
          userId: user.id,
          reputationXp: user.reputationXp,
          spendableXp: user.spendableXp,
          streakDays: user.streakDays,
          level,
          levelName: name,
        })
      },
      earn: (xp) =>
        set((s) => {
          const reputationXp = s.reputationXp + xp
          const { level, name } = levelFor(reputationXp)
          return {
            reputationXp,
            spendableXp: s.spendableXp + xp,
            level,
            levelName: name,
          }
        }),
      spend: (xp) => {
        if (get().spendableXp < xp) return false
        set((s) => ({ spendableXp: s.spendableXp - xp }))
        return true
      },
      reset: () =>
        set({
          userId: null,
          reputationXp: 0,
          spendableXp: 0,
          streakDays: 0,
          level: 1,
          levelName: 'Semilla',
        }),
    }),
    { name: 'reciclaxp-wallet', version: 1 },
  ),
)
