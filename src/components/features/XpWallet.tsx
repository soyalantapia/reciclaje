import { Coins, Trophy } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { xpToNextLevel } from '@/lib/copy'
import { formatNumber } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

/**
 * Wallet con DOS saldos separados (doc §9):
 *  - Reputación: mérito histórico para ranking/nivel. No se gasta.
 *  - Canjeable: saldo para beneficios.
 */
export function XpWallet() {
  const { reputationXp, spendableXp, level, levelName } = useWalletStore()
  const toNext = xpToNextLevel(reputationXp)

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-eco-600 to-eco-800 p-5 text-white shadow-lg shadow-eco-600/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-eco-100">
            Nivel {level}
          </p>
          <p className="text-xl font-extrabold leading-tight">{levelName}</p>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
          {toNext > 0 ? `${formatNumber(toNext)} XP al siguiente` : '¡Nivel máximo!'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-eco-100">
            <Trophy size={14} /> Reputación
          </div>
          <p className="mt-1 text-2xl font-extrabold leading-none">
            {formatNumber(reputationXp)}
          </p>
          <p className="text-[11px] text-eco-100/80">mérito · ranking</p>
        </div>
        <div className="rounded-xl bg-xp-400 p-3 text-ink-900">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Coins size={14} /> Canjeable
          </div>
          <p className="mt-1 text-2xl font-extrabold leading-none">
            {formatNumber(spendableXp)}
          </p>
          <p className="text-[11px] font-medium text-ink-800/80">para beneficios</p>
        </div>
      </div>

      {toNext > 0 && (
        <div className="mt-4">
          <Progress
            value={100 - Math.min(100, (toNext / (toNext + 1000)) * 100)}
            className="bg-white/20"
            barClassName="bg-xp-400"
          />
        </div>
      )}
    </div>
  )
}
