import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ImpactProject, TraceEvent } from '@/types'
import { estadoDelRecorrido } from '@/lib/recorridoDeLaTapita'
import { cn, formatDate, formatNumber, pct } from '@/lib/utils'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { ICONO_DE_ETAPA } from './iconosDeEtapa'
import { EscudoOficial } from './LogoDeMarca'

/**
 * La trazabilidad de un banco contada como el recorrido de tu tapita: una línea de cal sobre
 * césped, tu tapita en ámbar en la etapa donde está hoy, la que sigue destacada (con quién la
 * hace) y el banco como destino, con el mismo avance que el inicio. Las etapas que faltan dicen
 * «pendiente», sin fechas inventadas. Con movimiento reducido no se anima nada.
 */
export function RecorridoDeLaTapita({
  eventos,
  proyecto,
  punto,
  propias,
}: {
  eventos: TraceEvent[]
  proyecto: ImpactProject
  punto?: string
  propias: number
}) {
  const reduce = useReducedMotion()
  const { actual, siguiente } = estadoDelRecorrido(eventos)
  const avance = proyecto.goalUnits > 0 ? proyecto.collectedUnits / proyecto.goalUnits : 0

  return (
    <Cancha conLinea className="p-4 pt-6 sm:p-5 sm:pt-7">
      <p className="flex items-center gap-1.5 text-xs font-bold text-eco-800 dark:text-eco-200">
        <EscudoOficial sponsorId={proyecto.sponsorId} nombre={proyecto.sponsorName} />
        Trazabilidad · {proyecto.sponsorName}
      </p>
      <h1 className="text-2xl font-extrabold leading-tight text-eco-950 dark:text-eco-50">El recorrido de tu tapita</h1>

      <EstadoDeTuTapita eventos={eventos} punto={punto} className="mt-3 rounded-xl bg-card/90 p-3" />

      {/* La línea de cal va en el contenedor, no dentro de la lista */}
      <div className="relative mt-5">
        <span aria-hidden className="absolute bottom-3 left-[15px] top-2 w-[3px] rounded-full bg-cal" />
        <ol className="space-y-3 pl-10">
          {eventos.map((ev, i) => {
            const esActual = i === actual
            const esSiguiente = i === siguiente
            const Icono = ICONO_DE_ETAPA[ev.stage]
            return (
              <li
                key={ev.stage}
                data-actual={esActual}
                data-siguiente={esSiguiente}
                aria-current={esActual ? 'step' : undefined}
                className={cn('relative', esSiguiente && 'rounded-xl bg-card px-3 py-2 ring-2 ring-xp-400')}
              >
                {esActual ? (
                  <motion.span
                    aria-hidden
                    className="absolute -left-[37px] top-0 h-7 w-7 rounded-full bg-xp-400 ring-2 ring-xp-600"
                    initial={reduce ? false : { y: -48, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border-2',
                      ev.done
                        ? 'border-eco-600 bg-eco-600 text-white'
                        : 'border-eco-300 bg-card dark:border-eco-700',
                    )}
                  >
                    {ev.done && <Check size={12} strokeWidth={3} />}
                  </span>
                )}
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-eco-950 dark:text-eco-50">
                  <Icono size={15} aria-hidden className="text-eco-700 dark:text-eco-300" />
                  {ev.title}
                  {esSiguiente && (
                    <span className="rounded-full bg-xp-100 px-2 py-0.5 text-[11px] font-bold text-xp-700">lo que sigue</span>
                  )}
                </p>
                {(ev.done || esSiguiente) && (
                  <p className="text-xs text-eco-800 dark:text-eco-200">{ev.detail}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {ev.date ? formatDate(ev.date) : 'pendiente'}
                  {ev.operator ? ` · ${ev.operator}` : ''}
                </p>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-5 rounded-xl bg-card/90 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-eco-800 dark:text-eco-200">El destino</p>
        <p className="text-sm font-bold">{proyecto.title}</p>
        <BancoDeTapitas className="mt-2 max-w-xs" forma={proyecto.forma} progreso={avance} propias={propias} />
        <p className="mt-1 text-xs text-muted-foreground">
          {formatNumber(proyecto.collectedUnits)} de {formatNumber(proyecto.goalUnits)} {proyecto.unitLabel} ·{' '}
          {pct(proyecto.collectedUnits, proyecto.goalUnits)}%
        </p>
      </div>
    </Cancha>
  )
}

/**
 * Dónde está tu tapita, qué sigue y en qué etapa va. Lo comparten el recorrido y el inicio, para que
 * digan lo mismo.
 */
export function EstadoDeTuTapita({
  eventos,
  punto,
  className,
}: {
  eventos: TraceEvent[]
  punto?: string
  className?: string
}) {
  const { actual, siguiente, total } = estadoDelRecorrido(eventos)
  const proximo = siguiente === null ? undefined : eventos[siguiente]
  return (
    <div className={cn('space-y-1 text-sm', className)}>
      <p className="flex items-center gap-2">
        <span aria-hidden className="h-3 w-3 shrink-0 rounded-full bg-xp-400 ring-1 ring-xp-600" />
        {actual < 0 ? (
          <span>Tu tapita todavía no entró a este recorrido</span>
        ) : actual > 0 ? (
          // Pasó la primera etapa (el club ya la pesó, por ejemplo): ya no se la nombra por el punto.
          <span>
            Tu tapita va por: <b className="font-bold">{eventos[actual].title.toLowerCase()}</b>
          </span>
        ) : punto ? (
          <span>
            Tu tapita está en el <b className="font-bold">{punto}</b>
          </span>
        ) : (
          <span>Tu tapita ya está en el recorrido</span>
        )}
      </p>
      {proximo && (
        <p>
          Lo que sigue: <b className="font-bold">{proximo.title.toLowerCase()}</b>
          {proximo.operator ? `, a cargo de ${proximo.operator}` : ''}
        </p>
      )}
      {actual >= 0 && (
        <p className="text-xs text-muted-foreground">
          Etapa {actual + 1} de {total}
        </p>
      )}
    </div>
  )
}
