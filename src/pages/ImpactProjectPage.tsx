import { Link, useParams } from 'react-router-dom'
import { Route } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { ImpactProgress } from '@/components/features/ImpactProgress'
import { ErrorState } from '@/components/features/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function ImpactProjectPage() {
  const { id = '' } = useParams()
  const { data: project, loading, error, reload } = useApi(() => api.getProject(id), [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 pt-4">
        <ErrorState message={error} onRetry={reload} />
        <Link to="/" className="block text-center text-sm font-semibold text-eco-700">
          Volver al inicio
        </Link>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="pt-10 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-2 font-bold">No encontramos el proyecto</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-eco-700">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Badge variant="eco">{project.sponsorName}</Badge>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight">{project.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
      </div>

      <ImpactProgress project={project} />

      <Link to={`/trazabilidad/${project.id}`}>
        <Button block variant="secondary" size="lg">
          <Route size={18} /> Ver trazabilidad del material
        </Button>
      </Link>
    </div>
  )
}
