import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ImpactProject } from '@/types'
import { formatNumber } from '@/lib/utils'
import { destinoDelProducto } from '@/lib/productosDelClub'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { Marcador } from './Marcador'
import { EscudoOficial } from './LogoDeMarca'

/** Tapitas que caen al banco: decorativas, no representan una cantidad. */
function TapitasCayendo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full">
      {[12, 26, 38, 50, 62, 74, 86].map((x, i) => (
        <motion.span
          key={x}
          className="absolute h-3 w-3 rounded-full bg-xp-400 ring-1 ring-xp-600"
          style={{ left: `${x}%` }}
          initial={{ top: '-12%', opacity: 0 }}
          animate={{ top: '42%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

/**
 * El festejo del aporte. Las tapitas caen al banco, la tuya se enciende en ámbar, el marcador sube
 * del total anterior al nuevo y aparece el XP. Dura unos 2 segundos; tocar salta al final, y con
 * movimiento reducido se ve todo quieto.
 */
export function FestejoDelAporte({ proyecto, unidades, xp }: { proyecto: ImpactProject; unidades: number; xp: number }) {
  const reduce = useReducedMotion()
  const [saltado, setSaltado] = useState(false)
  const quieto = Boolean(reduce) || saltado
  const antes = Math.max(0, proyecto.collectedUnits - unidades)
  // El banco del club es «el banco de la hinchada»; un producto del panel se nombra por su nombre.
  const destino = destinoDelProducto(proyecto)

  return (
    <div data-testid="festejo" onClick={() => setSaltado(true)} className="w-full cursor-pointer text-left">
      <Cancha conLinea className="p-4 pt-6">
        <p className="flex items-center gap-1.5 text-xs font-bold text-eco-800 dark:text-eco-200">
          <EscudoOficial sponsorId={proyecto.sponsorId} nombre={proyecto.sponsorName} />
          {proyecto.sponsorName} · {destino.rotulo}
        </p>
        <div className="relative mt-2">
          {!quieto && <TapitasCayendo />}
          <BancoDeTapitas
            forma={proyecto.forma}
            progreso={proyecto.goalUnits > 0 ? proyecto.collectedUnits / proyecto.goalUnits : 0}
            propias={proyecto.collectedUnits > 0 ? proyecto.myContributionUnits / proyecto.collectedUnits : 0}
            animarTuyas={!quieto}
          />
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <Marcador
            valor={proyecto.collectedUnits}
            desde={quieto ? undefined : antes}
            etiqueta={`${proyecto.unitLabel} de la hinchada`}
          />
          <motion.p
            // `initial` sólo se lee al montar: al tocar, la `key` lo vuelve a montar ya en su estado final.
            key={quieto ? 'quieto' : 'animado'}
            initial={quieto ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, type: 'spring', damping: 12 }}
            className="font-marcador text-4xl font-bold tabular-nums text-xp-700 dark:text-xp-400"
          >
            +{formatNumber(xp)} XP
          </motion.p>
        </div>
      </Cancha>
      <p className="mt-3 text-center text-lg font-extrabold leading-tight">
        Tus {formatNumber(unidades)} {proyecto.unitLabel} ya suman {destino.frase}
      </p>
    </div>
  )
}
