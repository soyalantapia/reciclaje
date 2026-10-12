import { Award, CalendarCheck, Flag, Flame, Sprout, Star, type LucideIcon } from 'lucide-react'
import type { IdDeLogro, Logro } from '@/lib/logros'
import { cn } from '@/lib/utils'

const ICONO: Record<IdDeLogro, LucideIcon> = {
  primera: Sprout,
  racha: Flame,
  titular: Star,
  cancha: Flag,
  mil: Award,
  partidos: CalendarCheck,
}

/** La medalla de un logro: dorada con el color del club si está ganada, gris si falta. */
export function Medalla({ logro, grande = false }: { logro: Logro; grande?: boolean }) {
  const Icono = ICONO[logro.id]
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full',
        grande ? 'h-20 w-20' : 'h-14 w-14',
        logro.ganado
          ? 'bg-gradient-to-b from-xp-300 to-xp-500 shadow-md shadow-xp-500/30 ring-4 ring-eco-600'
          : 'bg-muted ring-2 ring-border',
      )}
    >
      <Icono
        size={grande ? 36 : 26}
        strokeWidth={2.25}
        className={logro.ganado ? 'text-eco-900' : 'text-muted-foreground opacity-60'}
      />
    </span>
  )
}
