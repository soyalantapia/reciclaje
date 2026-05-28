import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

function tier(score: number) {
  if (score >= 85) return { label: 'Excelente', chip: 'bg-eco-600 text-white' }
  if (score >= 70)
    return { label: 'Muy buena', chip: 'bg-eco-100 text-eco-800 dark:bg-eco-900/40 dark:text-eco-200' }
  if (score >= 50)
    return { label: 'Buena', chip: 'bg-xp-100 text-xp-700 dark:bg-xp-700/20 dark:text-xp-300' }
  return { label: 'En progreso', chip: 'bg-muted text-muted-foreground' }
}

interface Props {
  score: number
  compact?: boolean
  className?: string
}

/** Badge de "Huella Verde": reputación ambiental/RSE del aliado (0-100). */
export function HuellaVerde({ score, compact = false, className }: Props) {
  const t = tier(score)

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
          t.chip,
          className,
        )}
        title={`Huella Verde: ${score}/100 · ${t.label}`}
      >
        <Leaf size={11} /> {score}
      </span>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('grid h-9 w-9 place-items-center rounded-full', t.chip)}>
        <Leaf size={16} />
      </span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground">Huella Verde</p>
        <p className="text-sm font-extrabold leading-none">
          {score}/100 · <span className="font-semibold">{t.label}</span>
        </p>
      </div>
    </div>
  )
}
