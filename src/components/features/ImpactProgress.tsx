import { motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, Sparkles } from 'lucide-react'
import type { ImpactProject } from '@/types'
import { cn, formatNumber, pct } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProductIllustration } from './ProductIllustration'

interface Props {
  project: ImpactProject
  compact?: boolean
  className?: string
}

/**
 * Feature estrella: muestra el producto fabricado con material reciclado.
 * Arranca en blanco y negro y se "colorea" de abajo hacia arriba según el
 * porcentaje recolectado. El reveal es por clip-path animado (framer-motion)
 * sobre una capa de color superpuesta a una base en escala de grises.
 */
export function ImpactProgress({ project, compact = false, className }: Props) {
  const total = pct(project.collectedUnits, project.goalUnits)
  const myShare = pct(project.myContributionUnits, project.collectedUnits)
  const reduce = useReducedMotion()

  return (
    <div className={cn('space-y-4', className)}>
      {/* Visual B&N → color */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-eco-50 to-card dark:from-eco-900/30">
        {/* base en escala de grises (blanco y negro de lo "pendiente") */}
        <div className="opacity-55 [filter:grayscale(1)] dark:opacity-40">
          <ProductIllustration type={project.illustration} className="block h-auto w-full" />
        </div>
        {/* capa a color, revelada de abajo hacia arriba. Con reduced-motion
            no animamos: se muestra directo al nivel final (no "todo gris"). */}
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: `inset(${100 - total}% 0% 0% 0%)` }}
          transition={{ duration: reduce ? 0 : 1.1, ease: 'easeOut' }}
        >
          <ProductIllustration type={project.illustration} className="block h-auto w-full" />
        </motion.div>

        {/* línea de avance ("waterline") */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-eco-500/70"
          initial={reduce ? false : { bottom: '0%' }}
          animate={{ bottom: `${total}%` }}
          transition={{ duration: reduce ? 0 : 1.1, ease: 'easeOut' }}
        />

        <div className="absolute right-3 top-3 rounded-full bg-card/90 px-3 py-1 text-sm font-extrabold text-eco-700 shadow-sm backdrop-blur dark:text-eco-300">
          {total}%
        </div>
      </div>

      {/* Progreso numérico */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            {formatNumber(project.collectedUnits)} / {formatNumber(project.goalUnits)}{' '}
            {project.unitLabel}
          </span>
          <span className="text-sm font-extrabold text-eco-700">{total}%</span>
        </div>
        <Progress value={total} />
      </div>

      {/* Tu aporte + fecha estimada */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-eco-50 p-3 dark:bg-eco-900/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-eco-700 dark:text-eco-300">
            <Sparkles size={14} /> Tu aporte
          </div>
          <p className="mt-1 text-lg font-extrabold leading-none text-eco-800 dark:text-eco-200">
            {formatNumber(project.myContributionUnits)}
          </p>
          <p className="text-xs text-eco-700 dark:text-eco-300">
            {project.unitLabel} · {myShare}% de lo recolectado
          </p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CalendarClock size={14} /> Fecha estimada
          </div>
          <p className="mt-1 text-lg font-extrabold leading-none">
            {new Date(project.estimatedDate).toLocaleDateString('es-AR', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-muted-foreground">finalización</p>
        </div>
      </div>

      {!compact && (
        <>
          {/* Hitos */}
          <div>
            <p className="mb-2 text-sm font-bold">Hitos del proyecto</p>
            <div className="flex flex-wrap gap-2">
              {project.milestones.map((m) => (
                <Badge key={m.label} variant={m.done ? 'eco' : 'neutral'}>
                  {m.done ? '✓ ' : '○ '}
                  {m.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Top aportantes */}
          <div>
            <p className="mb-2 text-sm font-bold">Top aportantes</p>
            <ul className="space-y-2">
              {project.topContributors.map((c, i) => (
                <li key={c.name} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <Avatar name={c.name} color={c.avatarColor} size="sm" />
                  <span className="flex-1 text-sm font-semibold">{c.name}</span>
                  <span className="text-sm font-bold text-eco-700">
                    {formatNumber(c.units)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
