/**
 * Las piezas del movimiento de la barra de abajo y del menú lateral de la compu, para que se muevan igual:
 *
 * - `ZonaQueSeAprieta` ocupa todo el botón (ícono, etiqueta y los costados): apretarlo en cualquier parte
 *   es apretar la zona.
 * - `SeAchicaAlApretar` es lo que se achica mientras se aprieta la zona (el ícono, el círculo de Escanear).
 * - `IconoQueSeMueve` es el ícono: se achica al apretar y rebota en cada toque.
 *
 * «Reducir movimiento» del sistema corta todo: ni se achica ni rebota.
 */
import type { ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

/** Apretar dura poco: un toque corto (100-150 ms) tiene que alcanzar a verse. El rebote, con sus 0,45 s, no sirve para esto. */
const alApretar = (escala: number): Variants => ({
  apretado: { scale: escala, transition: { duration: 0.12, ease: 'easeOut' } },
})

export function ZonaQueSeAprieta({ className, children }: { className?: string; children: ReactNode }) {
  const reducir = useReducedMotion()
  return (
    <motion.span
      className={className}
      whileTap={reducir ? undefined : 'apretado'}
      // framer-motion le pone tabindex="0" a lo que se aprieta si no es un enlace ni un botón: el Tab pararía dos veces en cada enlace.
      tabIndex={reducir ? undefined : -1}
    >
      {children}
    </motion.span>
  )
}

type PropsDeSeAchica = Omit<HTMLMotionProps<'span'>, 'variants'> & { escala?: number }

export function SeAchicaAlApretar({ escala = 0.85, ...resto }: PropsDeSeAchica) {
  return <motion.span variants={alApretar(escala)} {...resto} />
}

/** El rebote de un toque: sube, crece un poco y vuelve. */
const REBOTE = { y: [0, -5, 0], scale: [1, 1.18, 1] }
const REPOSO = { y: 0, scale: 1 }

interface PropsDelIcono {
  icon: LucideIcon
  /** La pestaña está elegida: al quedar así rebota. */
  activo: boolean
  /** Cuántas veces se la tocó (ver `useToques`): cada toque monta de nuevo el rebote y vuelve a sonar. */
  vez: number
  size?: number
  strokeWidth?: number
}

export function IconoQueSeMueve({ icon: Icon, activo, vez, size = 22, strokeWidth = 2 }: PropsDelIcono) {
  const reducir = useReducedMotion()
  return (
    <SeAchicaAlApretar data-icono data-vez={vez} className="inline-flex">
      {/* Se achica el de afuera y rebota el de adentro: así, volver a montar el de adentro en cada toque no corta el achique a mitad de camino. */}
      <motion.span
        key={vez}
        className="inline-flex"
        animate={reducir ? undefined : activo ? REBOTE : REPOSO}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Icon size={size} strokeWidth={strokeWidth} />
      </motion.span>
    </SeAchicaAlApretar>
  )
}
