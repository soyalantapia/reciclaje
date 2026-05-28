import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronRight, Store } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import type { Sponsor } from '@/types'
import { formatNumber } from '@/lib/utils'
import { Logo } from '@/components/features/Logo'
import { HuellaVerde } from '@/components/features/HuellaVerde'
import { ErrorState } from '@/components/features/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'

export default function CommerceLogin() {
  const navigate = useNavigate()
  const loginAsCommerce = useSessionStore((s) => s.loginAsCommerce)
  const { data: sponsors, loading, error, reload } = useApi(() => api.getSponsors(), [])

  function enter(sponsor: Sponsor) {
    loginAsCommerce(sponsor)
    toast.success(`Bienvenido, ${sponsor.name} 🌿`)
    navigate('/comercio', { replace: true })
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-eco-grid bg-background px-6 pb-10 pt-safe">
      <div className="flex flex-col pt-10">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-eco-100 px-3 py-1 text-xs font-bold text-eco-800 dark:bg-eco-900/40 dark:text-eco-200">
            <Store size={14} /> Panel del comercio
          </div>
          <h1 className="text-2xl font-extrabold leading-tight">Ingresá a tu panel</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Gestioná tus beneficios, campañas, puntos y reportes de impacto. (Demo: elegí tu
            comercio)
          </p>
        </div>

        {error && !sponsors ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <div className="space-y-2">
            {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            {sponsors?.map((s) => (
              <button
                key={s.id}
                onClick={() => enter(s)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition active:scale-[0.99]"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-extrabold text-white"
                  style={{ backgroundColor: s.brandColor }}
                >
                  {s.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold leading-tight">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatNumber(s.kgRecovered)} kg recuperados
                  </p>
                </div>
                <HuellaVerde score={s.greenScore} compact />
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        <Link
          to="/login"
          className="mt-6 block text-center text-sm font-semibold text-eco-700 dark:text-eco-300"
        >
          ¿Sos usuario? Entrá a la app →
        </Link>
      </div>
    </div>
  )
}
