import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        eco: 'bg-eco-100 text-eco-800 dark:bg-eco-900/40 dark:text-eco-200',
        xp: 'bg-xp-100 text-xp-700 dark:bg-xp-700/20 dark:text-xp-300',
        neutral: 'bg-muted text-muted-foreground',
        success: 'bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300',
        warning: 'bg-xp-100 text-xp-700 dark:bg-xp-700/20 dark:text-xp-300',
        danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        outline: 'border border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
