import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  /** Tooltip (title) que explica la métrica. */
  tooltip?: string
  /** Variación vs período anterior, ej. "+12%". Verde si sube, rojo si baja. */
  delta?: number
  className?: string
}

export function StatCard({ icon: Icon, label, value, hint, tooltip, delta, className }: Props) {
  return (
    <div
      title={tooltip}
      className={cn('rounded-2xl border border-border bg-card p-4 shadow-sm', className)}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon size={15} className="text-eco-600" />
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        {delta != null && (
          <span
            className={cn(
              'text-xs font-bold',
              delta >= 0 ? 'text-eco-600 dark:text-eco-400' : 'text-danger',
            )}
          >
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
