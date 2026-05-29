import type { ElementType, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Ancho máximo + padding lateral responsive. Reemplaza los `mx-auto max-w-md`
 * dispersos por toda la app para tener un sistema único.
 * - prose: flujos de lectura/formulario (onboarding, detalle de texto)
 * - app:   contenido estándar de la app de usuario
 * - wide:  marketing y dashboards (aprovecha desktop)
 */
const container = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      prose: 'max-w-md',
      app: 'max-w-5xl',
      wide: 'max-w-7xl',
    },
  },
  defaultVariants: { size: 'app' },
})

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof container> {
  /** Etiqueta a renderizar (div por defecto): section, header, footer, etc. */
  as?: ElementType
}

export function Container({ size, className, as: As = 'div', ...props }: ContainerProps) {
  return <As className={cn(container({ size }), className)} {...props} />
}
