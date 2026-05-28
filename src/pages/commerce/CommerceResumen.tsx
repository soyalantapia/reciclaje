import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Coins, Download, FileText, Gift, Recycle, Scale, Users } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { downloadBlob, formatNumber } from '@/lib/utils'
import { StatCard } from '@/components/features/StatCard'
import { HuellaVerde } from '@/components/features/HuellaVerde'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

function badgeSvg(name: string, score: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="28" fill="#065f46"/><text x="300" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" letter-spacing="3" fill="#a7f3d0" font-weight="700">HUELLA VERDE</text><text x="300" y="156" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" font-weight="800">${name}</text><circle cx="300" cy="252" r="62" fill="#10b981"/><text x="300" y="268" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" fill="#06281f" font-weight="800">${score}</text><text x="300" y="352" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="#a7f3d0">Comprometido con el reciclaje · ReciclaXP</text></svg>`
}

export default function CommerceResumen() {
  const commerce = useSessionStore((s) => s.commerce)
  const { data: m, loading, error, reload } = useApi(
    () => api.getSponsorMetrics(commerce!.id),
    [commerce?.id],
  )

  if (!commerce) return null

  if (error && !m) return <ErrorState message={error} onRetry={reload} />

  if (loading || !m) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const series = m.monthlySeries
  const last = series[series.length - 1]?.value ?? 0
  const prev = series[series.length - 2]?.value ?? last
  const growth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0
  const maxMonthly = Math.max(...series.map((s) => s.value))
  const maxPoint = Math.max(...m.byPoint.map((p) => p.contributions))

  function downloadBadge() {
    downloadBlob(`huella-verde-${commerce!.slug}.svg`, badgeSvg(commerce!.name, m!.greenScore), 'image/svg+xml')
    toast.success('Placa descargada 🌿')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Resumen</h1>
        <p className="text-sm text-muted-foreground">Tu impacto y comunidad este mes.</p>
      </div>

      {/* Huella Verde accionable */}
      <div className="rounded-2xl border border-eco-200 bg-eco-50 p-5 dark:border-eco-700/40 dark:bg-eco-900/20">
        <div className="flex items-start justify-between gap-3">
          <HuellaVerde score={m.greenScore} />
          <Button size="sm" variant="secondary" onClick={downloadBadge}>
            <Download size={15} /> Placa
          </Button>
        </div>
        <Progress value={m.greenScore} className="mt-3" />
        <p className="mt-2 text-xs font-semibold text-eco-700 dark:text-eco-300">
          Top 12% de la red 🌎
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Cómo subirla: sumá puntos de reciclaje, publicá beneficios y mantené tus máquinas activas.
          Descargá la placa para tu vidriera y redes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Recycle}
          label="Aportes"
          value={formatNumber(m.contributions)}
          delta={growth}
          hint="vs. mes anterior"
          tooltip="Cantidad de aportes reciclados registrados en tus puntos."
        />
        <StatCard
          icon={Users}
          label="Usuarios activos"
          value={formatNumber(m.activeUsers)}
          tooltip="Personas que reciclaron en tus puntos este mes."
        />
        <StatCard
          icon={Coins}
          label="XP emitidos"
          value={formatNumber(m.xpEmitted)}
          hint="XP por canjear de tus clientes"
          tooltip="XP que entregaste; representan beneficios que tus clientes pueden canjear."
        />
        <StatCard
          icon={Gift}
          label="Beneficios canjeados"
          value={formatNumber(m.benefitsRedeemed)}
          tooltip="Clientes que canjearon un beneficio tuyo (tráfico a tu local)."
        />
        <StatCard
          icon={Scale}
          label="Kg recuperados"
          value={formatNumber(m.kgRecovered)}
          tooltip="Material recuperado a través de tu red de puntos."
        />
        <StatCard
          icon={Recycle}
          label="Tapitas"
          value={formatNumber(m.capsRecovered)}
          tooltip="Tapitas recolectadas en tus puntos."
        />
      </div>

      {/* Aportes por mes */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-4 font-bold">Aportes por mes</p>
        <div className="flex h-40 items-end justify-between gap-2">
          {series.map((s) => (
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
                <span className="truncate pr-2 font-semibold">{p.point}</span>
                <span className="font-bold text-eco-700 dark:text-eco-300">
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

      <Link to="/comercio/reportes">
        <Button block variant="secondary" size="lg">
          <FileText size={18} /> Exportar reporte para RSE
        </Button>
      </Link>
    </div>
  )
}
