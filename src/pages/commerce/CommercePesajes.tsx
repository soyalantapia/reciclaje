import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Scale, Trash2 } from 'lucide-react'
import { usePuntosDelPanel } from '@/hooks/usePuntosDelPanel'
import { useSessionStore } from '@/store/session'
import { usePesajesStore } from '@/store/pesajesDelClub'
import { crearPesaje, kilosValidos, leerKilos, pesajesDelInforme } from '@/lib/pesajes'
import { TAPITAS_POR_KILO } from '@/lib/metrics'
import { esInstitucion } from '@/lib/vocabulario'
import { formatNumber, shortCode } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Hoy en la hora local, como lo pide un `<input type="date">`. */
function hoy(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fechaCorta = (fecha: string) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

/**
 * La carga del pesaje del partido (E1.4 del piloto): al cierre de cada partido, el personal del club
 * pesa lo juntado en un Punto R y lo carga acá. Es el paso del club en el recorrido de la tapita: al
 * guardarlo, el hincha ve «Pesaje del lote» hecho, y el informe llena «Partido por partido».
 */
export default function CommercePesajes() {
  const commerce = useSessionStore((s) => s.commerce)
  const pesajes = usePesajesStore((s) => s.pesajes)
  const agregar = usePesajesStore((s) => s.agregar)
  const quitar = usePesajesStore((s) => s.quitar)
  const { points: puntos } = usePuntosDelPanel()

  const [partido, setPartido] = useState('')
  const [fecha, setFecha] = useState(hoy)
  const [puntoId, setPuntoId] = useState('')
  const [kilos, setKilos] = useState('')

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio" replace />

  const puntosDelClub = (puntos ?? []).filter((p) => p.sponsorId === commerce.id)
  const punto = puntosDelClub.find((p) => p.id === puntoId) ?? puntosDelClub[0]
  // Coma decimal y punto de miles, como se escribe acá: «1.250» son mil doscientos cincuenta kilos.
  const kg = leerKilos(kilos)
  const mios = pesajesDelInforme(pesajes.filter((p) => puntosDelClub.some((pt) => pt.id === p.puntoId)))

  function guardar() {
    if (!partido.trim()) return toast.error('Poné qué partido fue')
    if (!fecha) return toast.error('Poné la fecha del partido')
    // El campo tiene `max`, pero una fecha escrita a mano se lo saltea.
    if (fecha > hoy()) return toast.error('La fecha del partido no puede ser de un día que todavía no pasó')
    if (!punto) return toast.error('Elegí el Punto R que pesaste')
    if (!kilosValidos(kg)) return toast.error('Poné los kilos que marcó la balanza')
    agregar(
      crearPesaje({ id: `ps_${shortCode(6)}`, partido, fecha, punto, kilos: kg, creadoEn: new Date().toISOString() }),
    )
    setKilos('')
    toast.success('Guardado: el recorrido de la tapita pasó al pesaje del lote', {
      // Sin servidor, la app lo toma sólo en este navegador (ver src/store/pesajesDelClub.ts).
      description: 'En la app, el Inicio lo muestra en «El recorrido de tu tapita». En la demo, abrila en este mismo navegador.',
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Pesajes</h1>
        <p className="text-sm text-muted-foreground">
          Al cierre de cada partido, pesá lo juntado en cada Punto R y cargalo acá. Son dos minutos.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          guardar()
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pesaje-partido">Partido</Label>
            <Input
              id="pesaje-partido"
              placeholder={`Ej.: Fecha 12, ${commerce.name} de local`}
              maxLength={60}
              value={partido}
              onChange={(e) => setPartido(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pesaje-fecha">Fecha</Label>
            <Input id="pesaje-fecha" type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pesaje-punto">Punto R</Label>
            <select
              id="pesaje-punto"
              value={punto?.id ?? ''}
              onChange={(e) => setPuntoId(e.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground"
            >
              {puntosDelClub.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="pesaje-kilos">Kilos</Label>
            <Input
              id="pesaje-kilos"
              inputMode="decimal"
              placeholder="Ej.: 12,5"
              value={kilos}
              onChange={(e) => setKilos(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {kilosValidos(kg)
                ? `≈ ${formatNumber(Math.round(kg * TAPITAS_POR_KILO))} tapitas, a ${TAPITAS_POR_KILO} por kilo`
                : 'Lo que marca la balanza, con la bolsa del Punto R entera'}
            </p>
          </div>
        </div>
        <Button type="submit" block size="lg">
          <Scale size={18} /> Guardar pesaje
        </Button>
      </form>

      <section aria-labelledby="pesajes-cargados" className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 id="pesajes-cargados" className="font-bold">
          Pesajes cargados
        </h2>
        {mios.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Todavía no cargaste ninguno. El primero completa la etapa «Pesaje del lote» en el recorrido que ve la hinchada.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {mios.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.partido}</p>
                  <p className="text-xs text-muted-foreground">
                    {fechaCorta(p.fecha)} · {p.puntoNombre}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <p className="font-marcador text-lg font-bold tabular-nums">
                      {p.kilos.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg
                    </p>
                    <p className="text-xs text-muted-foreground">{formatNumber(p.tapitas)} tapitas</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    aria-label={`Eliminar el pesaje de ${p.partido}`}
                    onClick={() => quitar(p.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
