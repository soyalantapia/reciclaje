import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Logro } from '@/lib/logros'
import { sonarLogro } from '@/lib/sonido'
import { Medalla } from './Medalla'

/** Los destellos alrededor de la medalla: decorativos. */
function Destellos() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angulo, i) => (
        <motion.span
          key={angulo}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-xp-400"
          initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.4 }}
          animate={{
            x: `calc(-50% + ${Math.cos((angulo * Math.PI) / 180) * 56}px)`,
            y: `calc(-50% + ${Math.sin((angulo * Math.PI) / 180) * 56}px)`,
            opacity: [0, 1, 0],
            scale: [0.4, 1, 0.6],
          }}
          transition={{ duration: 0.9, delay: 0.55 + i * 0.03, ease: 'easeOut' }}
        />
      ))}
    </span>
  )
}

/**
 * El logro que ganó este aporte, debajo del festejo: la medalla entra girando con un rebote y suelta
 * destellos. Con movimiento reducido se ve quieta.
 */
export function LogroDesbloqueado({ logro }: { logro: Logro }) {
  const reduce = useReducedMotion()
  // Las campanitas suenan cuando entra la medalla.
  // La ref lo cuida del doble montaje del modo estricto de React.
  const sono = useRef(false)
  useEffect(() => {
    if (sono.current) return
    sono.current = true
    sonarLogro(0.6)
  }, [])
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 w-full rounded-2xl border-2 border-xp-400 bg-xp-50 p-4 text-center dark:bg-xp-700/10"
    >
      <p className="text-xs font-extrabold uppercase tracking-wider text-xp-700 dark:text-xp-300">¡Logro desbloqueado!</p>
      <div className="relative mx-auto my-3 grid h-28 w-28 place-items-center">
        {!reduce && <Destellos />}
        <motion.span
          initial={reduce ? false : { scale: 0, rotate: -200 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 9, stiffness: 140, delay: 0.4 }}
        >
          <Medalla logro={logro} grande />
        </motion.span>
      </div>
      <p className="text-lg font-extrabold">{logro.titulo}</p>
      <p className="text-sm text-muted-foreground">{logro.detalle}</p>
      <Link to="/perfil#logros" className="mt-2 inline-block text-sm font-semibold text-eco-700 dark:text-eco-300">
        Ver tus logros
      </Link>
    </motion.div>
  )
}
