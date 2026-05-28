import { Coins, Lock } from 'lucide-react'
import type { Benefit } from '@/types'
import { cn, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  benefit: Benefit
  isPremium: boolean
  spendableXp: number
  onRedeem: (benefit: Benefit) => void
}

const CATEGORY_LABEL: Record<Benefit['category'], string> = {
  combustible: 'Combustible',
  descuento: 'Descuento',
  experiencia: 'Experiencia',
  producto: 'Producto',
  merch: 'Merch',
  entrada: 'Entrada',
}

export function BenefitCard({ benefit, isPremium, spendableXp, onRedeem }: Props) {
  const hasPremiumPrice = isPremium && benefit.premiumCostXp != null
  const cost = hasPremiumPrice ? benefit.premiumCostXp! : benefit.costXp
  const canAfford = spendableXp >= cost
  const outOfStock = benefit.stock <= 0

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-2xl">
          {benefit.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold leading-tight">{benefit.title}</p>
          <p className="truncate text-xs text-muted-foreground">{benefit.sponsorName}</p>
          <Badge variant="neutral" className="mt-1">
            {CATEGORY_LABEL[benefit.category]}
          </Badge>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{benefit.description}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <Coins size={16} className="text-xp-600" />
          <span className="text-lg font-extrabold text-foreground">{formatNumber(cost)}</span>
          {hasPremiumPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNumber(benefit.costXp)}
            </span>
          )}
          <span className="text-xs font-semibold text-muted-foreground">XP</span>
        </div>
        {hasPremiumPrice && <Badge variant="xp">Premium</Badge>}
      </div>

      <Button
        size="sm"
        block
        className="mt-3"
        variant={canAfford && !outOfStock ? 'primary' : 'secondary'}
        disabled={!canAfford || outOfStock}
        onClick={() => onRedeem(benefit)}
      >
        {outOfStock ? (
          'Sin stock'
        ) : canAfford ? (
          'Canjear'
        ) : (
          <span className={cn('inline-flex items-center gap-1')}>
            <Lock size={14} /> Te faltan {formatNumber(cost - spendableXp)} XP
          </span>
        )}
      </Button>
    </div>
  )
}
