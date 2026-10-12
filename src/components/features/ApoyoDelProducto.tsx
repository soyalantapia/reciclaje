import type { ImpactProject } from '@/types'
import { textoDelApoyo } from '@/lib/productosDelClub'
import { cn } from '@/lib/utils'

/** «Con el apoyo de …», con el color de la empresa: va junto a un producto que tiene patrocinador. */
export function ApoyoDelProducto({ proyecto, className }: { proyecto: ImpactProject; className?: string }) {
  const texto = textoDelApoyo(proyecto)
  if (!texto) return null
  return (
    <p
      data-apoyo
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm',
        className,
      )}
    >
      <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: proyecto.patrocinador!.color }} />
      <span className="truncate">{texto}</span>
    </p>
  )
}
