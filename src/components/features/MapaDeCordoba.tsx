import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import type { RecyclePoint, Sponsor } from '@/types'
import { CENTRO_Y_NUEVA_CORDOBA, prefiereMenosMovimiento, recuadroDe, teselasDelMapa, type Lugar } from '@/lib/mapa'

/** Qué encuadrar: el Centro y Nueva Córdoba, o todos los puntos. `n` sube para repetir el mismo encuadre. */
export type Vista = { tipo: 'centro' | 'todos'; n: number }

interface Props {
  puntos: RecyclePoint[]
  marcas: Map<string, Sponsor>
  elegido: string | null
  onElegir: (id: string) => void
  miUbicacion: Lugar | null
  vista: Vista
  /** Sube cada vez que se elige un punto, también si es el mismo: así el mapa vuelve a volar hasta él. */
  vuelo: number
}

// Leaflet directo, sin react-leaflet: su licencia (Hippocratic 2.1) no es una de código abierto estándar y pone
// condiciones de uso que habría que revisar antes del piloto. Leaflet es BSD-2.
const TESELAS = teselasDelMapa(import.meta.env.VITE_TESELAS_URL, import.meta.env.VITE_TESELAS_ATRIBUCION)

/** El pin: un círculo del color de la marca con borde blanco; el elegido, más grande y con un halo. */
function iconoDelPunto(color: string, elegido: boolean): L.DivIcon {
  const lado = elegido ? 40 : 30
  const halo = elegido ? `box-shadow:0 0 0 6px ${color}55,0 4px 10px rgba(0,0,0,.35);` : 'box-shadow:0 2px 6px rgba(0,0,0,.3);'
  return L.divIcon({
    className: '',
    iconSize: [lado, lado],
    iconAnchor: [lado / 2, lado / 2],
    html: `<span style="display:grid;place-items:center;width:${lado}px;height:${lado}px;border-radius:9999px;background:${color};border:3px solid #fff;${halo}"><span style="width:${lado / 3}px;height:${lado / 3}px;border-radius:9999px;background:#fff"></span></span>`,
  })
}

/**
 * Cómo se mueve el mapa en este momento: con las opciones que se le dan (un vuelo de 0,6 s, por ejemplo) o, si la persona
 * pidió «reducir movimiento» en su sistema, de un salto. Cada llamada arma un objeto nuevo: Leaflet escribe sobre el que
 * recibe (`setView` le agrega `zoom` y `pan`), así que uno compartido se iría ensuciando.
 */
function movimiento(animado: L.ZoomPanOptions = {}): L.ZoomPanOptions {
  return prefiereMenosMovimiento() ? { animate: false } : animado
}

/**
 * El mapa de Córdoba con los puntos de la red (Leaflet). Arranca en el Centro y Nueva Córdoba. Tocar un
 * pin lo elige; la pantalla muestra su tarjeta.
 */
export default function MapaDeCordoba({ puntos, marcas, elegido, onElegir, miUbicacion, vista, vuelo }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const pines = useRef<L.LayerGroup | null>(null)
  const ubicacion = useRef<L.CircleMarker | null>(null)
  // El clic de un pin llama a la última `onElegir` sin tener que rearmar los pines cuando la pantalla la cambia.
  const elegir = useRef(onElegir)
  useEffect(() => {
    elegir.current = onElegir
  }, [onElegir])

  const iconos = useMemo(() => {
    const m = new Map<string, L.DivIcon>()
    for (const p of puntos) m.set(p.id, iconoDelPunto(marcas.get(p.sponsorId)?.brandColor ?? '#059669', p.id === elegido))
    return m
  }, [puntos, marcas, elegido])

  // El mapa se arma una vez y se libera al salir de la pantalla.
  useEffect(() => {
    const m = L.map(contenedor.current!, { scrollWheelZoom: true, zoomControl: false })
    m.fitBounds(CENTRO_Y_NUEVA_CORDOBA)
    L.tileLayer(TESELAS.url, { attribution: TESELAS.atribucion, maxZoom: 19 }).addTo(m)
    // El control de zoom que trae Leaflet tiene los títulos en inglés.
    L.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(m)
    mapa.current = m
    pines.current = L.layerGroup().addTo(m)
    return () => {
      m.remove()
      mapa.current = pines.current = ubicacion.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Un pin por punto; se rearman cuando cambian los puntos, las marcas o el elegido.
  useEffect(() => {
    const capa = pines.current!
    capa.clearLayers()
    for (const p of puntos) {
      L.marker([p.lat, p.lng], { icon: iconos.get(p.id)!, title: p.name, alt: p.name, zIndexOffset: p.id === elegido ? 1000 : 0 })
        .on('click', () => elegir.current(p.id))
        .addTo(capa)
    }
  }, [puntos, iconos, elegido])

  useEffect(() => {
    ubicacion.current?.remove()
    ubicacion.current = miUbicacion
      ? L.circleMarker([miUbicacion.lat, miUbicacion.lng], { radius: 8, color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(mapa.current!)
      : null
    if (miUbicacion) mapa.current!.flyTo([miUbicacion.lat, miUbicacion.lng], 15, movimiento({ duration: 0.6 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miUbicacion?.lat, miUbicacion?.lng])

  useEffect(() => {
    const recuadro = vista.tipo === 'todos' ? recuadroDe(puntos) : CENTRO_Y_NUEVA_CORDOBA
    // `maxZoom`: con un solo punto el recuadro no tiene área y, sin tope, el mapa se acercaría al máximo.
    if (recuadro) mapa.current!.fitBounds(recuadro, { padding: [28, 28], maxZoom: 16, ...movimiento() })
    // Sólo cuando se pide un encuadre: si dependiera de `puntos`, filtrar movería el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista.n, vista.tipo])

  useEffect(() => {
    const p = puntos.find((x) => x.id === elegido)
    if (p) mapa.current!.flyTo([p.lat, p.lng], Math.max(mapa.current!.getZoom(), 15), movimiento({ duration: 0.6 }))
    // Con cada toque (`vuelo`), también sobre el punto que ya está elegido: si el hincha movió el mapa, vuelve a él.
    // Filtrar, en cambio, no lo mueve: por eso no depende de `puntos`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegido, vuelo])

  return <div ref={contenedor} className="h-full w-full" />
}
