import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  className?: string
}

export function StatCard({ icon: Icon, label, value, hint, className }: Props) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon size={15} className="text-eco-600" />
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-extrabold leading-none">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
