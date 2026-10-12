import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import type { RecyclePoint, Sponsor } from '@/types'
import { CENTRO_Y_NUEVA_CORDOBA, recuadroDe, type Lugar } from '@/lib/mapa'

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

// Las teselas estándar de OpenStreetMap. La atribución es obligatoria. Las claras de CARTO piden clave desde fines
// de septiembre de 2026: sin ella pintan «API KEY REQUIRED» sobre todo el mapa (verificado el 11/10/2026). Para
// volver a ellas se pide una clave gratis en carto.com/basemaps/apikey y va como `?key=` en la URL, con «© CARTO»
// en la atribución. Para el piloto, con tráfico real, hace falta un proveedor con plan comercial. Se cambia acá.
const TESELAS = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

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

/** Encuadra, vuela al elegido y a tu ubicación. Vive adentro del mapa para tener `useMap`. */
function ControlDeLaVista({ puntos, elegido, miUbicacion, vista, vuelo }: Pick<Props, 'puntos' | 'elegido' | 'miUbicacion' | 'vista' | 'vuelo'>) {
  const mapa = useMap()

  useEffect(() => {
    const recuadro = vista.tipo === 'todos' ? recuadroDe(puntos) : CENTRO_Y_NUEVA_CORDOBA
    // `maxZoom`: con un solo punto el recuadro no tiene área y, sin tope, el mapa se acercaría al máximo.
    if (recuadro) mapa.fitBounds(recuadro, { padding: [28, 28], maxZoom: 16 })
    // Sólo cuando se pide un encuadre: si dependiera de `puntos`, filtrar movería el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista.n, vista.tipo])

  useEffect(() => {
    const p = puntos.find((x) => x.id === elegido)
    if (p) mapa.flyTo([p.lat, p.lng], Math.max(mapa.getZoom(), 15), { duration: 0.6 })
    // Con cada toque (`vuelo`), también sobre el punto que ya está elegido: si el hincha movió el mapa, vuelve a él.
    // Filtrar, en cambio, no lo mueve: por eso no depende de `puntos`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegido, vuelo])

  useEffect(() => {
    if (miUbicacion) mapa.flyTo([miUbicacion.lat, miUbicacion.lng], 15, { duration: 0.6 })
  }, [mapa, miUbicacion])

  return null
}

/**
 * El mapa de Córdoba con los puntos de la red (Leaflet). Arranca en el Centro y Nueva Córdoba. Tocar un
 * pin lo elige; la pantalla muestra su tarjeta.
 */
export default function MapaDeCordoba({ puntos, marcas, elegido, onElegir, miUbicacion, vista, vuelo }: Props) {
  const iconos = useMemo(() => {
    const m = new Map<string, L.DivIcon>()
    for (const p of puntos) m.set(p.id, iconoDelPunto(marcas.get(p.sponsorId)?.brandColor ?? '#059669', p.id === elegido))
    return m
  }, [puntos, marcas, elegido])

  return (
    <MapContainer bounds={CENTRO_Y_NUEVA_CORDOBA} scrollWheelZoom zoomControl={false} className="h-full w-full">
      <TileLayer url={TESELAS} attribution={ATRIBUCION} maxZoom={19} />
      {/* El control de zoom que trae Leaflet tiene los títulos en inglés. */}
      <ZoomControl zoomInTitle="Acercar" zoomOutTitle="Alejar" />
      {puntos.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={iconos.get(p.id)!}
          title={p.name}
          alt={p.name}
          zIndexOffset={p.id === elegido ? 1000 : 0}
          eventHandlers={{ click: () => onElegir(p.id) }}
        />
      ))}
      {miUbicacion && (
        <CircleMarker
          center={[miUbicacion.lat, miUbicacion.lng]}
          radius={8}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
        />
      )}
      <ControlDeLaVista puntos={puntos} elegido={elegido} miUbicacion={miUbicacion} vista={vista} vuelo={vuelo} />
    </MapContainer>
  )
}
