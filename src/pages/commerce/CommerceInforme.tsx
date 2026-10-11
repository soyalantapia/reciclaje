import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, Download, Printer } from 'lucide-react'
import type { TraceEvent } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useMetricasDelPanel } from '@/hooks/useMetricasDelPanel'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { conAporteDeLaSesionEnLaTraza, conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { estadoDelRecorrido } from '@/lib/recorridoDeLaTapita'
import { esDelPanel, kilosDeLaMeta, puntosDelProducto } from '@/lib/productosDelClub'
import { ETAPAS_DEL_PILOTO, SIN_PESAJES, topDeLaHinchada } from '@/lib/informe'
import { posicionEnLaRed, textoDePosicion } from '@/lib/posicionEnLaRed'
import { AVISO_DE_EJEMPLO, csvDelReporte } from '@/lib/reporte'
import { esInstitucion } from '@/lib/vocabulario'
import { downloadBlob, formatNumber, pct } from '@/lib/utils'
import { BancoDeTapitas } from '@/components/features/BancoDeTapitas'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** Al imprimir, el informe sale en claro aunque la app esté en modo oscuro: en papel, el texto claro no se lee. */
function useImprimirEnClaro() {
  useEffect(() => {
    const html = document.documentElement
    let eraOscuro = false
    // Si llegan dos avisos de imprimir seguidos, el segundo no pisa lo que recordó el primero.
    const antes = () => {
      if (!html.classList.contains('dark')) return
      eraOscuro = true
      html.classList.remove('dark')
    }
    const despues = () => {
      if (eraOscuro) html.classList.add('dark')
      eraOscuro = false
    }
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', despues)
      despues()
    }
  }, [])
}

/** Mientras el informe está abierto, la pestaña lo nombra: es el nombre que propone «Guardar como PDF». */
function useTituloDelDocumento(titulo: string | undefined) {
  useEffect(() => {
    if (!titulo) return
    const anterior = document.title
    document.title = titulo
    return () => {
      document.title = anterior
    }
  }, [titulo])
}

/**
 * El informe para la Comisión Directiva (E4.2 del piloto): una página del panel lista para imprimir
 * o guardar como PDF, con lo que el panel ya sabe. «Partido por partido» muestra su estructura sin
 * números: se completa con los pesajes, que llegan en la etapa 1 del piloto.
 */
export default function CommerceInforme() {
  const commerce = useSessionStore((s) => s.commerce)
  const nombreDelHincha = useSessionStore((s) => s.user?.name)
  const actividad = useActivityStore((s) => s.sessionContributions)
  const creados = useCommerceProductsStore((s) => s.creados)
  // Las mismas métricas que el resumen y los reportes, con lo que la hinchada hizo en esta sesión.
  const { m, points, loading, error, reload } = useMetricasDelPanel()
  const { data: red } = useApi(() => api.getSponsors(), [])
  const { data: proyectos } = useApi(() => api.getProjects(), [creados])
  useImprimirEnClaro()
  useTituloDelDocumento(
    commerce && esInstitucion(commerce.category) ? `Informe para la Comisión Directiva · ${commerce.name}` : undefined,
  )

  // Los productos del club, con lo que la hinchada aportó en esta sesión.
  const productos = (proyectos ?? [])
    .filter((p) => p.sponsorId === commerce?.id && p.illustration === 'bench')
    .map((p) => conAportesDeLaSesion(p, actividad, nombreDelHincha))
  // Lo que sigue lo dice el recorrido del banco del club.
  const principal = productos.find((p) => !esDelPanel(p)) ?? productos[0]
  const { data: traza } = useApi(
    () => (principal ? api.getProjectTrace(principal.id) : Promise.resolve<TraceEvent[]>([])),
    [principal?.id],
  )
  const eventos = traza && principal ? conAporteDeLaSesionEnLaTraza(traza, principal, actividad) : []
  const { siguiente } = estadoDelRecorrido(eventos)
  const proxima = siguiente === null ? undefined : eventos[siguiente]

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio/reportes" replace />
  if (error && !m) return <ErrorState message={error} onRetry={reload} />
  if (loading || !m) return <Skeleton className="h-96 w-full" />

  // Con el mes completo: es un documento para la comisión, no una fila de una lista.
  const emitido = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const posicion = red ? textoDePosicion(posicionEnLaRed(commerce.id, m.greenScore, red)) : undefined
  const maxMes = Math.max(1, ...m.monthlySeries.map((s) => s.value))
  const maxPunto = Math.max(1, ...m.byPoint.map((p) => p.contributions))
  const top = topDeLaHinchada(productos)
  const numeros: [string, string][] = [
    ['Kilos recuperados', formatNumber(m.kgRecovered)],
    ['Tapitas', formatNumber(m.capsRecovered)],
    ['Aportes', formatNumber(m.contributions)],
    ['Hinchas que participaron este mes', formatNumber(m.activeUsers)],
    ['Beneficios canjeados', formatNumber(m.benefitsRedeemed)],
    ['Huella Verde', `${m.greenScore} de 100`],
  ]

  function descargarCsv() {
    downloadBlob(`informe-${commerce!.slug}.csv`, csvDelReporte(m!), 'text/csv;charset=utf-8')
    toast.success('CSV descargado 📄')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 print:max-w-none">
      <div data-no-imprimir className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/comercio/reportes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-eco-700 dark:text-eco-300"
        >
          <ChevronLeft size={16} /> Reportes
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={descargarCsv}>
            <Download size={15} /> Descargar CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer size={15} /> Imprimir o guardar PDF
          </Button>
        </div>
      </div>

      <article className="space-y-6 rounded-2xl border border-border bg-card p-5 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] sm:p-8 print:rounded-none print:border-0 print:p-0">
        <header className="border-b-4 border-eco-600 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                {commerce.name} · reciclaje con la hinchada
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">Informe para la Comisión Directiva</h1>
              <p className="mt-1 text-sm text-muted-foreground">Emitido el {emitido}</p>
            </div>
            <p className="shrink-0 font-extrabold text-eco-700 dark:text-eco-300">ReciclaXP</p>
          </div>
          <p className="mt-3 rounded-lg bg-xp-50 px-3 py-2 text-xs font-semibold text-xp-700 dark:bg-xp-700/10 dark:text-xp-300">
            {AVISO_DE_EJEMPLO}
          </p>
        </header>

        <section className="break-inside-avoid">
          <h2 className="text-lg font-extrabold">En números</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {numeros.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="rounded-xl border border-border p-3">
                <dt className="text-xs font-semibold text-muted-foreground">{etiqueta}</dt>
                <dd className="font-marcador text-3xl font-bold tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>
          {posicion && <p className="mt-2 text-xs font-semibold text-eco-700 dark:text-eco-300">{posicion}</p>}
        </section>

        {productos.length > 0 && (
          <section>
            {/* La sección puede pasar de hoja entre tarjetas, pero su título no queda solo al pie */}
            <h2 className="break-after-avoid text-lg font-extrabold">Lo que construye la hinchada</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {productos.map((p) => (
                <div key={p.id} className="break-inside-avoid rounded-xl border border-border p-3">
                  <BancoDeTapitas
                    className="max-w-[16rem]"
                    forma={p.forma}
                    progreso={p.goalUnits > 0 ? p.collectedUnits / p.goalUnits : 0}
                    propias={0}
                  />
                  <p className="mt-2 font-bold leading-tight">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(p.collectedUnits)} de {formatNumber(p.goalUnits)} tapitas ·{' '}
                    {pct(p.collectedUnits, p.goalUnits)}% · meta {formatNumber(kilosDeLaMeta(p))} kg
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Junta en:{' '}
                    {puntosDelProducto(p, points ?? [], creados)
                      .map((pt) => pt.name)
                      .join(', ') || 'sin Punto R'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Etapa actual: {p.milestones.find((h) => !h.done)?.label ?? 'terminado'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="break-inside-avoid">
          <h2 id="informe-partidos" className="text-lg font-extrabold">
            Partido por partido
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table aria-labelledby="informe-partidos" className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="py-2 pr-2 font-bold">Partido</th>
                  <th scope="col" className="py-2 pr-2 font-bold">Fecha</th>
                  <th scope="col" className="py-2 pr-2 text-right font-bold">Kilos</th>
                  <th scope="col" className="py-2 pr-2 text-right font-bold">Tapitas</th>
                  <th scope="col" className="py-2 text-right font-bold">Hinchas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-4 text-center text-sm italic text-muted-foreground">
                    {SIN_PESAJES}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Aportes por mes</h2>
            <div className="mt-3 flex h-36 items-end justify-between gap-2">
              {m.monthlySeries.map((s) => (
                <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[11px] font-bold tabular-nums">{formatNumber(s.value)}</span>
                  <div
                    className="w-full rounded-t-md bg-eco-500"
                    style={{ height: `${Math.max(4, (s.value / maxMes) * 96)}px` }}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Aportes por Punto R</h2>
            <div className="mt-3 space-y-3">
              {m.byPoint.map((p) => (
                <div key={p.point}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate pr-2 font-semibold">{p.point}</span>
                    <span className="font-bold tabular-nums">{formatNumber(p.contributions)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-eco-500"
                      style={{ width: `${(p.contributions / maxPunto) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {top.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Los que más aportan</h2>
            <ol className="mt-3 divide-y divide-border">
              {top.map((c, i) => (
                <li key={c.name} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-5 font-marcador text-base font-bold text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 font-semibold">{c.name}</span>
                  <span className="font-marcador text-base font-bold tabular-nums">{formatNumber(c.units)} tapitas</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="break-inside-avoid">
          <h2 className="text-lg font-extrabold">Lo que sigue</h2>
          {proxima && (
            <p className="mt-2 text-sm">
              La próxima etapa del recorrido de las tapitas: <b>{proxima.title.toLowerCase()}</b>
              {proxima.operator ? `, a cargo de ${proxima.operator}` : ''}. {proxima.detail}
            </p>
          )}
          <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ETAPAS_DEL_PILOTO.map((e) => (
              <li key={e.numero} className="break-inside-avoid rounded-xl border border-border p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                  Etapa {e.numero} · {e.dias}
                </p>
                <p className="font-bold">{e.nombre}</p>
                <p className="text-sm text-muted-foreground">{e.detalle}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="border-t border-border pt-3 text-xs text-muted-foreground">
          Datos de ejemplo de la demo · Generado con ReciclaXP el {emitido}
        </footer>
      </article>
    </div>
  )
}
