import { MapPin } from 'lucide-react'
import type { PointType, RecyclePoint, Sponsor } from '@/types'
import { cn, MATERIAL_LABEL } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { HuellaVerde } from './HuellaVerde'

const TYPE_LABEL: Record<PointType, string> = {
  deposito: 'Depósito de tapitas',
  maquina: 'Máquina de reciclaje',
  totem: 'Tótem / Punto verde',
}

interface Props {
  point: RecyclePoint
  sponsor?: Sponsor
  /** «a 350 m»: a cuánto queda del hincha, si se sabe dónde está. */
  distancia?: string
  /** El punto que está elegido en el mapa. */
  elegido?: boolean
  onClick?: () => void
}

export function PointCard({ point, sponsor, distancia, elegido, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-pressed={elegido}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition active:scale-[0.99]',
        elegido && 'ring-2 ring-eco-500',
      )}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
        style={{ backgroundColor: sponsor?.brandColor ?? '#059669' }}
      >
        <MapPin size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold leading-tight">{point.name}</p>
          {point.openNow ? (
            <Badge variant="success">Abierto</Badge>
          ) : (
            <Badge variant="neutral">Cerrado</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-muted-foreground">{TYPE_LABEL[point.type]}</p>
          {sponsor && <HuellaVerde score={sponsor.greenScore} compact />}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {point.address} · {point.city}
        </p>
        {distancia && <p className="text-xs font-semibold text-eco-700 dark:text-eco-300">{distancia}</p>}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {point.acceptedMaterials.map((m) => (
            <span
              key={m}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {MATERIAL_LABEL[m]}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
