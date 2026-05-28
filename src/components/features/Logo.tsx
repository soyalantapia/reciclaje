import { Recycle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  withText?: boolean
  className?: string
}

export function Logo({ withText = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-eco-600 text-white shadow-sm">
        <Recycle size={20} strokeWidth={2.4} />
      </span>
      {withText && (
        <span className="text-lg font-extrabold tracking-tight">
          Recicla<span className="text-eco-600">XP</span>
        </span>
      )}
    </div>
  )
}
