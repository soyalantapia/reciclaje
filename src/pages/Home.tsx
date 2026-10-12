import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Leaf, QrCode, Sparkles, Trophy } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { MATERIAL_EMOJI, cn, formatKg, formatNumber, formatXp, timeAgo, unidadDe } from '@/lib/utils'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { XpWallet } from '@/components/features/XpWallet'
import { ImpactProgress } from '@/components/features/ImpactProgress'
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { esDelPanel, nombreDelProducto } from '@/lib/productosDelClub'
import { ultimosAportesDeLaHinchada } from '@/lib/ultimosAportes'
import { BancoDeLaHinchada } from '@/components/features/BancoDeLaHinchada'
import { TuTapitaEnElInicio } from '@/components/features/TuTapitaEnElInicio'
import { puntoDeTuTapita } from '@/lib/recorridoDeLaTapita'
import { CauseCard } from '@/components/features/CauseCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)
  const sessionContributions = useActivityStore((s) => s.sessionContributions)
  // Lo que el club publica desde el panel, aunque sea en otra pestaña, vuelve a pedir los proyectos.
  const creados = useCommerceProductsStore((s) => s.creados)
  const { data: projects, error: projectsError, reload: reloadProjects } = useApi(
    () => api.getProjects(),
    [creados],
  )
  const { data: history } = useApi(() => api.getContributions(), [])
  const { data: causes } = useApi(() => api.getCauses(), [])
  const [elegidoId, setElegidoId] = useState<string>()

  const principal = projects?.[0]
  // Los productos de la hinchada del club destacado: su banco y los que el club publicó desde el panel.
  const productos =
    principal?.illustration === 'bench'
      ? (projects ?? []).filter((p) => p.sponsorId === principal.sponsorId && p.illustration === 'bench')
      : []
  const elegido = productos.find((p) => p.id === elegidoId) ?? principal
  // El proyecto destacado suma los aportes de esta sesión (ver src/lib/aportesDeLaSesion.ts).
  const featured = elegido && conAportesDeLaSesion(elegido, sessionContributions, user?.name)
  // El banco de la hinchada: sólo para un proyecto que se dibuja como banco.
  const esBanco = featured?.illustration === 'bench'
  const aportesDelBanco = featured && esBanco ? ultimosAportesDeLaHinchada(featured, sessionContributions, user?.name) : []
  const propias = featured && featured.collectedUnits > 0 ? featured.myContributionUnits / featured.collectedUnits : 0
  const featuredCause = causes?.[0]
  const recent = [...sessionContributions, ...(history ?? [])].slice(0, 4)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">¡Hola de nuevo!</p>
        <h1 className="text-2xl font-extrabold leading-tight">
          {user?.name.split(' ')[0] ?? 'Reciclador'} 👋
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        {/* Columna principal */}
        <div className="space-y-5 lg:col-span-2">
          {/* El banco de la hinchada del club, o el proyecto destacado si no se dibuja como banco */}
          {projectsError && !featured ? (
            <ErrorState message={projectsError} onRetry={reloadProjects} />
          ) : featured && esBanco ? (
            <div className="space-y-3">
              {/* Un producto por pestaña, si el club publicó alguno además del banco. Bajan de renglón en
                  vez de scrollear: en 390 px dos nombres ya no entran, y un scroll recortaba el borde. */}
              {productos.length > 1 && (
                <div
                  role="group"
                  aria-label="Productos de la hinchada"
                  className="flex flex-wrap gap-2"
                >
                  {productos.map((p) => {
                    const activo = p.id === featured.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={activo}
                        onClick={() => setElegidoId(p.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          activo
                            ? 'bg-eco-600 text-white'
                            : 'bg-card text-muted-foreground ring-1 ring-border hover:bg-muted',
                        )}
                      >
                        {nombreDelProducto(p)}
                        {esDelPanel(p) && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wide',
                              activo
                                ? 'bg-white text-eco-700'
                                : 'bg-xp-100 text-xp-700 dark:bg-xp-700/20 dark:text-xp-300',
                            )}
                          >
                            nuevo
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
              <BancoDeLaHinchada
                key={featured.id}
                proyecto={featured}
                items={aportesDelBanco}
                propias={propias}
                enlace={`/proyecto/${featured.id}`}
                invitacion="Todavía nadie sumó tapitas. ¡La primera puede ser la tuya!"
                accion={
                  <Link
                    to="/escanear"
                    className="block"
                    onClick={() => {
                      // Un producto del panel junta en su Punto R: el escáner arranca con ese punto elegido.
                      if (featured.puntoId) sessionStorage.setItem(claveDeAlmacenamiento('scan-point'), featured.puntoId)
                    }}
                  >
                    <Button block size="lg" variant="xp">
                      <QrCode size={20} /> Sumá tus tapitas
                    </Button>
                  </Link>
                }
              />
              <TuTapitaEnElInicio
                key={`recorrido-${featured.id}`}
                proyecto={featured}
                punto={puntoDeTuTapita(featured, sessionContributions, history ?? [])}
              />
            </div>
          ) : featured ? (
            <>
              <Link to="/escanear" className="block">
                <Button block size="lg" className="shadow-md shadow-eco-600/20">
                  <QrCode size={20} /> Escanear un aporte
                </Button>
              </Link>
              <Card>
                <div className="flex items-center justify-between p-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-eco-600" />
                    <h2 className="font-bold">Tu impacto</h2>
                  </div>
                  <Link
                    to={`/proyecto/${featured.id}`}
                    className="inline-flex items-center text-sm font-semibold text-eco-700"
                  >
                    Ver <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="px-5 pb-5">
                  <p className="mb-3 font-bold leading-tight">{featured.title}</p>
                  <ImpactProgress project={featured} compact />
                </div>
              </Card>
            </>
          ) : (
            <Skeleton className="h-80 w-full rounded-2xl" />
          )}

          <XpWallet />
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Causa destacada */}
          {featuredCause && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold">Sumá a una causa</h2>
                <Link
                  to="/causas"
                  className="inline-flex items-center text-sm font-semibold text-eco-700 dark:text-eco-300"
                >
                  Ver todas <ChevronRight size={16} />
                </Link>
              </div>
              <CauseCard
                cause={featuredCause}
                onClick={() => navigate(`/causa/${featuredCause.id}`)}
              />
            </div>
          )}

          {/* Marcas de la red */}
          <Link to="/marcas" className="block">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300">
                <Leaf size={18} />
              </span>
              <div className="flex-1">
                <p className="font-bold">Marcas de la red</p>
                <p className="text-xs text-muted-foreground">
                  Empresas y comercios de la red, con su Huella Verde
                </p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
          </Link>

          {/* Premio del mes */}
          <Link to="/ranking" className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-xp-400 to-xp-500 p-4 text-ink-900 shadow-sm">
              <Trophy size={28} />
              <div className="flex-1">
                <p className="text-sm font-extrabold leading-tight">Ranking del mes</p>
                <p className="text-xs font-medium text-ink-800/80">
                  Subí posiciones y ganá premios de los sponsors
                </p>
              </div>
              <ChevronRight size={20} />
            </div>
          </Link>
        </div>
      </div>

      {/* Actividad reciente */}
      <div>
        <h2 className="mb-2 font-bold">Actividad reciente</h2>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {recent.length === 0 && (
            <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground lg:col-span-2">
              Todavía no registraste aportes. ¡Escaneá tu primer QR!
            </p>
          )}
          {recent.map((item) => {
            const isRecycle = 'material' in item
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-lg">
                  {isRecycle ? MATERIAL_EMOJI[item.material] : '🛍️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {isRecycle ? item.pointName : `Compra · ${item.sponsorName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRecycle
                      ? item.units
                        ? `${formatNumber(item.units)} ${unidadDe(item.material, item.units)}`
                        : formatKg(item.weightKg ?? 0)
                      : `$${formatNumber(item.amountArs)}`}{' '}
                    · {timeAgo(item.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-eco-700 dark:text-eco-300">
                    +{formatXp(item.xpEarned)}
                  </p>
                  {isRecycle && item.status === 'pendiente' && (
                    <Badge variant="warning">Pendiente</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
