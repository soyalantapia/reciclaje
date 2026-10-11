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
/** Las butacas: cada respaldo son cuatro columnas de tapitas, con un hueco entre uno y otro. */
const TAPITAS_POR_BUTACA = 4
const BUTACAS = COLUMNAS_DEL_BANCO / TAPITAS_POR_BUTACA
const HUECO_ENTRE_BUTACAS = 8
const ANCHO_DE_UNA_BUTACA = TAPITAS_POR_BUTACA * PASO + 4
const ANCHO_DE_LAS_BUTACAS = ANCHO + (BUTACAS - 1) * HUECO_ENTRE_BUTACAS

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
  /** Un hueco cada tantas columnas de tapitas: el que separa una butaca de la otra. */
  separacion?: { cada: number; hueco: number }
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
  // Cuatro butacas, como en la tribuna: el respaldo de cada una son cuatro columnas de tapitas, con su
  // asiento, y entre una y otra queda un hueco. Van sobre un larguero con patas.
  butacas: {
    nombre: 'Butacas',
    ancho: ANCHO_DE_LAS_BUTACAS,
    alto: ASIENTO + 32,
    dx: 0,
    dy: 0,
    separacion: { cada: TAPITAS_POR_BUTACA, hueco: HUECO_ENTRE_BUTACAS },
    contorno: (
      <>
        {Array.from({ length: BUTACAS }, (_, g) => {
          const x = 1 + g * (TAPITAS_POR_BUTACA * PASO + HUECO_ENTRE_BUTACAS)
          return (
            <g key={g}>
              <rect x={x} y={1} width={ANCHO_DE_UNA_BUTACA} height={ASIENTO - 4} rx={5} strokeWidth={1.2} className={TRAZO} />
              <rect x={x} y={ASIENTO - 1} width={ANCHO_DE_UNA_BUTACA} height={6} rx={3} strokeWidth={1.2} className={TRAZO} />
            </g>
          )
        })}
        <rect x={1} y={ASIENTO + 8} width={ANCHO_DE_LAS_BUTACAS - 2} height={4} rx={2} strokeWidth={1.2} className={TRAZO} />
        <rect x={14} y={ASIENTO + 12} width={5} height={17} rx={1.5} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO_DE_LAS_BUTACAS - 19} y={ASIENTO + 12} width={5} height={17} rx={1.5} strokeWidth={1.2} className={TRAZO} />
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
          // Los palos llegan hasta la línea del arco: no flotan sobre ella.
          d={`M1 70 V1 H${ANCHO_DEL_ARCO - 1} V70 H${ANCHO_DEL_ARCO - 7} V7 H7 V70 Z`}
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
        const columna = i % COLUMNAS_DEL_BANCO
        const hueco = dibujo.separacion ? Math.floor(columna / dibujo.separacion.cada) * dibujo.separacion.hueco : 0
        const cx = dibujo.dx + MARGEN + columna * PASO + hueco
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
