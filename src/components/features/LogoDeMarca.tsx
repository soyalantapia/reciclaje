import { Coffee, CupSoda, Fuel, IceCreamCone, Landmark, Sandwich, Shirt, Store, type LucideIcon } from 'lucide-react'
import { marcaOficial, rubroDe, type Rubro } from '@/lib/logos'
import { cn } from '@/lib/utils'

const ICONO_DEL_RUBRO: Record<Rubro, LucideIcon> = {
  combustible: Fuel,
  cafe: Coffee,
  bebida: CupSoda,
  comida: Sandwich,
  helado: IceCreamCone,
  deporte: Shirt,
  municipio: Landmark,
  comercio: Store,
}

const TAMANOS = {
  xs: { caja: 'h-5 w-5 rounded-md', icono: 12 },
  sm: { caja: 'h-8 w-8 rounded-lg', icono: 17 },
  md: { caja: 'h-11 w-11 rounded-xl', icono: 22 },
  lg: { caja: 'h-12 w-12 rounded-xl', icono: 24 },
} as const

/**
 * El logo de una marca de la red: el escudo oficial si la demo lo trae (Talleres), o uno hecho acá con
 * su color y el ícono de su rubro (ver `src/lib/logos.ts`). Va al lado del nombre, que sigue escrito:
 * el logo es decorativo para los lectores de pantalla.
 */
export function LogoDeMarca({
  marca,
  tamano = 'md',
  className,
}: {
  marca: { id: string; name: string; brandColor: string }
  tamano?: keyof typeof TAMANOS
  className?: string
}) {
  const t = TAMANOS[tamano]
  const oficial = marcaOficial(marca)
  if (oficial) {
    return (
      <img
        src={oficial.escudo}
        alt=""
        aria-hidden
        data-logo={marca.id}
        className={cn('shrink-0 object-contain', t.caja, 'rounded-none', className)}
      />
    )
  }
  const Icono = ICONO_DEL_RUBRO[rubroDe(marca.id)]
  return (
    <span
      aria-hidden
      data-logo={marca.id}
      className={cn('grid shrink-0 place-items-center text-white shadow-sm ring-1 ring-black/5', t.caja, className)}
      style={{ backgroundColor: marca.brandColor }}
    >
      <Icono size={t.icono} strokeWidth={2.3} />
    </span>
  )
}

/** El escudo oficial de una institución, chico, para poner al lado de su nombre; sin escudo, nada. */
export function EscudoOficial({ sponsorId, nombre, className }: { sponsorId: string; nombre: string; className?: string }) {
  const oficial = marcaOficial({ id: sponsorId, name: nombre })
  if (!oficial) return null
  return <img src={oficial.escudo} alt="" aria-hidden data-escudo={sponsorId} className={cn('h-5 w-5 shrink-0 object-contain', className)} />
}
