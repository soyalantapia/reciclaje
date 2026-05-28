import { toast } from 'sonner'
import { Check, CreditCard } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { cn, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const TIERS = [
  {
    name: 'Básico',
    fee: 45000,
    current: false,
    includes: ['1 punto de reciclaje', 'Beneficios básicos', 'Reporte mensual'],
  },
  {
    name: 'Pro',
    fee: 90000,
    current: true,
    includes: [
      'Hasta 5 puntos / máquinas',
      'Beneficios y campañas ilimitadas',
      'Reportes RSE exportables',
      'Huella Verde + placa',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Enterprise',
    fee: 0,
    current: false,
    includes: ['Multi-sede', 'API e integraciones', 'Datos agregados', 'Account manager'],
  },
]

export default function CommercePlan() {
  const commerce = useSessionStore((s) => s.commerce)
  if (!commerce) return null

  const nextCharge = new Date()
  nextCharge.setMonth(nextCharge.getMonth() + 1)
  nextCharge.setDate(1)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Tu plan</h1>
        <p className="text-sm text-muted-foreground">Qué incluye tu suscripción y cómo escalar.</p>
      </div>

      {/* Resumen de facturación */}
      <div className="rounded-2xl border border-eco-200 bg-eco-50 p-5 dark:border-eco-700/40 dark:bg-eco-900/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-eco-700 dark:text-eco-300">
              Plan activo
            </p>
            <p className="text-xl font-extrabold">Pro · ${formatNumber(90000)}/mes</p>
          </div>
          <Badge variant="eco">Al día</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Próximo cobro:{' '}
          <span className="font-semibold text-foreground">
            {nextCharge.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => toast('Gestión de facturación — próximamente')}
        >
          <CreditCard size={15} /> Gestionar facturación
        </Button>
      </div>

      {/* Tiers */}
      <div className="space-y-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              'rounded-2xl border bg-card p-5 shadow-sm',
              t.current ? 'border-eco-500 ring-1 ring-eco-500' : 'border-border',
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold">{t.name}</p>
              {t.current ? (
                <Badge variant="eco">Tu plan</Badge>
              ) : (
                <span className="text-sm font-bold text-muted-foreground">
                  {t.fee > 0 ? `$${formatNumber(t.fee)}/mes` : 'A medida'}
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1.5">
              {t.includes.map((inc) => (
                <li key={inc} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-eco-600" /> {inc}
                </li>
              ))}
            </ul>
            {!t.current && (
              <Button
                block
                size="sm"
                variant={t.fee === 0 ? 'secondary' : 'primary'}
                className="mt-4"
                onClick={() =>
                  toast.success(
                    t.fee === 0 ? 'Te contactamos para armar tu plan 🤝' : `Cambio a ${t.name} solicitado`,
                  )
                }
              >
                {t.fee === 0 ? 'Hablar con ventas' : `Cambiar a ${t.name}`}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
