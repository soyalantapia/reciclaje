import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Coins, Flame, Trophy } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { formatNumber } from '@/lib/utils'
import { Logo } from './Logo'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

export function AppLayout() {
  const navigate = useNavigate()
  const spendableXp = useWalletStore((s) => s.spendableXp)
  const streakDays = useWalletStore((s) => s.streakDays)

  // Si llegamos por un QR (deep-link ?p=), el punto quedó pendiente: vamos al escáner.
  useEffect(() => {
    if (sessionStorage.getItem('reciclaxp-scan-point')) navigate('/escanear')
  }, [navigate])

  return (
    <div className="min-h-dvh bg-background md:flex">
      {/* Navegación lateral (tablet/desktop) */}
      <SideNav className="hidden md:flex" />

      {/* Columna de contenido */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Header mobile (en md+ los controles viven en la sidebar) */}
        <header className="pt-safe sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => navigate('/')} aria-label="Ir al inicio">
              <Logo />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-xp-100 px-2.5 py-1 text-xs font-bold text-xp-700 dark:bg-xp-700/20 dark:text-xp-300">
                <Flame size={14} /> {streakDays} días
              </span>
              <button
                onClick={() => navigate('/beneficios')}
                aria-label="Ver mis XP canjeables"
                className="inline-flex items-center gap-1.5 rounded-full bg-eco-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-sm transition active:scale-95"
              >
                <Coins size={15} /> {formatNumber(spendableXp)}
              </button>
              <button
                onClick={() => navigate('/ranking')}
                aria-label="Ver ranking"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Trophy size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-3 md:px-8 md:pb-12 md:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Tab bar (solo mobile) */}
      <BottomNav />
    </div>
  )
}
