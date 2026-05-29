import { useState } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useWalletStore } from '@/store/wallet'
import { useCouponsStore } from '@/store/coupons'
import type { Benefit, BenefitCategory, Coupon } from '@/types'
import { formatNumber } from '@/lib/utils'
import { BenefitCard } from '@/components/features/BenefitCard'
import { QrCoupon } from '@/components/features/QrCoupon'
import { ErrorState } from '@/components/features/ErrorState'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { CardGrid } from '@/components/ui/card-grid'

type Filter = 'todos' | BenefitCategory
const TABS: TabItem<Filter>[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'combustible', label: 'Combustible' },
  { value: 'experiencia', label: 'Experiencias' },
  { value: 'producto', label: 'Productos' },
  { value: 'descuento', label: 'Descuentos' },
  { value: 'entrada', label: 'Entradas' },
]

export default function Marketplace() {
  const isPremium = useSessionStore((s) => s.user?.isPremium ?? false)
  const spendableXp = useWalletStore((s) => s.spendableXp)
  const spend = useWalletStore((s) => s.spend)
  const addCoupon = useCouponsStore((s) => s.add)
  const { data: benefits, error, reload } = useApi(() => api.getBenefits(), [])

  const [filter, setFilter] = useState<Filter>('todos')
  const [pending, setPending] = useState<Benefit | null>(null)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)

  const visible = benefits?.filter((b) => filter === 'todos' || b.category === filter) ?? []

  async function confirmRedeem() {
    if (!pending) return
    const cost = isPremium && pending.premiumCostXp != null ? pending.premiumCostXp : pending.costXp
    if (!spend(cost)) {
      toast.error('No te alcanzan los XP canjeables')
      return
    }
    setLoading(true)
    try {
      const c = await api.redeemBenefit(pending.id)
      addCoupon(c)
      setPending(null)
      setCoupon(c)
      toast.success('¡Beneficio canjeado! 🎟️')
    } catch (e) {
      // El canje falló tras descontar: devolvemos los XP.
      useWalletStore.setState((s) => ({ spendableXp: s.spendableXp + cost }))
      toast.error(e instanceof ApiError ? e.message : 'No pudimos canjear')
    } finally {
      setLoading(false)
    }
  }

  const pendingCost =
    pending && isPremium && pending.premiumCostXp != null
      ? pending.premiumCostXp
      : pending?.costXp ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Beneficios</h1>
        <p className="text-sm text-muted-foreground">Canjeá tus XP por recompensas reales.</p>
      </div>

      <Tabs tabs={TABS} value={filter} onChange={setFilter} />

      {error && !benefits ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          {!benefits && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          )}

          <CardGrid cols={3}>
            {visible.map((b) => (
              <BenefitCard
                key={b.id}
                benefit={b}
                isPremium={isPremium}
                spendableXp={spendableXp}
                onRedeem={setPending}
              />
            ))}
            {benefits && visible.length === 0 && (
              <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                No hay beneficios en esta categoría.
              </p>
            )}
          </CardGrid>
        </>
      )}

      {/* Confirmación de canje */}
      <Modal open={!!pending} onClose={() => setPending(null)} title="Confirmar canje">
        {pending && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-2xl">
                {pending.emoji}
              </span>
              <div>
                <p className="font-bold">{pending.title}</p>
                <p className="text-sm text-muted-foreground">{pending.sponsorName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
              <span className="font-semibold">Costo</span>
              <span className="font-extrabold text-eco-700">{formatNumber(pendingCost)} XP</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
              <span className="font-semibold">Saldo luego del canje</span>
              <span className="font-extrabold">{formatNumber(spendableXp - pendingCost)} XP</span>
            </div>
            <Button block size="lg" onClick={confirmRedeem} disabled={loading}>
              {loading ? 'Canjeando…' : 'Confirmar canje'}
            </Button>
          </div>
        )}
      </Modal>

      {/* Cupón generado */}
      <Modal open={!!coupon} onClose={() => setCoupon(null)} title="Tu cupón">
        {coupon && <QrCoupon coupon={coupon} />}
      </Modal>
    </div>
  )
}
