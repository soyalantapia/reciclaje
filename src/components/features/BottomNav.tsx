import { NavLink } from 'react-router-dom'
import { Gift, Home, MapPin, QrCode, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/escanear', label: 'Escanear', icon: QrCode, center: true },
  { to: '/beneficios', label: 'Beneficios', icon: Gift },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md md:hidden">
      <div className="pb-safe border-t border-border bg-card/95 backdrop-blur-md">
        <ul className="grid grid-cols-5 items-end px-2 pt-1.5">
          {items.map(({ to, label, icon: Icon, end, center }) => (
            <li key={to} className="flex justify-center">
              <NavLink
                to={to}
                end={end}
                aria-label={label}
                className="group flex w-full flex-col items-center gap-0.5"
              >
                {({ isActive }) =>
                  center ? (
                    <span className="-mt-7 flex flex-col items-center">
                      <span
                        className={cn(
                          'grid h-14 w-14 place-items-center rounded-full bg-eco-600 text-white shadow-lg shadow-eco-600/40 ring-4 ring-card transition-transform active:scale-95',
                          isActive && 'bg-eco-700',
                        )}
                      >
                        <Icon size={24} strokeWidth={2.4} />
                      </span>
                      <span className="mt-0.5 text-[11px] font-semibold text-eco-700">
                        {label}
                      </span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors',
                        isActive ? 'text-eco-700' : 'text-muted-foreground',
                      )}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.6 : 2} />
                      {label}
                    </span>
                  )
                }
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
