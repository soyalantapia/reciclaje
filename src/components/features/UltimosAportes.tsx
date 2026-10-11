import type { AporteDeLaHinchada } from '@/lib/ultimosAportes'
import { cn, timeAgo } from '@/lib/utils'

/** La hinchada en el banco: lo de esta sesión con su hora y el acumulado de los que más aportan. */
export function UltimosAportes({ items, className }: { items: AporteDeLaHinchada[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <ul className={cn('space-y-1.5', className)}>
      {items.map((a) => (
        <li
          key={a.id}
          data-tuyo={a.esTuyo}
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm',
            a.esTuyo
              ? 'bg-xp-50 text-xp-700 ring-1 ring-xp-300 dark:bg-xp-700/20 dark:text-xp-100'
              : 'bg-card/85 text-foreground',
          )}
        >
          <span aria-hidden className={cn('h-3 w-3 shrink-0 rounded-full', a.esTuyo ? 'bg-xp-400' : 'bg-eco-500')} />
          <span className="min-w-0 flex-1 truncate">
            <b className="font-bold">{a.nombre}</b> {a.texto}
          </span>
          {a.cuando && <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.cuando)}</span>}
        </li>
      ))}
    </ul>
  )
}
