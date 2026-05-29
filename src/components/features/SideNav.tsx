import { NavLink, useNavigate } from 'react-router-dom'
import { Coins, Flame, Gift, Heart, Home, MapPin, QrCode, Store, Trophy, User } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { cn, formatNumber } from '@/lib/utils'
import { Logo } from './Logo'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/escanear', label: 'Escanear', icon: QrCode },
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/beneficios', label: 'Beneficios', icon: Gift },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/causas', label: 'Causas', icon: Heart },
  { to: '/marcas', label: 'Marcas', icon: Store },
  { to: '/perfil', label: 'Perfil', icon: User },
]

/**
 * Navegación lateral para tablet/desktop (md+). En mobile se usa BottomNav.
 */
export function SideNav({ className }: { className?: string }) {
  const navigate = useNavigate()
  const spendableXp = useWalletStore((s) => s.spendableXp)
  const streakDays = useWalletStore((s) => s.streakDays)

  return (
    <aside
      className={cn(
        'pt-safe sticky top-0 h-dvh w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-card/40 px-3 pb-4',
        className,
      )}
    >
      <button
        onClick={() => navigate('/')}
        aria-label="Ir al inicio"
        className="flex items-center px-2 py-5"
      >
        <Logo />
      </button>

      {/* XP + racha */}
      <div className="mb-3 grid gap-1.5">
        <button
          onClick={() => navigate('/beneficios')}
          className="flex items-center justify-between rounded-xl bg-eco-600 px-3 py-2.5 text-white transition active:scale-[0.98]"
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Coins size={16} /> XP canjeable
          </span>
          <span className="font-extrabold">{formatNumber(spendableXp)}</span>
        </button>
        <div className="flex items-center gap-1.5 rounded-xl bg-xp-100 px-3 py-1.5 text-xs font-bold text-xp-700 dark:bg-xp-700/20 dark:text-xp-300">
          <Flame size={14} /> {streakDays} días de racha
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-eco-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={20} strokeWidth={2.2} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
