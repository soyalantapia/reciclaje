import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import type { FormaDelProducto } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { TAPITAS_POR_KILO } from '@/lib/metrics'
import { FORMAS, crearProducto, kilosDeLaMeta, puntosDelProducto } from '@/lib/productosDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { cn, formatNumber, pct, shortCode } from '@/lib/utils'
import { BancoDeTapitas } from '@/components/features/BancoDeTapitas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'

/** La forma que se propone al abrir «Nuevo producto»: algo distinto del banco que ya está. */
const FORMA_INICIAL: FormaDelProducto = 'butacas'
const META_INICIAL = '500'
const nombrePropuesto = (forma: FormaDelProducto) => FORMAS.find((f) => f.forma === forma)?.nombrePorDefecto ?? ''

/**
 * Lo que construye la hinchada (E1.3 del piloto): el banco del club y los productos que el club
 * publica, cada uno con su meta en kilos y su Punto R. Sólo para un club o un estadio.
 */
export default function CommerceProducts() {
  const commerce = useSessionStore((s) => s.commerce)
  const nombreDelHincha = useSessionStore((s) => s.user?.name)
  // Lo que la hinchada aportó en esta sesión (mismo navegador) suma al avance de cada producto.
  const actividad = useActivityStore((s) => s.sessionContributions)
  const creados = useCommerceProductsStore((s) => s.creados)
  const agregar = useCommerceProductsStore((s) => s.agregar)
  const quitar = useCommerceProductsStore((s) => s.quitar)
  const { data: proyectos, loading } = useApi(() => api.getProjects(), [])
  const { data: puntos } = useApi(() => api.getPoints(), [])

  const [abierto, setAbierto] = useState(false)
  const [forma, setForma] = useState<FormaDelProducto>(FORMA_INICIAL)
  const [nombre, setNombre] = useState(nombrePropuesto(FORMA_INICIAL))
  const [metaKg, setMetaKg] = useState(META_INICIAL)
  const [puntoId, setPuntoId] = useState('')

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio" replace />

  const mios = creados.filter((p) => p.sponsorId === commerce.id)
  const delClub = (proyectos ?? []).filter(
    (p) => p.sponsorId === commerce.id && p.illustration === 'bench' && !mios.some((m) => m.id === p.id),
  )
  const lista = [...delClub, ...mios].map((p) => conAportesDeLaSesion(p, actividad, nombreDelHincha))
  const puntosDelClub = (puntos ?? []).filter((p) => p.sponsorId === commerce.id)
  // De entrada, el último Punto R del club: el primero (el estadio) junta para el banco.
  const punto = puntosDelClub.find((p) => p.id === puntoId) ?? puntosDelClub.at(-1)
  const kilos = Math.round(Number(metaKg) || 0)

  function elegirForma(f: FormaDelProducto) {
    setForma(f)
    setNombre(nombrePropuesto(f))
  }

  function publicar() {
    if (!nombre.trim()) return toast.error('Poné el nombre del producto')
    if (kilos < 1) return toast.error('La meta va en kilos: poné 1 o más')
    if (!punto) return toast.error('Elegí el Punto R donde se junta')
    // Un producto abierto por punto: si no, no se sabría a cuál va un aporte.
    const ocupado = mios.find((p) => p.puntoId === punto.id)
    if (ocupado) {
      return toast.error(`El ${punto.name} ya junta para «${ocupado.title}». Elegí otro Punto R o eliminá ese producto.`)
    }
    agregar(
      crearProducto({
        id: `pr_nuevo_${shortCode(6)}`,
        forma,
        nombre,
        metaKg: kilos,
        punto,
        club: { id: commerce!.id, nombre: commerce!.name },
        creadoEn: new Date().toISOString(),
      }),
    )
    setAbierto(false)
    setForma(FORMA_INICIAL)
    setNombre(nombrePropuesto(FORMA_INICIAL))
    setMetaKg(META_INICIAL)
    setPuntoId('')
    toast.success('Publicado: la hinchada ya lo ve en su inicio')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">Lo que construye tu hinchada con sus tapitas.</p>
        </div>
        <Button size="sm" onClick={() => setAbierto(true)}>
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      {loading && !proyectos && <Skeleton className="h-48 w-full" />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((p) => {
          const delPanel = mios.some((m) => m.id === p.id)
          const dondeJunta = puntosDelProducto(p, puntos ?? [], mios)
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="rounded-xl bg-cancha p-3">
                <BancoDeTapitas
                  forma={p.forma}
                  progreso={p.goalUnits > 0 ? p.collectedUnits / p.goalUnits : 0}
                  propias={0}
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <p className="font-bold leading-tight">{p.title}</p>
                {delPanel && <Badge variant="xp">Nuevo</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Meta: {formatNumber(kilosDeLaMeta(p))} kg · {formatNumber(p.goalUnits)} tapitas
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0" />
                {dondeJunta.length > 0 ? dondeJunta.map((pt) => pt.name).join(', ') : 'Sin Punto R'}
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-marcador text-2xl font-bold tabular-nums">{formatNumber(p.collectedUnits)}</span>
                <span className="text-sm font-bold text-eco-700 dark:text-eco-300">
                  {pct(p.collectedUnits, p.goalUnits)}%
                </span>
              </div>
              {delPanel && (
                <Button size="sm" variant="ghost" className="mt-1 text-danger" onClick={() => quitar(p.id)}>
                  <Trash2 size={14} /> Eliminar
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Nuevo producto">
        <div className="space-y-4">
          <div>
            <Label>¿Qué construye la hinchada?</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS.map((f) => (
                <button
                  key={f.forma}
                  type="button"
                  aria-pressed={f.forma === forma}
                  onClick={() => elegirForma(f.forma)}
                  className={cn(
                    'rounded-xl border-2 p-2 text-left text-sm font-semibold transition-colors',
                    f.forma === forma
                      ? 'border-eco-600 bg-eco-50 dark:bg-eco-900/30'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  {/* El dibujo es un ícono de la forma: no representa ninguna cantidad. */}
                  <span aria-hidden className="block">
                    <BancoDeTapitas forma={f.forma} progreso={0.4} propias={0} />
                  </span>
                  <span className="mt-1 block">{f.nombre}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="producto-nombre">Nombre</Label>
            <Input
              id="producto-nombre"
              placeholder="Ej.: Cestos para la tribuna"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="producto-meta">Meta en kilos</Label>
            <Input
              id="producto-meta"
              type="number"
              inputMode="numeric"
              min={1}
              value={metaKg}
              onChange={(e) => setMetaKg(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ≈ {formatNumber(kilos * TAPITAS_POR_KILO)} tapitas, a {TAPITAS_POR_KILO} por kilo
            </p>
          </div>
          <div>
            <Label htmlFor="producto-punto">Punto R</Label>
            <select
              id="producto-punto"
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
            <p className="mt-1 text-xs text-muted-foreground">
              Desde que lo publiques, lo que la hinchada deje en este Punto R suma a este producto.
            </p>
          </div>
          <Button block size="lg" onClick={publicar}>
            Publicar para la hinchada
          </Button>
        </div>
      </Modal>
    </div>
  )
}
