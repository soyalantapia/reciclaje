import type { RankingEntry } from '@/types'
import { cn, formatNumber } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function RankingRow({ entry }: { entry: RankingEntry }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5',
        entry.isCurrentUser
          ? 'bg-eco-50 ring-1 ring-eco-300 dark:bg-eco-900/30 dark:ring-eco-700/40'
          : 'bg-card',
      )}
    >
      <span className="w-7 text-center text-base font-extrabold text-muted-foreground">
        {MEDAL[entry.position] ?? entry.position}
      </span>
      <Avatar name={entry.name} color={entry.avatarColor} size="sm" />
      <span
        className={cn(
          'flex-1 truncate font-semibold',
          entry.isCurrentUser && 'text-eco-800 dark:text-eco-200',
        )}
      >
        {entry.name}
      </span>
      <span className="text-sm font-extrabold text-eco-700">
        {formatNumber(entry.xpThisMonth)} XP
      </span>
    </div>
  )
}
