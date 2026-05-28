import { Link, useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { TraceabilityTimeline } from '@/components/features/TraceabilityTimeline'
import { Skeleton } from '@/components/ui/skeleton'

export default function Traceability() {
  const { projectId = '' } = useParams()
  const { data: project } = useApi(() => api.getProject(projectId), [projectId])
  const { data: trace, loading } = useApi(() => api.getProjectTrace(projectId), [projectId])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Trazabilidad</h1>
        {project && (
          <p className="text-sm text-muted-foreground">
            Recorrido del material hacia: <span className="font-semibold">{project.title}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-eco-200 bg-eco-50 p-3 text-sm text-eco-800">
        <ShieldCheck size={18} className="shrink-0" />
        Cada hito es un evento verificable: punto, lote, retiro, planta y producto final.
      </div>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {trace && trace.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <TraceabilityTimeline events={trace} />
        </div>
      ) : (
        !loading && (
          <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
            Este proyecto todavía no tiene eventos de trazabilidad.
          </p>
        )
      )}

      <Link to={`/proyecto/${projectId}`} className="block text-center text-sm font-semibold text-eco-700">
        ← Volver al proyecto
      </Link>
    </div>
  )
}
