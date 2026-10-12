import type { Logro } from '@/lib/logros'
import { formatNumber } from '@/lib/utils'
import { Medalla } from './Medalla'

/** «Tus logros» en el perfil: los ganados a color y los que faltan en gris, con su progreso. */
export function LogrosDelPerfil({ logros }: { logros: Logro[] }) {
  const ganados = logros.filter((l) => l.ganado).length
  return (
    <section id="logros" aria-labelledby="titulo-logros" className="scroll-mt-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-logros" className="font-bold">
          Tus logros
        </h2>
        <p className="text-sm text-muted-foreground">
          {ganados} de {logros.length}
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {logros.map((l) => (
          <li key={l.id} data-ganado={l.ganado} className="flex flex-col items-center gap-1.5 text-center">
            <Medalla logro={l} />
            <p className="text-sm font-bold leading-tight">{l.titulo}</p>
            <p className="text-xs leading-snug text-muted-foreground">{l.detalle}</p>
            {!l.ganado && l.meta > 1 && (
              <div className="w-full max-w-[9rem]">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-eco-600" style={{ width: `${(l.actual / l.meta) * 100}%` }} />
                </div>
                <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {formatNumber(l.actual)} / {formatNumber(l.meta)}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
