import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Check, Minus, Plus, Store } from 'lucide-react'
import { api, ApiError } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useWalletStore } from '@/store/wallet'
import { useActivityStore } from '@/store/activity'
import type { PurchaseResult, Sponsor } from '@/types'
import { formatNumber, formatXp } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const QUICK = [1000, 3000, 5000, 10000]

/** Segunda vía de XP: consumir en comercios de la red (escaneo de ticket simulado). */
export function BuyFlow() {
  const { data: sponsors } = useApi(() => api.getSponsors(), [])
  const earn = useWalletStore((s) => s.earn)
  const addActivity = useActivityStore((s) => s.add)

  const [step, setStep] = useState<'pick' | 'amount' | 'done'>('pick')
  const [sponsor, setSponsor] = useState<Sponsor | null>(null)
  const [amount, setAmount] = useState(2000)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PurchaseResult | null>(null)

  const commerces = sponsors?.filter((s) => s.category !== 'municipio') ?? []

  async function submit() {
    if (!sponsor) return
    setLoading(true)
    try {
      const res = await api.purchase({ sponsorId: sponsor.id, amount })
      earn(res.xpEarned)
      addActivity(res.purchase)
      setResult(res)
      setStep('done')
      toast.success(`+${formatXp(res.xpEarned)} por tu compra 🛍️`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos registrar la compra')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('pick')
    setSponsor(null)
    setAmount(2000)
    setResult(null)
  }

  if (step === 'done' && result) {
    return (
      <div className="flex flex-col items-center pt-2 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-eco-100 text-eco-600 dark:bg-eco-900/40 dark:text-eco-300"
        >
          <Check size={44} strokeWidth={3} />
        </motion.div>
        <h2 className="mt-3 text-xl font-extrabold">¡Compra registrada!</h2>
        <p className="text-muted-foreground">
          {result.purchase.sponsorName} · ${formatNumber(result.purchase.amountArs)}
        </p>
        <div className="mt-4 w-full rounded-2xl bg-gradient-to-br from-eco-600 to-eco-800 p-5 text-white">
          <p className="text-sm text-eco-100">Sumaste</p>
          <p className="text-3xl font-extrabold">+{formatNumber(result.xpEarned)} XP</p>
        </div>
        <Button block size="lg" className="mt-4" onClick={reset}>
          Registrar otra compra
        </Button>
      </div>
    )
  }

  if (step === 'amount' && sponsor) {
    return (
      <div className="space-y-5">
        <button onClick={reset} className="text-sm font-semibold text-muted-foreground">
          ← Elegir otro comercio
        </button>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-eco-700 dark:text-eco-300">
            Comercio
          </p>
          <p className="font-bold">{sponsor.name}</p>
        </div>
        <div>
          <p className="mb-2 font-bold">¿Cuánto gastaste?</p>
          <div className="flex items-center justify-center gap-5 rounded-2xl border border-border bg-card p-4">
            <button
              onClick={() => setAmount((a) => Math.max(100, a - 500))}
              className="grid h-11 w-11 place-items-center rounded-full bg-muted active:scale-95"
              aria-label="Restar"
            >
              <Minus size={18} />
            </button>
            <div className="text-center">
              <p className="text-3xl font-extrabold leading-none">${formatNumber(amount)}</p>
              <p className="text-xs text-muted-foreground">en tu compra</p>
            </div>
            <button
              onClick={() => setAmount((a) => a + 500)}
              className="grid h-11 w-11 place-items-center rounded-full bg-eco-600 text-white active:scale-95"
              aria-label="Sumar"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(q)}
                className="flex-1 rounded-full bg-muted py-1.5 text-sm font-semibold text-muted-foreground"
              >
                ${formatNumber(q)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Sumás ~{formatNumber(Math.max(1, Math.round(amount / 50)))} XP
          </p>
        </div>
        <Button block size="lg" onClick={submit} disabled={loading}>
          {loading ? 'Registrando…' : 'Registrar compra'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Escaneá el ticket de tu compra en un comercio de la red. (Demo: elegí el comercio)
      </p>
      {!sponsors && [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      {commerces.map((s) => (
        <button
          key={s.id}
          onClick={() => {
            setSponsor(s)
            setStep('amount')
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left active:scale-[0.99]"
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-lg font-extrabold text-white"
            style={{ backgroundColor: s.brandColor }}
          >
            {s.name[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{s.name}</p>
            <p className="truncate text-xs text-muted-foreground">{s.tagline}</p>
          </div>
          <Store size={18} className="text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}
