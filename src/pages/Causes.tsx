import { useNavigate } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { CauseCard } from '@/components/features/CauseCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { CardGrid } from '@/components/ui/card-grid'

export default function Causes() {
  const navigate = useNavigate()
  const { data: causes, loading, error, reload } = useApi(() => api.getCauses(), [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Causas</h1>
        <p className="text-sm text-muted-foreground">
          Tu reciclaje se transforma en algo concreto para quien lo necesita.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-eco-200 bg-eco-50 p-3 text-sm text-eco-800 dark:border-eco-700/40 dark:bg-eco-900/20 dark:text-eco-200">
        <HeartHandshake size={18} className="mt-0.5 shrink-0" />
        El material que reciclás se vende a recicladores certificados y lo recaudado se vuelve
        insumos para hospitales, comedores y escuelas. Vos ves en qué se transforma.
      </div>

      {error && !causes ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <CardGrid cols={3}>
          {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full" />)}
          {causes?.map((c) => (
            <CauseCard key={c.id} cause={c} onClick={() => navigate(`/causa/${c.id}`)} />
          ))}
        </CardGrid>
      )}
    </div>
  )
}
