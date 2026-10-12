import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import type { ImpactProject } from '@/types'
import { formatNumber } from '@/lib/utils'
import { sonarTapitas } from '@/lib/sonido'
import { useSonidoStore } from '@/store/sonido'
import { destinoDelProducto } from '@/lib/productosDelClub'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { Marcador } from './Marcador'
import { EscudoOficial } from './LogoDeMarca'

/** Dónde caen las tapitas (en % del ancho) y cuánto tardan: el dibujo y el sonido usan los mismos. */
const CAIDAS = [12, 26, 38, 50, 62, 74, 86]
const DURACION_DE_LA_CAIDA = 0.9
const demoraDeLaCaida = (i: number) => 0.1 + i * 0.07

/** Tapitas que caen al banco: decorativas, no representan una cantidad. */
function TapitasCayendo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full">
      {CAIDAS.map((x, i) => (
        <motion.span
          key={x}
          className="absolute h-3 w-3 rounded-full bg-xp-400 ring-1 ring-xp-600"
          style={{ left: `${x}%` }}
          initial={{ top: '-12%', opacity: 0 }}
          animate={{ top: '42%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: DURACION_DE_LA_CAIDA, delay: demoraDeLaCaida(i), ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

/** Prender o apagar el sonido del festejo. No salta la animación: el toque no llega al festejo. */
function BotonDeSonido() {
  const activo = useSonidoStore((s) => s.activo)
  const alternar = useSonidoStore((s) => s.alternar)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        alternar()
      }}
      aria-label={activo ? 'Silenciar el festejo' : 'Activar el sonido del festejo'}
      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-card/80 text-eco-800 shadow-sm focus-visible:ring-2 focus-visible:ring-ring dark:text-eco-200"
    >
      {activo ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
    </button>
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
  // Un tic por tapita cuando llega al banco. Suena una vez, al aparecer el festejo.
  // La ref lo cuida del doble montaje del modo estricto de React.
  const sono = useRef(false)
  useEffect(() => {
    if (reduce || sono.current) return
    sono.current = true
    sonarTapitas(CAIDAS.map((_, i) => demoraDeLaCaida(i) + DURACION_DE_LA_CAIDA))
  }, [reduce])

  return (
    <div data-testid="festejo" onClick={() => setSaltado(true)} className="w-full cursor-pointer text-left">
      <Cancha conLinea className="p-4 pt-6">
        <BotonDeSonido />
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
