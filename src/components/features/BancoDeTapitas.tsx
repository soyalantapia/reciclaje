import { motion, useReducedMotion } from 'framer-motion'
import {
  COLUMNAS_DEL_BANCO,
  FILAS_DEL_BANCO,
  TAPITAS_DEL_BANCO,
  estadosDelBanco,
  type EstadoTapita,
} from '@/lib/bancoDeTapitas'
import { cn } from '@/lib/utils'

const PASO = 10
const RADIO = 4.2
const MARGEN = 8
const ANCHO = MARGEN * 2 + (COLUMNAS_DEL_BANCO - 1) * PASO
const ASIENTO = MARGEN + (FILAS_DEL_BANCO - 1) * PASO + 10
const ALTO = ASIENTO + 32

const CLASE: Record<EstadoTapita, string> = {
  hinchada: 'fill-eco-500 stroke-eco-700',
  tuya: 'fill-xp-400 stroke-xp-600',
  vacia: 'fill-transparent stroke-eco-300 dark:stroke-eco-800',
}

/**
 * El banco de suplentes dibujado con tapitas, que se llenan con el avance real del proyecto.
 * Las de la hinchada en verde y las de la persona en ámbar. Con `animarTuyas`, las suyas entran
 * cayendo (salvo con movimiento reducido).
 */
export function BancoDeTapitas({
  progreso,
  propias,
  animarTuyas = false,
  className,
}: {
  progreso: number
  propias: number
  animarTuyas?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const estados = estadosDelBanco({ total: TAPITAS_DEL_BANCO, progreso, propias })
  const encendidas = estados.filter((e) => e !== 'vacia').length

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={`Banco de tapitas: ${encendidas} de ${TAPITAS_DEL_BANCO} encendidas`}
      className={cn('block h-auto w-full', className)}
    >
      {estados.map((estado, i) => {
        const cx = MARGEN + (i % COLUMNAS_DEL_BANCO) * PASO
        const cy = MARGEN + (FILAS_DEL_BANCO - 1 - Math.floor(i / COLUMNAS_DEL_BANCO)) * PASO
        if (estado === 'tuya' && animarTuyas && !reduce) {
          return (
            <motion.circle
              key={i}
              data-estado={estado}
              cx={cx}
              r={RADIO}
              strokeWidth={1}
              className={CLASE[estado]}
              initial={{ cy: cy - 60, opacity: 0 }}
              animate={{ cy, opacity: 1 }}
              transition={{ type: 'spring', damping: 11, delay: 0.6 }}
            />
          )
        }
        return <circle key={i} data-estado={estado} cx={cx} cy={cy} r={RADIO} strokeWidth={1} className={CLASE[estado]} />
      })}
      <rect
        x={4}
        y={ASIENTO - 4}
        width={ANCHO - 8}
        height={7}
        rx={3}
        strokeWidth={1.2}
        className="fill-transparent stroke-eco-500 dark:stroke-eco-700"
      />
      <rect x={16} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className="fill-transparent stroke-eco-500 dark:stroke-eco-700" />
      <rect x={ANCHO - 21} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className="fill-transparent stroke-eco-500 dark:stroke-eco-700" />
    </svg>
  )
}
