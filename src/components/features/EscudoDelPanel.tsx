import { useSessionStore } from '@/store/session'
import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'
import { cn } from '@/lib/utils'

/**
 * El escudo de la institución en el panel, si lo subió en «Marca»; si no, su inicial en un cuadrado
 * de su color. Lo usan la barra lateral y el encabezado del celular.
 */
export function EscudoDelPanel({ className }: { className?: string }) {
  const commerce = useSessionStore((s) => s.commerce)
  const marca = useMarcaDelPanel()
  if (!commerce) return null
  if (marca?.escudo) {
    return <img src={marca.escudo} alt={`Escudo de ${commerce.name}`} className={cn('shrink-0 object-contain', className)} />
  }
  return (
    <span
      aria-hidden
      // Con marca, el cuadrado toma su 600 (ya legible con texto blanco); sin marca, el color de siempre.
      className={cn('grid shrink-0 place-items-center rounded-xl font-extrabold text-white', marca && 'bg-eco-600', className)}
      style={marca ? undefined : { backgroundColor: commerce.brandColor }}
    >
      {commerce.name[0]}
    </span>
  )
}
