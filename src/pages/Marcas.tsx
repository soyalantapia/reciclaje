import { useMemo } from 'react'
import { Leaf } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import type { SponsorCategory } from '@/types'
import { formatNumber } from '@/lib/utils'
import { HuellaVerde } from '@/components/features/HuellaVerde'
import { ErrorState } from '@/components/features/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { CardGrid } from '@/components/ui/card-grid'

const CATEGORY_LABEL: Record<SponsorCategory, string> = {
  estacion: 'Estación',
  club: 'Club',
  estadio: 'Estadio',
  complejo: 'Complejo',
  comercio: 'Comercio',
  municipio: 'Municipio',
  marca: 'Marca',
}

export default function Marcas() {
  const { data: sponsors, loading, error, reload } = useApi(() => api.getSponsors(), [])

  const sorted = useMemo(
    () => (sponsors ? [...sponsors].sort((a, b) => b.greenScore - a.greenScore) : []),
    [sponsors],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Marcas de la red</h1>
        <p className="text-sm text-muted-foreground">
          Empresas y comercios que se sumaron a la causa. Su Huella Verde crece con cada aporte.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-eco-200 bg-eco-50 p-3 text-sm text-eco-800 dark:border-eco-700/40 dark:bg-eco-900/20 dark:text-eco-200">
        <Leaf size={18} className="mt-0.5 shrink-0" />
        La <strong className="font-bold">Huella Verde</strong> mide la reputación ambiental de cada
        aliado: cuanto más recicla su comunidad, más sube.
      </div>

      {error && !sponsors ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <CardGrid cols={3}>
          {loading && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          {sorted.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-extrabold text-white"
                  style={{ backgroundColor: s.brandColor }}
                >
                  {s.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold leading-tight">{s.name}</p>
                  <p className="truncate text-xs font-semibold text-muted-foreground">
                    {CATEGORY_LABEL[s.category]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{s.tagline}</p>
                </div>
                <HuellaVerde score={s.greenScore} compact />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Material recuperado</span>
                <span className="font-extrabold text-eco-700 dark:text-eco-300">
                  {formatNumber(s.kgRecovered)} kg
                </span>
              </div>
            </div>
          ))}
        </CardGrid>
      )}
    </div>
  )
}
