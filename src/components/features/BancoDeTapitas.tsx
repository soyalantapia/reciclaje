import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { FormaDelProducto } from '@/types'
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
/** El arco es más ancho: los palos van por fuera de las tapitas. */
const ANCHO_DEL_ARCO = ANCHO + 12

const CLASE: Record<EstadoTapita, string> = {
  hinchada: 'fill-eco-500 stroke-eco-700',
  tuya: 'fill-xp-400 stroke-xp-600',
  vacia: 'fill-transparent stroke-eco-300 dark:stroke-eco-800',
}

const TRAZO = 'fill-transparent stroke-eco-500 dark:stroke-eco-700'

/** Cómo se dibuja cada forma: su nombre, su tamaño, dónde van las tapitas y el contorno. */
interface Dibujo {
  nombre: string
  ancho: number
  alto: number
  /** Corrimiento de las tapitas dentro del dibujo. */
  dx: number
  dy: number
  contorno: ReactNode
}

const DIBUJO: Record<FormaDelProducto, Dibujo> = {
  // El de siempre: el respaldo de tapitas, el asiento y dos patas.
  banco: {
    nombre: 'Banco',
    ancho: ANCHO,
    alto: ASIENTO + 32,
    dx: 0,
    dy: 0,
    contorno: (
      <>
        <rect x={4} y={ASIENTO - 4} width={ANCHO - 8} height={7} rx={3} strokeWidth={1.2} className={TRAZO} />
        <rect x={16} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO - 21} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
  // Cuatro butacas de cuatro columnas cada una, con su asiento, sobre un larguero con patas.
  butacas: {
    nombre: 'Butacas',
    ancho: ANCHO,
    alto: ASIENTO + 32,
    dx: 0,
    dy: 0,
    contorno: (
      <>
        {[1, 2, 3].map((g) => (
          <line key={g} x1={3 + g * 40} y1={2} x2={3 + g * 40} y2={ASIENTO - 6} strokeWidth={1.2} className={TRAZO} />
        ))}
        {[0, 1, 2, 3].map((g) => (
          <rect key={g} x={4 + g * 40} y={ASIENTO - 4} width={38} height={7} rx={3} strokeWidth={1.2} className={TRAZO} />
        ))}
        <rect x={4} y={ASIENTO + 8} width={ANCHO - 8} height={4} rx={2} strokeWidth={1.2} className={TRAZO} />
        <rect x={16} y={ASIENTO + 12} width={5} height={17} rx={1.5} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO - 21} y={ASIENTO + 12} width={5} height={17} rx={1.5} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
  // Las tapitas son la red: los palos y el travesaño las rodean, sobre la línea del arco.
  arco: {
    nombre: 'Arco',
    ancho: ANCHO_DEL_ARCO,
    alto: 72,
    dx: 6,
    dy: 8,
    contorno: (
      <>
        <path
          d={`M1 67 V1 H${ANCHO_DEL_ARCO - 1} V67 H${ANCHO_DEL_ARCO - 7} V7 H7 V67 Z`}
          strokeWidth={1.2}
          strokeLinejoin="round"
          className={TRAZO}
        />
        <line x1={0} y1={70} x2={ANCHO_DEL_ARCO} y2={70} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
  // Cualquier otra cosa: un marco con su base.
  libre: {
    nombre: 'Producto',
    ancho: ANCHO,
    alto: 66,
    dx: 0,
    dy: 0,
    contorno: (
      <>
        <rect x={1} y={1} width={ANCHO - 2} height={54} rx={8} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO / 2 - 25} y={58} width={50} height={6} rx={3} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
}

/**
 * Lo que construye la hinchada dibujado con tapitas, que se llenan con el avance real del
 * proyecto. Las de la hinchada en verde y las de la persona en ámbar. `forma` cambia el contorno
 * (un banco, butacas, un arco u otra cosa); las 80 tapitas se llenan igual, de abajo hacia arriba.
 * Con `animarTuyas`, las suyas entran cayendo (salvo con movimiento reducido).
 */
export function BancoDeTapitas({
  progreso,
  propias,
  forma = 'banco',
  animarTuyas = false,
  className,
}: {
  progreso: number
  propias: number
  forma?: FormaDelProducto
  animarTuyas?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const dibujo = DIBUJO[forma]
  const estados = estadosDelBanco({ total: TAPITAS_DEL_BANCO, progreso, propias })
  const encendidas = estados.filter((e) => e !== 'vacia').length

  return (
    <svg
      viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`}
      role="img"
      aria-label={`${dibujo.nombre} de tapitas: ${encendidas} de ${TAPITAS_DEL_BANCO} encendidas`}
      data-forma={forma}
      className={cn('block h-auto w-full', className)}
    >
      {estados.map((estado, i) => {
        const cx = dibujo.dx + MARGEN + (i % COLUMNAS_DEL_BANCO) * PASO
        const cy = dibujo.dy + MARGEN + (FILAS_DEL_BANCO - 1 - Math.floor(i / COLUMNAS_DEL_BANCO)) * PASO
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
      {dibujo.contorno}
    </svg>
  )
}
