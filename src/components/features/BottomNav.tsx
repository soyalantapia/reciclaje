import { NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Gift, Home, MapPin, QrCode, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/escanear', label: 'Escanear', icon: QrCode, center: true },
  { to: '/beneficios', label: 'Beneficios', icon: Gift },
  { to: '/perfil', label: 'Perfil', icon: User },
]

/**
 * El ícono de la barra: al apretarlo se achica, y al quedar elegido rebota (sube y crece un poco, y
 * vuelve). Con «reducir movimiento» del sistema queda quieto.
 */
function IconoDeLaBarra({ icon: Icon, activo, centro }: { icon: LucideIcon; activo: boolean; centro?: boolean }) {
  const reducir = useReducedMotion()
  return (
    <motion.span
      data-icono
      className="inline-flex"
      animate={reducir ? undefined : activo ? { y: [0, -5, 0], scale: [1, 1.18, 1] } : { y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileTap={reducir ? undefined : { scale: centro ? 0.88 : 0.85 }}
    >
      <Icon size={centro ? 24 : 22} strokeWidth={centro ? 2.4 : activo ? 2.6 : 2} />
    </motion.span>
  )
}

export function BottomNav() {
  const reducir = useReducedMotion()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md md:hidden">
      <div className="pb-safe border-t border-border bg-card/95 backdrop-blur-md">
        <ul className="grid grid-cols-5 items-end px-2 pt-1.5">
          {items.map(({ to, label, icon, end, center }) => (
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
                          'relative grid h-14 w-14 place-items-center rounded-full bg-eco-600 text-white shadow-lg shadow-eco-600/40 ring-4 ring-card',
                          isActive && 'bg-eco-700',
                        )}
                      >
                        {/* El pulso del botón del medio al quedar elegido */}
                        {isActive && !reducir && (
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full bg-eco-500"
                            initial={{ scale: 1, opacity: 0.45 }}
                            animate={{ scale: 1.45, opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                          />
                        )}
                        <IconoDeLaBarra icon={icon} activo={isActive} centro />
                      </span>
                      <span className="mt-0.5 text-[11px] font-semibold text-eco-700">{label}</span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors',
                        isActive ? 'text-eco-700' : 'text-muted-foreground',
                      )}
                    >
                      <IconoDeLaBarra icon={icon} activo={isActive} />
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
