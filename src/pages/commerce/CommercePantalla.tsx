import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Maximize } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { usePaletaDelClub } from '@/hooks/usePaletaDelClub'
import { usePuntosDelPanel } from '@/hooks/usePuntosDelPanel'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { conAportesDeLaSesion, nombreCorto } from '@/lib/aportesDeLaSesion'
import { topDeLaHinchada } from '@/lib/informe'
import { esDelPanel, puntosDelProducto, textoDelApoyo } from '@/lib/productosDelClub'
import { qrPngDataUrl } from '@/lib/qr'
import { esInstitucion } from '@/lib/vocabulario'
import { formatNumber, pct, pointDeepLink } from '@/lib/utils'
import { BancoDeTapitas } from '@/components/features/BancoDeTapitas'
import { EscudoDelPanel } from '@/components/features/EscudoDelPanel'

/** Cada cuánto pasa al producto siguiente, si el club tiene más de uno. */
export const SEGUNDOS_POR_PRODUCTO = 12

/** El QR de un Punto R, como imagen: se arma en el navegador. */
function useQr(valor: string | undefined) {
  const [src, setSrc] = useState<string>()
  useEffect(() => {
    if (!valor) return
    let vigente = true
    qrPngDataUrl(valor)
      .then((url) => vigente && setSrc(url))
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [valor])
  return valor ? src : undefined
}

/**
 * La pantalla del estadio: lo que el club pasaría en el entretiempo, en la pantalla gigante o en un
 * televisor de la sede. El marcador de tapitas, el producto que se llena, los que más aportan y el
 * QR del Punto R. Ocupa toda la pantalla, sin el menú del panel; si el club tiene más de un
 * producto, pasa de uno a otro. Es de la demo: el piloto la alimenta con los aportes reales.
 */
export default function CommercePantalla() {
  usePaletaDelClub()
  const reducir = useReducedMotion()
  const commerce = useSessionStore((s) => s.commerce)
  const nombreDelHincha = useSessionStore((s) => s.user?.name)
  const actividad = useActivityStore((s) => s.sessionContributions)
  const creados = useCommerceProductsStore((s) => s.creados)
  const { data: proyectos } = useApi(() => api.getProjects(), [creados])
  const { points: puntos } = usePuntosDelPanel()
  const [indice, setIndice] = useState(0)

  const productos = (proyectos ?? [])
    .filter((p) => p.sponsorId === commerce?.id && p.illustration === 'bench')
    // El banco del club primero; después lo que publicó, del más viejo al más nuevo.
    .sort((a, b) => Number(esDelPanel(a)) - Number(esDelPanel(b)) || (a.creadoEn ?? '').localeCompare(b.creadoEn ?? ''))
    .map((p) => conAportesDeLaSesion(p, actividad, nombreDelHincha))
  const cuantos = productos.length

  useEffect(() => {
    if (cuantos < 2) return
    const id = window.setInterval(() => setIndice((i) => i + 1), SEGUNDOS_POR_PRODUCTO * 1000)
    return () => window.clearInterval(id)
  }, [cuantos])

  const producto = cuantos > 0 ? productos[indice % cuantos] : undefined
  const punto = producto ? puntosDelProducto(producto, puntos ?? [], creados)[0] : undefined
  const qr = useQr(punto ? pointDeepLink(punto.id) : undefined)

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio" replace />

  const top = producto
    ? topDeLaHinchada([producto], 5, nombreDelHincha ? nombreCorto(nombreDelHincha) : undefined)
    : []
  const apoyo = producto && textoDelApoyo(producto)

  return (
    <div className="flex min-h-dvh flex-col bg-eco-950 px-6 py-5 text-white sm:px-10 sm:py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <EscudoDelPanel className="h-12 w-12 text-xl sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold sm:text-2xl">{commerce.name}</p>
            <p className="text-sm font-semibold text-eco-300">Reciclaje con la hinchada</p>
          </div>
        </div>
        <div data-no-imprimir className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-eco-100">Datos de ejemplo</span>
          <button
            type="button"
            onClick={() => void document.documentElement.requestFullscreen?.().catch(() => {})}
            className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20 sm:inline-flex"
          >
            <Maximize size={15} /> Pantalla completa
          </button>
          <Link
            to="/comercio"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
          >
            <ArrowLeft size={15} /> Panel
          </Link>
        </div>
      </header>

      {!producto ? (
        <p className="m-auto text-xl text-eco-200">Cargando…</p>
      ) : (
        // Cada producto entra con un fundido; el anterior se va al instante (sin esperar una salida).
        <motion.main
            key={producto.id}
            initial={reducir ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-4 grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12"
          >
            <section aria-label={producto.title}>
              <p className="text-lg font-bold uppercase tracking-wide text-eco-300">La hinchada construye</p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{producto.title}</h1>
              {apoyo && <p className="mt-2 text-lg font-semibold text-eco-200">{apoyo}</p>}
              <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-2">
                <p className="font-marcador text-7xl font-bold leading-none tabular-nums sm:text-[clamp(4.5rem,13vh,9rem)]">
                  {formatNumber(producto.collectedUnits)}
                </p>
                <p className="pb-2 text-2xl font-bold text-eco-200 sm:text-3xl">
                  tapitas · {pct(producto.collectedUnits, producto.goalUnits)}%
                </p>
              </div>
              <p className="mt-1 text-lg text-eco-300">de {formatNumber(producto.goalUnits)} para completarlo</p>
              {/* Alto atado a la pantalla: en un televisor todo entra sin scroll. */}
              <div className="mt-5 rounded-3xl bg-cancha p-4 sm:p-6">
                <BancoDeTapitas
                  className="mx-auto h-[30vh] max-h-[30rem] w-auto max-w-full"
                  forma={producto.forma}
                  progreso={producto.goalUnits > 0 ? producto.collectedUnits / producto.goalUnits : 0}
                  propias={0}
                />
              </div>
            </section>

            <aside className="space-y-6">
              {top.length === 0 && (
                <p className="rounded-3xl bg-white/10 p-6 text-2xl font-bold leading-snug">
                  Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!
                </p>
              )}
              {top.length > 0 && (
                <section aria-labelledby="pantalla-top">
                  <h2 id="pantalla-top" className="text-lg font-bold uppercase tracking-wide text-eco-300">
                    Los que más aportan
                  </h2>
                  <ol className="mt-3 space-y-2">
                    {top.map((c, i) => (
                      <li key={c.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3">
                        <span className="flex items-center gap-3 text-xl font-bold">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-eco-500 font-marcador text-lg text-eco-950">
                            {i + 1}
                          </span>
                          {c.name}
                        </span>
                        <span className="font-marcador text-2xl font-bold tabular-nums">{formatNumber(c.units)}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {punto && (
                <section className="flex items-center gap-5 rounded-3xl bg-white p-4 text-eco-950">
                  {qr ? (
                    <img src={qr} alt={`QR del ${punto.name}`} className="h-32 w-32 shrink-0 sm:h-36 sm:w-36" />
                  ) : (
                    <span className="h-32 w-32 shrink-0 rounded-xl bg-eco-50 sm:h-36 sm:w-36" />
                  )}
                  <div>
                    <p className="text-2xl font-extrabold leading-tight">Sumá tus tapitas</p>
                    <p className="mt-1 text-base font-semibold">Dejalas en el {punto.name} y escaneá el QR.</p>
                  </div>
                </section>
              )}
            </aside>
          </motion.main>
      )}

      {cuantos > 1 && (
        <div className="mt-6 flex justify-center gap-2" aria-hidden>
          {productos.map((p, i) => (
            <span
              key={p.id}
              className={i === indice % cuantos ? 'h-2.5 w-8 rounded-full bg-eco-400' : 'h-2.5 w-2.5 rounded-full bg-white/30'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
