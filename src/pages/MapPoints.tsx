import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import type { Sponsor } from '@/types'
import { cn } from '@/lib/utils'
import { PointCard } from '@/components/features/PointCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'

export default function MapPoints() {
  const { data: points, error, reload } = useApi(() => api.getPoints(), [])
  const { data: sponsors } = useApi(() => api.getSponsors(), [])
  const [selected, setSelected] = useState<string | null>(null)

  const sponsorMap = useMemo(() => {
    const m = new Map<string, Sponsor>()
    sponsors?.forEach((s) => m.set(s.id, s))
    return m
  }, [sponsors])

  // Lista ordenada: puntos abiertos primero (R16).
  const sortedPoints = useMemo(
    () => (points ? [...points].sort((a, b) => Number(b.openNow) - Number(a.openNow)) : []),
    [points],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Puntos adheridos</h1>
        <p className="text-sm text-muted-foreground">
          Estaciones, estadios, comercios y puntos verdes de la red.
        </p>
      </div>

      {error && !points ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          {/* Mapa esquemático */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-eco-50 bg-eco-grid dark:bg-eco-950">
            <div className="absolute inset-0 bg-gradient-to-br from-eco-100/40 to-transparent dark:from-eco-900/30" />
            {!points && <Skeleton className="absolute inset-0" />}
            {points?.map((p) => {
              const sponsor = sponsorMap.get(p.sponsorId)
              const active = selected === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(active ? null : p.id)}
                  aria-label={p.name}
                  className="absolute -translate-x-1/2 -translate-y-full transition-transform"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-full text-white shadow-md ring-2 ring-card transition-transform',
                      active && 'scale-125',
                    )}
                    style={{ backgroundColor: sponsor?.brandColor ?? '#059669' }}
                  >
                    <MapPin size={18} />
                  </span>
                </button>
              )
            })}

            {selected && (
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-card/95 p-3 shadow-lg backdrop-blur">
                {(() => {
                  const p = points?.find((x) => x.id === selected)
                  if (!p) return null
                  return (
                    <>
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sponsorMap.get(p.sponsorId)?.name} · {p.city}
                      </p>
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Lista (abiertos primero) */}
          <div className="space-y-2">
            {sortedPoints.map((p) => (
              <PointCard
                key={p.id}
                point={p}
                sponsor={sponsorMap.get(p.sponsorId)}
                onClick={() => setSelected(p.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
