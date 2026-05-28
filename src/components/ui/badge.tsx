import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        eco: 'bg-eco-100 text-eco-800',
        xp: 'bg-xp-100 text-xp-700',
        neutral: 'bg-muted text-muted-foreground',
        success: 'bg-eco-100 text-eco-700',
        warning: 'bg-xp-100 text-xp-700',
        danger: 'bg-rose-100 text-rose-700',
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
