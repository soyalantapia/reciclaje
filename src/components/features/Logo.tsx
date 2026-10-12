import { Recycle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLUB, ESCENARIO } from '@/lib/escenario'
import { escudoDeLaAppDelHincha } from '@/lib/logos'

interface LogoProps {
  withText?: boolean
  className?: string
  /** Clases para el nombre: el encabezado del celular lo esconde en pantallas muy angostas y deja el ícono. */
  textoClassName?: string
}

export function Logo({ withText = true, className, textoClassName }: LogoProps) {
  const escudo = escudoDeLaAppDelHincha(ESCENARIO)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-eco-600 text-white shadow-sm">
        <Recycle size={20} strokeWidth={2.4} />
      </span>
      {withText && (
        <span className={cn('text-lg font-extrabold tracking-tight', textoClassName)}>
          Recicla<span className="text-eco-600">XP</span>
        </span>
      )}
      {/* En la demo del club, el escudo del club al lado: es su espacio dentro de ReciclaXP. */}
      {escudo && (
        <>
          <span aria-hidden className="h-6 w-px bg-border" />
          <img src={escudo} alt={`Escudo de ${CLUB.nombre}`} data-escudo-del-club className="h-8 w-8 shrink-0 object-contain" />
        </>
      )}
    </div>
  )
}
