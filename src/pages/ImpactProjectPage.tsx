import { Link, useParams } from 'react-router-dom'
import { Route } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { ImpactProgress } from '@/components/features/ImpactProgress'
import { ErrorState } from '@/components/features/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { conAportesDeLaSesion, nombreCorto } from '@/lib/aportesDeLaSesion'
import { useActivityStore } from '@/store/activity'
import { useSessionStore } from '@/store/session'
import { ApoyoDelProducto } from '@/components/features/ApoyoDelProducto'

export default function ImpactProjectPage() {
  const { id = '' } = useParams()
  const { data: proyectoBase, loading, error, reload } = useApi(() => api.getProject(id), [id])
  const actividad = useActivityStore((s) => s.sessionContributions)
  const nombre = useSessionStore((s) => s.user?.name)
  // Los totales fijos del simulador, más lo que la persona aportó en esta sesión.
  const project = proyectoBase && conAportesDeLaSesion(proyectoBase, actividad, nombre)

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
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <Badge variant="eco">{project.sponsorName}</Badge>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight">{project.title}</h1>
        <ApoyoDelProducto proyecto={project} className="mt-1.5 bg-muted shadow-none" />
        <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
      </div>

      <ImpactProgress project={project} nombreCorto={nombre ? nombreCorto(nombre) : undefined} />

      <Link to={`/trazabilidad/${project.id}`} className="block">
        <Button block variant="secondary" size="lg">
          <Route size={18} /> Ver trazabilidad del material
        </Button>
      </Link>
    </div>
  )
}
