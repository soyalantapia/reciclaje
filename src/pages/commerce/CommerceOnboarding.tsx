import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, Store } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import type { PointType, RecyclePoint, Sponsor, SponsorCategory } from '@/types'
import { cn, shortCode } from '@/lib/utils'
import { Logo } from '@/components/features/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

const RUBROS: { label: string; category: SponsorCategory }[] = [
  { label: 'Comercio', category: 'comercio' },
  { label: 'Estación de servicio', category: 'estacion' },
  { label: 'Marca / cadena', category: 'marca' },
  { label: 'Club / estadio', category: 'estadio' },
  { label: 'Municipio', category: 'municipio' },
  { label: 'Otro', category: 'comercio' },
]
const POINT_TYPES: { value: PointType; label: string }[] = [
  { value: 'deposito', label: 'Depósito de tapitas' },
  { value: 'maquina', label: 'Máquina de reciclaje' },
  { value: 'totem', label: 'Tótem / punto verde' },
]
const PALETTE = ['#059669', '#0ea5e9', '#7c3aed', '#f59e0b', '#e11d48', '#0033A0', '#00704A']

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
function colorFor(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export default function CommerceOnboarding() {
  const navigate = useNavigate()
  const loginAsCommerce = useSessionStore((s) => s.loginAsCommerce)
  const setCreated = useCreatedCommerceStore((s) => s.set)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rubro, setRubro] = useState(RUBROS[0])
  const [city, setCity] = useState('')
  const [pointName, setPointName] = useState('')
  const [pointType, setPointType] = useState<PointType>('deposito')
  const [address, setAddress] = useState('')
  const [plan, setPlan] = useState('Pro')

  const TOTAL = 3

  function next() {
    if (step === 0) {
      if (!name.trim()) return toast.error('Ingresá el nombre de tu comercio')
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error('Ingresá un email válido')
    }
    if (step === 1 && !pointName.trim()) return toast.error('Ponele un nombre a tu punto')
    setStep((s) => Math.min(TOTAL - 1, s + 1))
  }

  function finish() {
    const sponsor: Sponsor = {
      id: `s_new_${shortCode(6)}`,
      name: name.trim(),
      slug: slugify(name) || `comercio-${shortCode(4)}`,
      category: rubro.category,
      brandColor: colorFor(name),
      tagline: 'Comprometido con el reciclaje',
      greenScore: 70,
      kgRecovered: 1200,
    }
    const point: RecyclePoint = {
      id: `p_new_${shortCode(6)}`,
      name: pointName.trim() || `${name} · Punto principal`,
      sponsorId: sponsor.id,
      type: pointType,
      address: address.trim() || 'A definir',
      city: city.trim() || 'CABA',
      x: 50,
      y: 50,
      acceptedMaterials: ['tapitas', 'plastico'],
      openNow: true,
    }
    setCreated(sponsor, point, plan)
    loginAsCommerce(sponsor)
    toast.success(`¡Listo, ${sponsor.name}! Bienvenido a la red 🌿`)
    navigate('/comercio', { replace: true })
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background px-6 pb-10 pt-safe">
      <div className="flex flex-col pt-8">
        <div className="mb-5">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <p className="mb-1.5 text-center text-xs font-semibold text-muted-foreground">
            Paso {step + 1} de {TOTAL}
          </p>
          <Progress value={((step + 1) / TOTAL) * 100} />
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store size={20} className="text-eco-600" />
              <h1 className="text-xl font-extrabold">Tu comercio</h1>
            </div>
            <div>
              <Label htmlFor="oname">Nombre del comercio</Label>
              <Input id="oname" placeholder="Mi Café" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="oemail">Email</Label>
              <Input
                id="oemail"
                type="email"
                inputMode="email"
                placeholder="contacto@micomercio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ocity">Ciudad</Label>
              <Input id="ocity" placeholder="CABA" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label>Rubro</Label>
              <div className="flex flex-wrap gap-2">
                {RUBROS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRubro(r)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-semibold',
                      r.label === rubro.label
                        ? 'bg-eco-600 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-eco-600" />
              <h1 className="text-xl font-extrabold">Tu primer punto</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Donde tus clientes van a reciclar. Generamos su QR automáticamente.
            </p>
            <div>
              <Label htmlFor="opname">Nombre del punto</Label>
              <Input
                id="opname"
                placeholder="Mi Café · Sucursal Centro"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="oaddr">Dirección</Label>
              <Input
                id="oaddr"
                placeholder="Av. Siempreviva 742"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de punto</Label>
              <div className="flex flex-wrap gap-2">
                {POINT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setPointType(t.value)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-semibold',
                      t.value === pointType
                        ? 'bg-eco-600 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-eco-600" />
              <h1 className="text-xl font-extrabold">Elegí tu plan</h1>
            </div>
            <p className="text-sm text-muted-foreground">Podés cambiarlo cuando quieras.</p>
            {[
              { name: 'Básico', fee: '$45.000/mes', desc: '1 punto · beneficios básicos · reporte mensual' },
              { name: 'Pro', fee: '$90.000/mes', desc: 'Hasta 5 puntos · campañas · reportes RSE · Huella Verde' },
              { name: 'Enterprise', fee: 'A medida', desc: 'Multi-sede · API · datos agregados · account manager' },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => setPlan(p.name)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition',
                  p.name === plan
                    ? 'border-eco-500 bg-eco-50 ring-1 ring-eco-500 dark:bg-eco-900/20'
                    : 'border-border bg-card',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">{p.name}</span>
                  <span className="text-sm font-bold text-muted-foreground">{p.fee}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Navegación */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button
              variant="secondary"
              size="lg"
              className="shrink-0"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={18} /> Atrás
            </Button>
          )}
          {step < TOTAL - 1 ? (
            <Button size="lg" className="flex-1" onClick={next}>
              Siguiente <ArrowRight size={18} />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={finish}>
              <Check size={18} /> Crear cuenta
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
