import { GraduationCap, HeartHandshake, HeartPulse, Users, Utensils, type LucideIcon } from 'lucide-react'
import type { Cause, CauseType } from '@/types'
import { cn, formatNumber, pct } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export const CAUSE_ICON: Record<CauseType, LucideIcon> = {
  hospital: HeartPulse,
  ong: HeartHandshake,
  escuela: GraduationCap,
  comedor: Utensils,
}

export const CAUSE_LABEL: Record<CauseType, string> = {
  hospital: 'Hospital',
  ong: 'ONG',
  escuela: 'Escuela',
  comedor: 'Comedor',
}

interface Props {
  cause: Cause
  onClick?: () => void
  className?: string
}

export function CauseCard({ cause, onClick, className }: Props) {
  const Icon = CAUSE_ICON[cause.type]
  const progress = pct(cause.kgCollected, cause.kgGoal)

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition active:scale-[0.99]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
          style={{ backgroundColor: cause.brandColor }}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold leading-tight">{cause.name}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {CAUSE_LABEL[cause.type]} · {cause.city}
          </p>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{cause.summary}</p>

      <div className="mt-3">
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="font-semibold text-muted-foreground">
            {formatNumber(cause.kgCollected)} / {formatNumber(cause.kgGoal)} kg
          </span>
          <span className="font-extrabold text-eco-700 dark:text-eco-300">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Users size={13} /> {formatNumber(cause.supporters)} personas apoyan
      </div>
    </button>
  )
}
