import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Check, Minus, Plus, QrCode, Route, Sparkles } from 'lucide-react'
import { api, ApiError } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useWalletStore } from '@/store/wallet'
import { useActivityStore } from '@/store/activity'
import type { MaterialType, RecyclePoint, ScanResult } from '@/types'
import {
  MATERIAL_EMOJI,
  MATERIAL_LABEL,
  MATERIAL_UNIT,
  formatNumber,
  formatXp,
  parsePointFromQr,
} from '@/lib/utils'
import { BuyFlow } from '@/components/features/BuyFlow'
import { QrScanner } from '@/components/features/QrScanner'
import { Button } from '@/components/ui/button'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

const PENDING_POINT_KEY = 'reciclaxp-scan-point'

type Step = 'scan' | 'form' | 'done'
type Mode = 'reciclar' | 'comprar'
const QUICK = [25, 50, 100, 200]
const MODE_TABS: TabItem<Mode>[] = [
  { value: 'reciclar', label: '♻️ Reciclar' },
  { value: 'comprar', label: '🛒 Comprar' },
]

export default function Scan() {
  const { data: points } = useApi(() => api.getPoints(), [])
  const earn = useWalletStore((s) => s.earn)
  const addActivity = useActivityStore((s) => s.add)

  const [mode, setMode] = useState<Mode>('reciclar')
  const [step, setStep] = useState<Step>('scan')
  const [point, setPoint] = useState<RecyclePoint | null>(null)
  const [material, setMaterial] = useState<MaterialType>('tapitas')
  const [units, setUnits] = useState(50)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)

  function selectPoint(p: RecyclePoint) {
    setPoint(p)
    setMaterial(p.acceptedMaterials[0])
    setStep('form')
  }

  function handleDecode(text: string) {
    const id = parsePointFromQr(text)
    const p = id ? points?.find((x) => x.id === id) : null
    if (p) {
      toast.success(`Punto detectado: ${p.name}`)
      selectPoint(p)
    } else {
      toast.error('QR no reconocido. Probá con un punto de la red.')
    }
  }

  // Deep-link: si llegamos por un QR escaneado con la cámara nativa (?p=<id>),
  // preseleccionamos el punto cuando carga la lista.
  useEffect(() => {
    if (!points) return
    const pending = sessionStorage.getItem(PENDING_POINT_KEY)
    if (!pending) return
    sessionStorage.removeItem(PENDING_POINT_KEY)
    const p = points.find((x) => x.id === pending)
    // selectPoint hace setState: es una inicialización única al cargar los puntos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p) selectPoint(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  async function submit() {
    if (!point) return
    setLoading(true)
    try {
      const res = await api.scan({ pointId: point.id, material, units })
      earn(res.xpEarned)
      addActivity(res.contribution)
      setResult(res)
      setStep('done')
      toast.success(`+${formatXp(res.xpEarned)} acreditados 🌱`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos registrar el aporte')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('scan')
    setPoint(null)
    setUnits(50)
    setResult(null)
  }

  // ─── Paso: resultado ────────────────────────────────────────────────
  if (mode === 'reciclar' && step === 'done' && result) {
    return (
      <div className="flex flex-col items-center pt-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="grid h-24 w-24 place-items-center rounded-full bg-eco-100 text-eco-600 dark:bg-eco-900/40 dark:text-eco-300"
        >
          <Check size={56} strokeWidth={3} />
        </motion.div>
        <h1 className="mt-4 text-2xl font-extrabold">¡Aporte registrado!</h1>
        <p className="text-muted-foreground">{result.contribution.pointName}</p>

        <div className="mt-5 w-full rounded-2xl bg-gradient-to-br from-eco-600 to-eco-800 p-5 text-white">
          <p className="text-sm text-eco-100">Sumaste</p>
          <p className="text-4xl font-extrabold">+{formatNumber(result.xpEarned)} XP</p>
          <p className="mt-1 text-sm text-eco-100">
            {formatNumber(result.contribution.units ?? 0)} {MATERIAL_UNIT[material]}
          </p>
        </div>

        {result.project && (
          <div className="mt-4 w-full rounded-2xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-eco-700 dark:text-eco-300">
              <Sparkles size={16} /> Tu aporte suma a un proyecto
            </div>
            <p className="mt-1 font-bold">{result.project.title}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to={`/proyecto/${result.project.id}`}>
                <Button variant="secondary" size="sm" block>
                  Ver proyecto
                </Button>
              </Link>
              <Link to={`/trazabilidad/${result.project.id}`}>
                <Button variant="secondary" size="sm" block>
                  <Route size={15} /> Trazabilidad
                </Button>
              </Link>
            </div>
          </div>
        )}

        <Button block size="lg" className="mt-4" onClick={reset}>
          Escanear otro
        </Button>
      </div>
    )
  }

  // ─── Paso: formulario de aporte ─────────────────────────────────────
  if (mode === 'reciclar' && step === 'form' && point) {
    return (
      <div className="space-y-5">
        <button onClick={reset} className="text-sm font-semibold text-muted-foreground">
          ← Elegir otro punto
        </button>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-eco-700">
            Punto detectado
          </p>
          <p className="font-bold">{point.name}</p>
          <p className="text-sm text-muted-foreground">{point.address}</p>
        </div>

        <div>
          <p className="mb-2 font-bold">¿Qué depositás?</p>
          <div className="flex flex-wrap gap-2">
            {point.acceptedMaterials.map((m) => (
              <button
                key={m}
                onClick={() => setMaterial(m)}
                className={
                  m === material
                    ? 'rounded-full bg-eco-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground'
                }
              >
                {MATERIAL_EMOJI[m]} {MATERIAL_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-bold">Cantidad</p>
          <div className="flex items-center justify-center gap-5 rounded-2xl border border-border bg-card p-4">
            <button
              onClick={() => setUnits((u) => Math.max(1, u - 10))}
              className="grid h-11 w-11 place-items-center rounded-full bg-muted text-foreground active:scale-95"
              aria-label="Restar"
            >
              <Minus size={18} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-extrabold leading-none">{units}</p>
              <p className="text-xs text-muted-foreground">{MATERIAL_UNIT[material]}</p>
            </div>
            <button
              onClick={() => setUnits((u) => u + 10)}
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
                onClick={() => setUnits(q)}
                className="flex-1 rounded-full bg-muted py-1.5 text-sm font-semibold text-muted-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <Button block size="lg" onClick={submit} disabled={loading}>
          {loading ? 'Registrando…' : 'Registrar aporte'}
        </Button>
      </div>
    )
  }

  // ─── Paso: escáner ──────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Sumar XP</h1>
        <p className="text-sm text-muted-foreground">
          Reciclá o comprá en la red para sumar puntos.
        </p>
      </div>

      <Tabs tabs={MODE_TABS} value={mode} onChange={setMode} />

      {mode === 'comprar' ? (
        <BuyFlow />
      ) : (
        <>
          <QrScanner onDecode={handleDecode} />
          <p className="text-center text-xs text-muted-foreground">
            Apuntá la cámara al QR del punto de reciclaje.
          </p>

          <div>
            <p className="mb-2 font-bold">¿Sin cámara? Elegí el punto</p>
        <div className="space-y-2">
          {!points &&
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          {points?.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPoint(p)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-eco-100 text-eco-700">
                <QrCode size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.address}</p>
              </div>
            </button>
          ))}
            </div>
          </div>
          <Link
            to="/qr-comercios"
            className="block rounded-xl border border-dashed border-border p-3 text-center text-sm font-semibold text-eco-700 dark:text-eco-300"
          >
            <QrCode size={15} className="mr-1 inline" /> ¿Sos comercio? Generá tu QR para probar
          </Link>
        </>
      )}
    </div>
  )
}
