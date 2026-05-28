import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-eco-600 text-white hover:bg-eco-700 shadow-sm hover:shadow-lg hover:shadow-eco-600/25',
        xp: 'bg-xp-500 text-ink-900 hover:bg-xp-400 shadow-sm hover:shadow-lg hover:shadow-xp-500/30',
        secondary:
          'bg-card text-foreground border border-border hover:bg-muted',
        outline:
          'border-2 border-eco-600 bg-transparent text-eco-700 hover:bg-eco-50',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        danger: 'bg-danger text-white hover:opacity-90',
        link: 'bg-transparent text-eco-700 underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block, className }))}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }
