import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ImageUp, RotateCcw } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { colorLegible } from '@/lib/marca'
import { EscudoInvalido, prepararEscudo } from '@/lib/escudo'
import { Button } from '@/components/ui/button'

/** El color de ReciclaXP: el de una institución que todavía no eligió el suyo. */
const COLOR_DE_RECICLAXP = '#059669'

/**
 * La marca del club: sube su escudo y elige su color, y todo su panel y su informe los usan. Queda
 * sólo en este navegador, como los beneficios y los productos de la demo: no va al código ni a la
 * dirección publicada, que son públicos.
 */
export default function CommerceMarca() {
  const commerce = useSessionStore((s) => s.commerce)
  const marca = useMarcaDelClubStore((s) => (commerce ? s.marcas[commerce.id] : undefined))
  const guardar = useMarcaDelClubStore((s) => s.guardar)
  const quitar = useMarcaDelClubStore((s) => s.quitar)
  const [leyendo, setLeyendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio" replace />

  const id = commerce.id
  const color = marca?.color ?? COLOR_DE_RECICLAXP

  async function subir(archivo: File | undefined) {
    if (!archivo) return
    setError(null)
    setLeyendo(true)
    try {
      const leido = await prepararEscudo(archivo)
      guardar(id, { escudo: leido.escudo, color: leido.color ?? color })
      toast.success(leido.color ? 'Listo: el panel ya usa tu escudo y su color' : 'Listo: subimos el escudo. Elegí el color abajo.')
    } catch (e) {
      setError(e instanceof EscudoInvalido ? e.message : 'No se pudo leer el escudo. Probá con otra imagen.')
    } finally {
      setLeyendo(false)
      if (entrada.current) entrada.current.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">La marca de {commerce.name}</h1>
        <p className="text-sm text-muted-foreground">Tu escudo y tus colores, en todo el panel y en el informe.</p>
      </div>

      <section aria-labelledby="marca-escudo" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="marca-escudo" className="font-bold">
          Escudo
        </h2>
        <div className="mt-3 flex items-center gap-4">
          {marca?.escudo ? (
            <img src={marca.escudo} alt={`Escudo de ${commerce.name}`} className="h-20 w-20 shrink-0 object-contain" />
          ) : (
            <span
              aria-hidden
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-eco-600 text-3xl font-extrabold text-white"
            >
              {commerce.name[0]}
            </span>
          )}
          <div className="space-y-2">
            <input
              ref={entrada}
              type="file"
              aria-label="Archivo del escudo"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="sr-only"
              onChange={(e) => void subir(e.target.files?.[0])}
            />
            <Button type="button" onClick={() => entrada.current?.click()} disabled={leyendo}>
              <ImageUp size={18} /> {marca?.escudo ? 'Cambiar el escudo' : 'Subir el escudo'}
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG o WebP, hasta 2 MB.</p>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </section>

      <section aria-labelledby="marca-color" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="marca-color" className="font-bold">
          Color
        </h2>
        <p className="text-sm text-muted-foreground">Sale del escudo. Si querés otro, elegilo acá.</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="color"
            aria-label="Color de la marca"
            value={color}
            onChange={(e) => guardar(id, { ...marca, color: e.target.value })}
            className="h-11 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
          />
          <span className="font-mono text-sm">{color}</span>
        </div>
        {/* Sin marca todavía no se eligió nada: el verde de ReciclaXP no es un color que el club haya puesto. */}
        {marca && colorLegible(color) !== color.toLowerCase() && (
          <p className="mt-2 text-xs text-muted-foreground">
            En los botones va un poco más oscuro, para que el texto blanco se lea.
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Se guarda sólo en este navegador: no se publica. El escudo y los colores son del club; usalos con su permiso.
        </p>
        {marca && (
          <Button type="button" variant="secondary" onClick={() => quitar(id)}>
            <RotateCcw size={16} /> Volver a los colores de ReciclaXP
          </Button>
        )}
      </div>
    </div>
  )
}
