import { NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Gift, Home, MapPin, QrCode, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToques } from '@/hooks/useToques'
import { IconoQueSeMueve, SeAchicaAlApretar, ZonaQueSeAprieta } from './IconoQueSeMueve'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/escanear', label: 'Escanear', icon: QrCode, center: true },
  { to: '/beneficios', label: 'Beneficios', icon: Gift },
  { to: '/perfil', label: 'Perfil', icon: User },
]

/**
 * Cada botón de la barra responde en toda su superficie: al apretarlo, el ícono (y en Escanear el círculo
 * verde entero) se achica, y en cada toque el ícono rebota, también el de la pestaña en la que ya estás.
 * Con «reducir movimiento» del sistema queda todo quieto.
 */
export function BottomNav() {
  const reducir = useReducedMotion()
  const { tocar, vezDe } = useToques()
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
                onClick={() => tocar(to)}
                className="group flex w-full flex-col items-center gap-0.5"
              >
                {({ isActive }) =>
                  center ? (
                    <ZonaQueSeAprieta className="-mt-7 flex w-full flex-col items-center">
                      <SeAchicaAlApretar
                        data-circulo
                        escala={0.92}
                        className={cn(
                          'relative grid h-14 w-14 place-items-center rounded-full bg-eco-600 text-white shadow-lg shadow-eco-600/40 ring-4 ring-card',
                          isActive && 'bg-eco-700',
                        )}
                      >
                        {/* El pulso del botón del medio al quedar elegido, y otra vez en cada toque */}
                        {isActive && !reducir && (
                          <motion.span
                            key={vezDe(to)}
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full bg-eco-500"
                            initial={{ scale: 1, opacity: 0.45 }}
                            animate={{ scale: 1.45, opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                          />
                        )}
                        <IconoQueSeMueve icon={icon} activo={isActive} vez={vezDe(to)} size={24} strokeWidth={2.4} />
                      </SeAchicaAlApretar>
                      <span className="mt-0.5 text-[11px] font-semibold text-eco-700">{label}</span>
                    </ZonaQueSeAprieta>
                  ) : (
                    <ZonaQueSeAprieta
                      className={cn(
                        'flex w-full flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors',
                        isActive ? 'text-eco-700' : 'text-muted-foreground',
                      )}
                    >
                      <IconoQueSeMueve icon={icon} activo={isActive} vez={vezDe(to)} strokeWidth={isActive ? 2.6 : 2} />
                      {label}
                    </ZonaQueSeAprieta>
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
