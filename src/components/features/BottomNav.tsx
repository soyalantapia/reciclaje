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

/** El resorte del fondo de la pestaña elegida: se desliza hasta la que tocás. */
const DESLIZAR = { type: 'spring', stiffness: 520, damping: 38, mass: 0.9 } as const

/**
 * La barra de abajo es un dock flotante de vidrio: despegado de los bordes, redondeado, con un fondo que
 * se desliza hasta la pestaña elegida. Escanear es un botón elevado con degradé, recortado sobre el dock.
 *
 * Cada botón responde en toda su superficie: al apretarlo, el ícono (y en Escanear el círculo entero) se
 * achica, y en cada toque el ícono rebota, también el de la pestaña en la que ya estás. Con «reducir
 * movimiento» del sistema queda todo quieto: ni rebota, ni late, ni se desliza.
 */
export function BottomNav() {
  const reducir = useReducedMotion()
  const { tocar, vezDe } = useToques()
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="pointer-events-auto mx-auto max-w-md rounded-[28px] border border-white/70 bg-card/80 px-1.5 py-1.5 shadow-[0_18px_40px_-16px_rgba(6,40,31,0.45)] ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-card/75 dark:ring-white/5">
        <ul className="grid grid-cols-5 items-end">
          {items.map(({ to, label, icon, end, center }) => (
            <li key={to} className="flex justify-center">
              <NavLink
                to={to}
                end={end}
                aria-label={label}
                onClick={() => tocar(to)}
                className="group flex w-full flex-col items-center"
              >
                {({ isActive }) =>
                  center ? (
                    // `pb-2`, como el `py-2` de las otras: así su etiqueta queda en la misma línea que las demás.
                    <ZonaQueSeAprieta className="-mt-9 flex w-full flex-col items-center pb-2">
                      <SeAchicaAlApretar
                        data-circulo
                        escala={0.92}
                        className={cn(
                          // El aro del color de la página lo recorta sobre el dock, como si saliera de él. `z-10`: el fondo
                          // de la pestaña elegida, al deslizarse de una punta a la otra, pasa por debajo.
                          'relative z-10 grid h-[60px] w-[60px] place-items-center rounded-full bg-gradient-to-br from-eco-500 to-eco-700 text-white shadow-[0_12px_24px_-8px] shadow-eco-700/60 ring-[5px] ring-background',
                          isActive && 'from-eco-600 to-eco-800',
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
                        <IconoQueSeMueve icon={icon} activo={isActive} vez={vezDe(to)} size={26} strokeWidth={2.4} />
                      </SeAchicaAlApretar>
                      {/* `z-10`, como el círculo: el fondo que se desliza de una punta a la otra pasa por debajo */}
                      <span
                        className={cn(
                          'relative z-10 mt-0.5 text-[11px] font-bold',
                          isActive ? 'text-eco-700 dark:text-eco-300' : 'text-muted-foreground',
                        )}
                      >
                        {label}
                      </span>
                    </ZonaQueSeAprieta>
                  ) : (
                    <ZonaQueSeAprieta
                      className={cn(
                        'relative flex w-full flex-col items-center rounded-[20px] py-2 text-[11px] font-semibold transition-colors',
                        isActive ? 'text-eco-700 dark:text-eco-300' : 'text-muted-foreground',
                      )}
                    >
                      {/* El fondo de la elegida: uno solo, que se desliza de pestaña en pestaña */}
                      {isActive && (
                        <motion.span
                          aria-hidden
                          data-pestana-activa
                          layoutId="pestana-activa"
                          transition={reducir ? { duration: 0 } : DESLIZAR}
                          className="absolute inset-0 rounded-[20px] bg-eco-100/90 dark:bg-eco-900/50"
                        />
                      )}
                      {/* `z-10`: el fondo, mientras se desliza, pasa por debajo del ícono y la etiqueta de cada pestaña */}
                      <span className="relative z-10 flex flex-col items-center gap-0.5">
                        <IconoQueSeMueve icon={icon} activo={isActive} vez={vezDe(to)} strokeWidth={isActive ? 2.6 : 2} />
                        {label}
                      </span>
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
