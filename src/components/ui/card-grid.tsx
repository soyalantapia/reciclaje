import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Grid responsive para listas de tarjetas. Mobile-first: arranca en 1 (o 2)
 * columnas y crece en tablet/desktop.
 */
const cardGrid = cva('grid gap-3 md:gap-4', {
  variants: {
    cols: {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
      stats: 'grid-cols-2 lg:grid-cols-4',
      auto: '[grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]',
    },
  },
  defaultVariants: { cols: 3 },
})

export interface CardGridProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardGrid> {}

export function CardGrid({ cols, className, ...props }: CardGridProps) {
  return <div className={cn(cardGrid({ cols }), className)} {...props} />
}
