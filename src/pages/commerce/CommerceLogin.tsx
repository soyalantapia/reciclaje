import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, KeyRound, Store } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import type { Sponsor } from '@/types'
import { Logo } from '@/components/features/Logo'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/ui/otp-input'
import { Skeleton } from '@/components/ui/skeleton'

const DEMO_CODE = '123456'
const DEMO_EMAIL = 'demo@reciclaxp.app'

export default function CommerceLogin() {
  const navigate = useNavigate()
  const loginAsCommerce = useSessionStore((s) => s.loginAsCommerce)
  const { data: sponsors, loading, error, reload } = useApi(() => api.getSponsors(), [])

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resolved, setResolved] = useState<Sponsor | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Cuentas de prueba (email → comercio). La primaria es la "a mano".
  const accounts = useMemo(() => {
    if (!sponsors) return []
    const bySlug = (slug: string) => sponsors.find((s) => s.slug === slug)
    return [
      { email: DEMO_EMAIL, sponsor: bySlug('mcdonalds') },
      { email: 'ypf@reciclaxp.app', sponsor: bySlug('ypf') },
      { email: 'river@reciclaxp.app', sponsor: bySlug('river') },
      { email: 'starbucks@reciclaxp.app', sponsor: bySlug('starbucks') },
    ].filter((a): a is { email: string; sponsor: Sponsor } => Boolean(a.sponsor))
  }, [sponsors])

  function resolveSponsor(value: string): Sponsor | null {
    const e = value.trim().toLowerCase()
    if (!sponsors) return null
    if (e === DEMO_EMAIL) return sponsors.find((s) => s.slug === 'mcdonalds') ?? null
    const m = e.match(/^([\w-]+)@reciclaxp\.app$/)
    if (m) return sponsors.find((s) => s.slug === m[1]) ?? null
    return null
  }

  function sendCode(toEmail?: string) {
    const value = (toEmail ?? email).trim()
    if (toEmail) setEmail(toEmail)
    if (!value) return toast.error('Ingresá tu email')
    const sp = resolveSponsor(value)
    if (!sp) {
      return toast.error('No encontramos un comercio con ese email. Usá una cuenta de prueba o registrate.')
    }
    setResolved(sp)
    setOtp('')
    setStep('otp')
    toast.success('Te enviamos un código de 6 dígitos 📩')
  }

  function verify(code: string) {
    if (code !== DEMO_CODE) return toast.error('Código incorrecto. (Demo: 123456)')
    if (!resolved) return
    setVerifying(true)
    loginAsCommerce(resolved)
    toast.success(`Bienvenido, ${resolved.name} 🌿`)
    navigate('/comercio', { replace: true })
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-eco-grid bg-background px-6 pb-10 pt-safe">
      <div className="flex flex-col pt-10">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-eco-100 px-3 py-1 text-xs font-bold text-eco-800 dark:bg-eco-900/40 dark:text-eco-200">
            <Store size={14} /> Panel del comercio
          </div>
          <h1 className="text-2xl font-extrabold leading-tight">Ingresá a tu panel</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {step === 'email'
              ? 'Te enviamos un código a tu email para entrar de forma segura.'
              : `Ingresá el código que enviamos a ${email}.`}
          </p>
        </div>

        {error && !sponsors ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : step === 'email' ? (
          <>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cemail">Email del comercio</Label>
                <Input
                  id="cemail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tucomercio@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                />
              </div>
              <Button block size="lg" onClick={() => sendCode()}>
                Enviar código <ArrowRight size={18} />
              </Button>
            </div>

            {/* Cuenta de prueba a mano */}
            <div className="mt-6 rounded-2xl border border-eco-200 bg-eco-50 p-4 dark:border-eco-700/40 dark:bg-eco-900/20">
              <p className="text-xs font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                Cuenta de prueba
              </p>
              <p className="mt-1 text-sm">
                <span className="font-mono font-semibold">{DEMO_EMAIL}</span> · código{' '}
                <span className="font-mono font-bold">{DEMO_CODE}</span>
              </p>
              <p className="text-xs text-muted-foreground">Entrás como McDonald's.</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => sendCode(DEMO_EMAIL)}
              >
                Usar cuenta de prueba
              </Button>
            </div>

            {/* Otros comercios de prueba */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Otros comercios demo</p>
              <div className="flex flex-wrap gap-2">
                {accounts
                  .filter((a) => a.email !== DEMO_EMAIL)
                  .map((a) => (
                    <button
                      key={a.email}
                      onClick={() => sendCode(a.email)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold"
                    >
                      <span
                        className="grid h-5 w-5 place-items-center rounded text-[11px] font-bold text-white"
                        style={{ backgroundColor: a.sponsor.brandColor }}
                      >
                        {a.sponsor.name[0]}
                      </span>
                      {a.sponsor.name}
                    </button>
                  ))}
              </div>
            </div>

            <Link
              to="/comercio/sumate"
              className="mt-6 block rounded-xl border border-dashed border-border p-3 text-center text-sm font-semibold text-eco-700 dark:text-eco-300"
            >
              🏪 ¿Tu comercio no está? Conocé la red y registrate →
            </Link>
          </>
        ) : (
          <>
            <OtpInput value={otp} onChange={setOtp} onComplete={verify} autoFocus />

            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              <KeyRound size={15} /> Código de prueba:{' '}
              <span className="font-mono font-bold text-foreground">{DEMO_CODE}</span>
            </div>

            <Button block size="lg" className="mt-4" onClick={() => verify(otp)} disabled={verifying}>
              Verificar y entrar
            </Button>

            <div className="mt-4 flex justify-center gap-4 text-sm">
              <button
                onClick={() => setStep('email')}
                className="font-semibold text-muted-foreground"
              >
                Cambiar email
              </button>
              <button
                onClick={() => toast.success('Código reenviado (demo: 123456)')}
                className="font-semibold text-eco-700 dark:text-eco-300"
              >
                Reenviar código
              </button>
            </div>
          </>
        )}

        <Link
          to="/login"
          className="mt-8 block text-center text-sm font-semibold text-eco-700 dark:text-eco-300"
        >
          ¿Sos usuario? Entrá a la app →
        </Link>
      </div>
    </div>
  )
}
