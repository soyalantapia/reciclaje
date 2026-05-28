import {
  Boxes,
  CheckCircle2,
  Factory,
  MapPin,
  PackageCheck,
  Recycle,
  Truck,
} from 'lucide-react'
import type { TraceEvent, TraceStage } from '@/types'
import { cn, formatDate } from '@/lib/utils'

const STAGE_ICON: Record<TraceStage, typeof MapPin> = {
  aporte: MapPin,
  validacion: CheckCircle2,
  lote: Boxes,
  retiro: Truck,
  clasificacion: Recycle,
  transformacion: Factory,
  producto: PackageCheck,
}

export function TraceabilityTimeline({ events }: { events: TraceEvent[] }) {
  return (
    <ol className="relative">
      {events.map((ev, i) => {
        const Icon = STAGE_ICON[ev.stage]
        const last = i === events.length - 1
        return (
          <li key={ev.stage} className="relative flex gap-3 pb-5 last:pb-0">
            {/* línea conectora */}
            {!last && (
              <span
                className={cn(
                  'absolute left-[18px] top-9 h-[calc(100%-1rem)] w-0.5',
                  ev.done ? 'bg-eco-400' : 'bg-border',
                )}
              />
            )}
            {/* nodo */}
            <span
              className={cn(
                'z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-background',
                ev.done ? 'bg-eco-600 text-white' : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon size={18} />
            </span>
            {/* contenido */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <p className={cn('font-bold', !ev.done && 'text-muted-foreground')}>
                  {ev.title}
                </p>
                {!ev.done && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    próximo
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{ev.detail}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/80">
                {ev.date ? formatDate(ev.date) : 'pendiente'}
                {ev.operator ? ` · ${ev.operator}` : ''}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
