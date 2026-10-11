import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { ImpactProject } from '@/types'
import type { AporteDeLaHinchada } from '@/lib/ultimosAportes'
import { tituloDeLaHinchada } from '@/lib/productosDelClub'
import { cn, formatNumber, pct } from '@/lib/utils'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { Marcador } from './Marcador'
import { UltimosAportes } from './UltimosAportes'

/**
 * El banco de la hinchada sobre césped: el marcador, el avance, el banco de tapitas y la
 * hinchada en el banco. Lo usan el inicio del hincha y el panel del club, con los mismos números.
 */
export function BancoDeLaHinchada({
  proyecto,
  items,
  propias,
  antetitulo,
  enlace,
  accion,
  invitacion,
  className,
}: {
  proyecto: ImpactProject
  items: AporteDeLaHinchada[]
  propias: number
  antetitulo?: string
  enlace?: string
  accion?: ReactNode
  /** Lo que se muestra en lugar de la lista mientras nadie aportó (un producto recién publicado). */
  invitacion?: string
  className?: string
}) {
  const avance = proyecto.goalUnits > 0 ? proyecto.collectedUnits / proyecto.goalUnits : 0
  return (
    <Cancha conLinea className={cn('p-4 pt-6 sm:p-5 sm:pt-7', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-eco-800 dark:text-eco-200">{antetitulo ?? proyecto.sponsorName}</p>
          <h2 className="text-lg font-extrabold leading-tight text-eco-950 dark:text-eco-50">{proyecto.title}</h2>
        </div>
        {enlace && (
          <Link to={enlace} className="inline-flex shrink-0 items-center text-sm font-semibold text-eco-800 dark:text-eco-200">
            Ver <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
        <div>
          <div className="flex items-end justify-between gap-3">
            <Marcador
              valor={proyecto.collectedUnits}
              etiqueta={`${proyecto.unitLabel} de ${formatNumber(proyecto.goalUnits)}`}
            />
            <p className="font-marcador text-4xl font-bold tabular-nums text-eco-700 dark:text-eco-300">
              {pct(proyecto.collectedUnits, proyecto.goalUnits)}%
            </p>
          </div>
          <BancoDeTapitas className="mt-3" forma={proyecto.forma} progreso={avance} propias={propias} />
        </div>
        {items.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-eco-800 dark:text-eco-200">
              {tituloDeLaHinchada(proyecto)}
            </p>
            <UltimosAportes items={items} />
          </div>
        ) : (
          invitacion && (
            <p className="rounded-xl bg-card/90 p-4 text-center text-sm font-semibold text-eco-900 dark:text-eco-100">
              {invitacion}
            </p>
          )
        )}
      </div>

      {accion && <div className="mt-4">{accion}</div>}
    </Cancha>
  )
}
