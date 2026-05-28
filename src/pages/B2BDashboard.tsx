import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Coins, Gift, Recycle, Scale, Users } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { formatNumber } from '@/lib/utils'
import { Logo } from '@/components/features/Logo'
import { StatCard } from '@/components/features/StatCard'
import { ErrorState } from '@/components/features/ErrorState'
import { HuellaVerde } from '@/components/features/HuellaVerde'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const SPONSORS: TabItem<string>[] = [
  { value: 's_ypf', label: 'YPF' },
  { value: 's_river', label: 'River Plate' },
]

export default function B2BDashboard() {
  const [sponsorId, setSponsorId] = useState('s_ypf')
  const { data: m, loading, error, reload } = useApi(
    () => api.getSponsorMetrics(sponsorId),
    [sponsorId],
  )

  const maxMonthly = m ? Math.max(...m.monthlySeries.map((s) => s.value)) : 1
  const maxPoint = m ? Math.max(...m.byPoint.map((s) => s.contributions)) : 1

  return (
    <div className="min-h-dvh bg-background">
      <header className="pt-safe sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/perfil" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft size={18} /> App
          </Link>
          <Logo withText={false} />
          <span className="text-sm font-bold">Panel B2B</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-5 pb-16">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">Dashboard de impacto</h1>
          <p className="text-sm text-muted-foreground">
            Métricas de tu red de puntos, campañas y comunidad.
          </p>
        </div>

        <Tabs tabs={SPONSORS} value={sponsorId} onChange={setSponsorId} />

        {error && !m ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading || !m ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-eco-200 bg-eco-50 p-5 dark:border-eco-700/40 dark:bg-eco-900/20">
              <HuellaVerde score={m.greenScore} />
              <Progress value={m.greenScore} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                Reputación ambiental de tu marca en la red. Comunicala en tus locales: tracciona
                clientes y suma RSE verificable.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Usuarios activos" value={formatNumber(m.activeUsers)} />
              <StatCard icon={Recycle} label="Aportes" value={formatNumber(m.contributions)} />
              <StatCard
                icon={Coins}
                label="XP emitidos"
                value={formatNumber(m.xpEmitted)}
                hint="pasivo de recompensas"
              />
              <StatCard
                icon={Gift}
                label="Beneficios canjeados"
                value={formatNumber(m.benefitsRedeemed)}
              />
              <StatCard
                icon={Scale}
                label="Kg recuperados"
                value={formatNumber(m.kgRecovered)}
              />
              <StatCard
                icon={Recycle}
                label="Tapitas"
                value={formatNumber(m.capsRecovered)}
              />
            </div>

            {/* Aportes por mes */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 font-bold">Aportes por mes</p>
              <div className="flex h-40 items-end justify-between gap-2">
                {m.monthlySeries.map((s) => (
                  <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-eco-500"
                      style={{ height: `${Math.max(4, (s.value / maxMonthly) * 120)}px` }}
                      title={formatNumber(s.value)}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aportes por punto */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 font-bold">Aportes por punto</p>
              <div className="space-y-3">
                {m.byPoint.map((p) => (
                  <div key={p.point}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{p.point}</span>
                      <span className="font-bold text-eco-700">
                        {formatNumber(p.contributions)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-eco-500"
                        style={{ width: `${(p.contributions / maxPoint) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Reportes exportables para RSE y auditoría · datos demo
            </p>
          </>
        )}
      </main>
    </div>
  )
}
