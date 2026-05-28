import { Link } from 'react-router-dom'
import { ChevronRight, QrCode, Sparkles, Trophy } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { MATERIAL_EMOJI, formatNumber, formatXp, timeAgo } from '@/lib/utils'
import { XpWallet } from '@/components/features/XpWallet'
import { ImpactProgress } from '@/components/features/ImpactProgress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const user = useSessionStore((s) => s.user)
  const sessionContributions = useActivityStore((s) => s.sessionContributions)
  const { data: projects } = useApi(() => api.getProjects(), [])
  const { data: history } = useApi(() => api.getContributions(), [])

  const featured = projects?.[0]
  const recent = [...sessionContributions, ...(history ?? [])].slice(0, 4)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">¡Hola de nuevo!</p>
        <h1 className="text-2xl font-extrabold leading-tight">
          {user?.name.split(' ')[0] ?? 'Reciclador'} 👋
        </h1>
      </div>

      <XpWallet />

      <Link to="/escanear">
        <Button block size="lg" className="shadow-md shadow-eco-600/20">
          <QrCode size={20} /> Escanear un aporte
        </Button>
      </Link>

      {/* Proyecto de impacto destacado */}
      {featured ? (
        <Card>
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-eco-600" />
              <h2 className="font-bold">Tu impacto en vivo</h2>
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
      ) : (
        <Skeleton className="h-72 w-full" />
      )}

      {/* Premio del mes */}
      <Link to="/ranking">
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

      {/* Actividad reciente */}
      <div>
        <h2 className="mb-2 font-bold">Actividad reciente</h2>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
              Todavía no registraste aportes. ¡Escaneá tu primer QR!
            </p>
          )}
          {recent.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-lg">
                {MATERIAL_EMOJI[c.material]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.pointName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.units ? `${formatNumber(c.units)} u.` : `${c.weightKg} kg`} ·{' '}
                  {timeAgo(c.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-eco-700">+{formatXp(c.xpEarned)}</p>
                {c.status === 'pendiente' && <Badge variant="warning">Pendiente</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
