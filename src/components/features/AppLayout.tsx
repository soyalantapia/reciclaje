import { Outlet, useNavigate } from 'react-router-dom'
import { Coins, Flame, Moon, Sun } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { useUiStore } from '@/store/ui'
import { formatNumber } from '@/lib/utils'
import { Logo } from './Logo'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  const navigate = useNavigate()
  const spendableXp = useWalletStore((s) => s.spendableXp)
  const streakDays = useWalletStore((s) => s.streakDays)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <header className="pt-safe sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} aria-label="Ir al inicio">
            <Logo />
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-xp-100 px-2.5 py-1 text-xs font-bold text-xp-700">
              <Flame size={14} /> {streakDays}
            </span>
            <button
              onClick={() => navigate('/beneficios')}
              className="inline-flex items-center gap-1.5 rounded-full bg-eco-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-sm transition active:scale-95"
            >
              <Coins size={15} /> {formatNumber(spendableXp)}
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-3">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
