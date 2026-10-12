import { Link } from 'react-router-dom'
import { ChevronRight, Route } from 'lucide-react'
import type { ImpactProject } from '@/types'
import { useRecorridoDelProducto } from '@/hooks/useRecorridoDelProducto'
import { estadoDelRecorrido } from '@/lib/recorridoDeLaTapita'
import { EstadoDeTuTapita } from './RecorridoDeLaTapita'

/**
 * Debajo del banco, dónde va tu tapita y la entrada al recorrido. Antes el inicio no lo mostraba: el club
 * cargaba un pesaje y el hincha no tenía dónde verlo sin entrar al proyecto y a «Trazabilidad». Sólo
 * aparece si tu tapita ya entró al recorrido.
 */
export function TuTapitaEnElInicio({ proyecto, punto }: { proyecto: ImpactProject; punto?: string }) {
  const { eventos } = useRecorridoDelProducto(proyecto, proyecto.id)
  if (!eventos || eventos.length === 0 || estadoDelRecorrido(eventos).actual < 0) return null

  return (
    <Link
      to={`/trazabilidad/${proyecto.id}`}
      className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-bold">
          <Route size={18} aria-hidden className="text-eco-600" /> El recorrido de tu tapita
        </p>
        <span className="inline-flex shrink-0 items-center text-sm font-semibold text-eco-700 dark:text-eco-300">
          Ver<span className="sr-only"> el recorrido</span> <ChevronRight size={16} aria-hidden />
        </span>
      </div>
      <EstadoDeTuTapita eventos={eventos} punto={punto} className="mt-2" />
    </Link>
  )
}
