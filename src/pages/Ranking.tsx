import { useState } from 'react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { RankingRow } from '@/components/features/RankingRow'
import { ErrorState } from '@/components/features/ErrorState'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { RANKING_TABS } from '@/lib/escenario'
import { rankingConXpDeLaSesion } from '@/lib/aportesDeLaSesion'
import { useActivityStore } from '@/store/activity'

type Scope = string
const TABS: TabItem<Scope>[] = RANKING_TABS

export default function Ranking() {
  const [scope, setScope] = useState<Scope>('global')
  const { data, loading, error, reload } = useApi(() => api.getRanking(scope), [scope])
  const actividad = useActivityStore((s) => s.sessionContributions)

  // El ranking fijo del simulador, más el XP que la persona ganó en esta sesión (en esta sede).
  const sede = RANKING_TABS.find((t) => t.value === scope)?.sponsorId
  const entries = data ? rankingConXpDeLaSesion(data.entries, actividad, sede) : undefined
  const me = entries?.find((e) => e.isCurrentUser)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Ranking del mes</h1>
        <p className="text-sm text-muted-foreground">Sumá XP y subí posiciones por sede.</p>
      </div>

      <Tabs tabs={TABS} value={scope} onChange={setScope} />

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          {/* Premio del mes */}
          {data && (
            <div className="flex items-center gap-3 rounded-2xl border border-xp-200 bg-xp-50 p-4 dark:border-xp-700/40 dark:bg-xp-700/10">
              <span className="text-3xl">{data.prize.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-xp-700 dark:text-xp-300">
                  Premio · {data.prize.sponsorName}
                </p>
                <p className="font-extrabold leading-tight">{data.prize.title}</p>
                <p className="text-xs text-muted-foreground">{data.prize.description}</p>
              </div>
            </div>
          )}

          {/* Tu posición (siempre visible, sin scrollear) */}
          {me && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Tu posición
              </p>
              <RankingRow entry={me} />
            </div>
          )}

          <div className="space-y-1.5">
            {loading && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            {entries?.map((e) => (
              <RankingRow key={e.userId} entry={e} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
