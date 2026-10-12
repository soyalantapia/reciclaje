import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Expand, LocateFixed, Navigation, Recycle, X } from 'lucide-react'
import type { MaterialType, Sponsor } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { cn, MATERIAL_LABEL } from '@/lib/utils'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import {
  distanciaKm, enlaceComoLlegar, estaEnCordoba, filtrarPuntos, materialesDeLaRed, ordenarPuntos, textoDeDistancia,
  type Filtros, type Lugar,
} from '@/lib/mapa'
import type { Vista } from '@/components/features/MapaDeCordoba'
import { PointCard } from '@/components/features/PointCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'

// Leaflet viene en su propio pedazo: la pantalla (chips y lista) se ve antes de que llegue el mapa.
const MapaDeCordoba = lazy(() => import('@/components/features/MapaDeCordoba'))

const SIN_FILTROS: Filtros = { abiertos: false, material: null }

/** El `code` de `GeolocationPositionError` cuando se negó el permiso: el único error que el hincha puede arreglar por su cuenta. */
const PERMISO_DENEGADO = 1
/**
 * Adentro de un local el GPS no llega: se pide la ubicación aproximada (por wifi y antenas), que alcanza para ordenar
 * puntos, con 10 s de espera, y se acepta una de hasta 1 min si el navegador ya la tiene.
 */
const OPCIONES_DE_UBICACION: PositionOptions = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }

export default function MapPoints() {
  const navigate = useNavigate()
  const { data: points, error, reload } = useApi(() => api.getPoints(), [])
  const { data: sponsors } = useApi(() => api.getSponsors(), [])
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [elegido, setElegido] = useState<string | null>(null)
  const [miUbicacion, setMiUbicacion] = useState<Lugar | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [vista, setVista] = useState<Vista>({ tipo: 'centro', n: 0 })
  /** Cuántas veces se eligió un punto: el mapa vuela con cada una, también si es el que ya estaba elegido. */
  const [vuelo, setVuelo] = useState(0)
  const regionDelMapa = useRef<HTMLDivElement>(null)

  const marcas = useMemo(() => {
    const m = new Map<string, Sponsor>()
    sponsors?.forEach((s) => m.set(s.id, s))
    return m
  }, [sponsors])

  const materiales = useMemo(() => materialesDeLaRed(points ?? []), [points])
  const visibles = useMemo(() => filtrarPuntos(points ?? [], filtros), [points, filtros])
  const ordenados = useMemo(() => ordenarPuntos(visibles, miUbicacion), [visibles, miUbicacion])
  const punto = visibles.find((p) => p.id === elegido) ?? null
  const redVacia = points?.length === 0

  function alternarMaterial(m: MaterialType) {
    setFiltros((f) => ({ ...f, material: f.material === m ? null : m }))
  }

  /** Elegir un punto abre su tarjeta y manda al mapa hasta él (también si ya era el elegido: sirve para volver a él). */
  function elegir(id: string) {
    setElegido(id)
    setVuelo((n) => n + 1)
  }

  /**
   * Desde la lista. En el celular el mapa queda arriba, fuera de la pantalla, y sin esto el hincha toca un punto y no ve
   * pasar nada: se sube hasta el mapa. `nearest` mueve lo justo y, si el mapa ya se ve (en la compu está fijo), nada.
   */
  function elegirDesdeLaLista(id: string) {
    elegir(id)
    // `?.()`: jsdom no trae `scrollIntoView`.
    regionDelMapa.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }

  function cercaMio() {
    if (!navigator.geolocation) {
      toast.error('Este navegador no comparte la ubicación.')
      return
    }
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false)
        const lugar = { lat: coords.latitude, lng: coords.longitude }
        if (!estaEnCordoba(lugar)) {
          toast.info('Estás lejos de Córdoba: te mostramos la red igual.')
          return
        }
        setMiUbicacion(lugar)
      },
      (error) => {
        setBuscando(false)
        toast.error(
          error.code === PERMISO_DENEGADO
            ? 'No pudimos ubicarte: revisá el permiso de ubicación del navegador.'
            : 'No pudimos ubicarte ahora. Probá de nuevo en un momento.',
        )
      },
      OPCIONES_DE_UBICACION,
    )
  }

  function reciclarAca(id: string) {
    // Como el inicio: el punto queda pendiente y Escanear lo toma ya elegido.
    sessionStorage.setItem(claveDeAlmacenamiento('scan-point'), id)
    navigate('/escanear')
  }

  if (error && !points) return <ErrorState message={error} onRetry={reload} />

  const chip = (activo: boolean) =>
    cn(
      'shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
      activo ? 'border-eco-600 bg-eco-600 text-white' : 'border-border bg-card text-muted-foreground hover:bg-muted',
    )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Puntos adheridos</h1>
        <p className="text-sm text-muted-foreground">Dónde dejar tus tapitas en Córdoba: tocá un punto para ver cómo llegar.</p>
      </div>

      {/* Los filtros: filtran el mapa y la lista juntos */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtros">
        <button type="button" aria-pressed={filtros.abiertos} className={chip(filtros.abiertos)} onClick={() => setFiltros((f) => ({ ...f, abiertos: !f.abiertos }))}>
          Abiertos ahora
        </button>
        {materiales.map((m) => (
          <button key={m} type="button" aria-pressed={filtros.material === m} className={chip(filtros.material === m)} onClick={() => alternarMaterial(m)}>
            {MATERIAL_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/*
          El mapa: `isolate` encierra los z-index de Leaflet, que si no pasan por encima del menú. `scroll-mt-20` deja
          sitio al encabezado fijo del celular cuando la lista sube hasta él; en la compu no hay encabezado y el mapa
          queda fijo a 24 px del borde, así que el margen se anula (si no, cada toque en la lista movería la página 56 px).
        */}
        <div
          ref={regionDelMapa}
          role="region"
          aria-label="Mapa de Córdoba"
          className="relative isolate h-[48vh] min-h-80 w-full scroll-mt-20 overflow-hidden rounded-2xl border border-border bg-eco-50 dark:bg-eco-950 lg:sticky lg:top-6 lg:col-span-3 lg:h-[70vh] lg:scroll-mt-0 lg:self-start"
        >
          <Suspense fallback={<div className="h-full w-full bg-eco-50 dark:bg-eco-950" />}>
            <MapaDeCordoba puntos={visibles} marcas={marcas} elegido={elegido} onElegir={elegir} miUbicacion={miUbicacion} vista={vista} vuelo={vuelo} />
          </Suspense>

          <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={buscando} onClick={cercaMio}>
              <LocateFixed size={15} /> {buscando ? 'Buscando…' : 'Cerca mío'}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setVista((v) => ({ tipo: 'todos', n: v.n + 1 }))}>
              <Expand size={15} /> Ver todos
            </Button>
          </div>

          {punto && (
            <section
              aria-label={punto.name}
              className="absolute inset-x-3 bottom-6 z-[1000] rounded-2xl bg-card/95 p-4 shadow-xl backdrop-blur"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold leading-tight">{punto.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {punto.address} · {marcas.get(punto.sponsorId)?.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold">
                    <span className={punto.openNow ? 'text-eco-700 dark:text-eco-300' : 'text-muted-foreground'}>
                      {punto.openNow ? 'Abierto ahora' : 'Cerrado'}
                    </span>
                    {miUbicacion && ` · ${textoDeDistancia(distanciaKm(miUbicacion, punto))}`}
                    {' · '}
                    {punto.acceptedMaterials.map((m) => MATERIAL_LABEL[m]).join(', ')}
                  </p>
                </div>
                <button type="button" aria-label="Cerrar" className="rounded-full p-1 text-muted-foreground hover:bg-muted" onClick={() => setElegido(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={enlaceComoLlegar(punto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
                >
                  <Navigation size={15} /> Cómo llegar
                </a>
                <Button type="button" size="sm" onClick={() => reciclarAca(punto.id)}>
                  <Recycle size={15} /> Reciclar acá
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* La lista: va con el mapa. Tocar un punto lo elige y el mapa vuela hasta él */}
        <div className="lg:col-span-2">
          {redVacia ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              Todavía no hay puntos en la red.
            </div>
          ) : points && !visibles.length ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              Ningún punto cumple esos filtros.
              <div className="mt-3">
                <Button type="button" size="sm" variant="secondary" onClick={() => setFiltros(SIN_FILTROS)}>
                  Ver todos
                </Button>
              </div>
            </div>
          ) : (
            <ul aria-label="Puntos de la red" className="space-y-2">
              {ordenados.map((p) => (
                <li key={p.id}>
                  <PointCard
                    point={p}
                    sponsor={marcas.get(p.sponsorId)}
                    elegido={p.id === elegido}
                    distancia={miUbicacion ? textoDeDistancia(distanciaKm(miUbicacion, p)) : undefined}
                    onClick={() => elegirDesdeLaLista(p.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
