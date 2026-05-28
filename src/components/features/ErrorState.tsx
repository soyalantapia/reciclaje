import { AlertTriangle, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props {
  message?: string
  onRetry?: () => void
  className?: string
}

/** Estado de error reutilizable: nunca dejar una pantalla muda ante un fallo. */
export function ErrorState({ message, onRetry, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center',
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <AlertTriangle size={26} />
      </span>
      <p className="mt-3 font-bold">No pudimos cargar esto</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {message ?? 'Revisá tu conexión e intentá de nuevo.'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw size={15} /> Reintentar
        </Button>
      )}
    </div>
  )
}
