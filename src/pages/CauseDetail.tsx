import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Coins, HandHeart, QrCode } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useWalletStore } from '@/store/wallet'
import { useCausesStore } from '@/store/causes'
import { formatNumber, pct } from '@/lib/utils'
import { CAUSE_ICON, CAUSE_LABEL } from '@/components/features/CauseCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export default function CauseDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: cause, loading, error, reload } = useApi(() => api.getCause(id), [id])
  const spendableXp = useWalletStore((s) => s.spendableXp)
  const spend = useWalletStore((s) => s.spend)
  const donateToCause = useCausesStore((s) => s.donate)
  const donated = useCausesStore((s) => s.donatedByCause[id] ?? 0)

  const [donateOpen, setDonateOpen] = useState(false)
  const [amount, setAmount] = useState('')

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 pt-4">
        <ErrorState message={error} onRetry={reload} />
        <Link to="/causas" className="block text-center text-sm font-semibold text-eco-700">
          Volver a causas
        </Link>
      </div>
    )
  }

  if (!cause) {
    return (
      <div className="pt-10 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-2 font-bold">No encontramos la causa</p>
        <Link to="/causas" className="mt-3 inline-block text-sm font-semibold text-eco-700">
          Volver a causas
        </Link>
      </div>
    )
  }

  const Icon = CAUSE_ICON[cause.type]
  const progress = pct(cause.kgCollected, cause.kgGoal)
  const causePoints = cause.pointsBalance + donated

  function doDonate() {
    const n = Number(amount)
    if (!n || n <= 0) return toast.error('Ingresá un monto válido')
    if (!spend(n)) return toast.error('No te alcanzan los XP canjeables')
    donateToCause(id, n)
    setDonateOpen(false)
    setAmount('')
    toast.success(`Donaste ${formatNumber(n)} XP a ${cause!.name} 💚`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-start gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
          style={{ backgroundColor: cause.brandColor }}
        >
          <Icon size={22} />
        </span>
        <div>
          <Badge variant="neutral">{CAUSE_LABEL[cause.type]} · {cause.city}</Badge>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">{cause.name}</h1>
        </div>
      </div>

      {/* Progreso de recolección */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            {formatNumber(cause.kgCollected)} / {formatNumber(cause.kgGoal)} {cause.unitLabel}
          </span>
          <span className="text-sm font-extrabold text-eco-700 dark:text-eco-300">{progress}%</span>
        </div>
        <Progress value={progress} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-base font-extrabold leading-none">{formatNumber(causePoints)}</p>
            <p className="text-[11px] text-muted-foreground">puntos de la causa</p>
          </div>
          <div>
            <p className="text-base font-extrabold leading-none">{formatNumber(cause.supporters)}</p>
            <p className="text-[11px] text-muted-foreground">apoyan</p>
          </div>
          <div>
            <p className="text-base font-extrabold leading-none text-eco-700 dark:text-eco-300">
              {formatNumber(donated)}
            </p>
            <p className="text-[11px] text-muted-foreground">tu aporte (XP)</p>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{cause.story}</p>

      {/* En qué se transforma (wishlist de insumos) */}
      <div>
        <p className="mb-2 font-bold">En qué se transforma</p>
        <div className="space-y-2">
          {cause.needs.map((need) => {
            const np = pct(need.fundedPoints, need.costPoints)
            const done = np >= 100
            return (
              <div key={need.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{need.emoji}</span>
                  <span className="flex-1 text-sm font-semibold">{need.label}</span>
                  {done ? (
                    <Badge variant="success">✓ Cumplido</Badge>
                  ) : (
                    <span className="text-xs font-bold text-eco-700 dark:text-eco-300">{np}%</span>
                  )}
                </div>
                <Progress value={np} className="mt-2 h-2" />
              </div>
            )
          })}
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="primary" size="lg" onClick={() => setDonateOpen(true)}>
          <HandHeart size={18} /> Donar XP
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/escanear')}>
          <QrCode size={18} /> Reciclar
        </Button>
      </div>

      {/* Modal donar */}
      <Modal open={donateOpen} onClose={() => setDonateOpen(false)} title={`Donar XP a ${cause.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tus XP canjeables se convierten en aporte directo a la causa. Disponible:{' '}
            <span className="font-bold text-foreground">{formatNumber(spendableXp)} XP</span>
          </p>
          <div>
            <Label htmlFor="donateAmount">Cantidad de XP</Label>
            <Input
              id="donateAmount"
              type="number"
              inputMode="numeric"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[200, 500, 1000].map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="flex-1 rounded-full bg-muted py-1.5 text-sm font-semibold text-muted-foreground"
              >
                {q}
              </button>
            ))}
          </div>
          <Button block size="lg" onClick={doDonate}>
            <Coins size={18} /> Donar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
