import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Fondo de césped recién cortado; con `conLinea`, una línea de cal arriba. */
export function Cancha({
  children,
  className,
  conLinea = false,
}: {
  children: ReactNode
  className?: string
  conLinea?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-cancha', className)}>
      {conLinea && (
        <div aria-hidden className="pointer-events-none absolute inset-x-4 top-3 h-0.5 rounded-full bg-cal" />
      )}
      {children}
    </div>
  )
}
