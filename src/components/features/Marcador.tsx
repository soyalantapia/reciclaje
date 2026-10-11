import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { cn, formatNumber } from '@/lib/utils'

interface MarcadorProps {
  valor: number
  etiqueta: string
  /** Si viene, cuenta desde este número hasta `valor`. */
  desde?: number
  tamano?: 'grande' | 'mediano'
  className?: string
}

/** Un número grande como el tablero del estadio. Con movimiento reducido, va directo al valor. */
export function Marcador({ valor, etiqueta, desde, tamano = 'grande', className }: MarcadorProps) {
  const reduce = useReducedMotion()
  const anima = desde !== undefined && !reduce
  const [animado, setAnimado] = useState(desde ?? valor)

  useEffect(() => {
    if (!anima || desde === undefined) return
    const control = animate(desde, valor, {
      duration: 1.2,
      delay: 0.3,
      ease: 'easeOut',
      onUpdate: (v) => setAnimado(Math.round(v)),
    })
    return () => control.stop()
  }, [anima, desde, valor])

  const numero = anima ? animado : valor
  return (
    <div className={cn('leading-none', className)}>
      <p
        className={cn(
          'font-marcador font-bold tabular-nums text-eco-900 dark:text-eco-50',
          tamano === 'grande' ? 'text-5xl' : 'text-4xl',
        )}
      >
        {formatNumber(numero)}
      </p>
      <p className="mt-1 text-xs font-semibold text-eco-800 dark:text-eco-200">{etiqueta}</p>
    </div>
  )
}
