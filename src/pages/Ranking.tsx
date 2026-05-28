import { useState } from 'react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { RankingRow } from '@/components/features/RankingRow'
import { ErrorState } from '@/components/features/ErrorState'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

type Scope = 'global' | 'river' | 'ypf'
const TABS: TabItem<Scope>[] = [
  { value: 'global', label: 'Global' },
  { value: 'river', label: 'River' },
  { value: 'ypf', label: 'YPF' },
]

export default function Ranking() {
  const [scope, setScope] = useState<Scope>('global')
  const { data, loading, error, reload } = useApi(() => api.getRanking(scope), [scope])

  const me = data?.entries.find((e) => e.isCurrentUser)

  return (
    <div className="space-y-4">
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
            {data?.entries.map((e) => (
              <RankingRow key={e.userId} entry={e} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
