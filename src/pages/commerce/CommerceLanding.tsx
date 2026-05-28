import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  Leaf,
  QrCode,
  Recycle,
  ShieldCheck,
  Store,
  TrendingUp,
} from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'RSE verificable',
    desc: 'Reportes de impacto descargables (CSV/PDF) para auditoría y comunicación, con datos reales.',
  },
  {
    icon: TrendingUp,
    title: 'Tráfico de clientes',
    desc: 'Beneficios y premios que traen gente a tu local y la hacen volver.',
  },
  {
    icon: Leaf,
    title: 'Huella Verde',
    desc: 'Una reputación ambiental pública que sube con cada aporte y podés comunicar.',
  },
  {
    icon: BarChart3,
    title: 'Datos en vivo',
    desc: 'Panel con usuarios, aportes, kg recuperados y campañas, en tiempo real.',
  },
]

const STEPS = [
  { icon: QrCode, title: 'Poné tu punto y tu QR', desc: 'Instalás un depósito o máquina; generamos el QR de tu comercio.' },
  { icon: Recycle, title: 'Tus clientes reciclan', desc: 'Escanean, aportan y suman XP. Vos sumás impacto y datos.' },
  { icon: BarChart3, title: 'Publicás y medís', desc: 'Lanzás beneficios y campañas, y ves tu impacto y reportes.' },
]

const TIERS = [
  { name: 'Básico', fee: '$45.000/mes', includes: ['1 punto', 'Beneficios básicos', 'Reporte mensual'] },
  {
    name: 'Pro',
    fee: '$90.000/mes',
    featured: true,
    includes: ['Hasta 5 puntos', 'Campañas ilimitadas', 'Reportes RSE', 'Huella Verde + placa'],
  },
  { name: 'Enterprise', fee: 'A medida', includes: ['Multi-sede', 'API', 'Datos agregados', 'Account manager'] },
]

export default function CommerceLanding() {
  const { data: sponsors } = useApi(() => api.getSponsors(), [])

  const stats = useMemo(() => {
    const brands = sponsors?.length ?? 9
    const kg = sponsors?.reduce((acc, s) => acc + s.kgRecovered, 0) ?? 24000
    return { brands, kg }
  }, [sponsors])

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background pb-12">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-b from-eco-600 to-eco-800 px-6 pb-10 pt-safe text-white">
        <div className="bg-eco-grid absolute inset-0 opacity-20" />
        <div className="relative pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white">
                <Recycle size={20} strokeWidth={2.4} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">ReciclaXP</span>
            </div>
            <Link to="/comercio/login" className="text-sm font-semibold text-white/90">
              Ingresar
            </Link>
          </div>

          <div className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <Store size={14} /> Para comercios y marcas
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">
            Tu comercio, parte de la economía circular.
          </h1>
          <p className="mt-3 text-sm text-eco-50/90">
            Sumate a ReciclaXP: tus clientes reciclan, ganan XP y vuelven por sus beneficios. Vos
            ganás RSE verificable, tráfico y tu Huella Verde.
          </p>

          <div className="mt-6 space-y-2">
            <Link to="/comercio/onboarding" className="block">
              <Button variant="xp" block size="lg">
                Registrá tu comercio <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/comercio/login" className="block">
              <Button variant="secondary" block size="lg">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>

          {/* stats de la red */}
          <div className="mt-8 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-extrabold leading-none">{stats.brands}</p>
              <p className="text-[11px] text-eco-50/80">marcas aliadas</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none">+24k</p>
              <p className="text-[11px] text-eco-50/80">usuarios reciclando</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none">{formatNumber(Math.round(stats.kg / 1000))} tn</p>
              <p className="text-[11px] text-eco-50/80">recuperadas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Qué ganás */}
      <section className="px-6 pt-10">
        <h2 className="text-xl font-extrabold">Qué gana tu comercio</h2>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {VALUES.map((v) => (
            <div key={v.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300">
                <v.icon size={20} />
              </span>
              <div>
                <p className="font-bold leading-tight">{v.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-6 pt-10">
        <h2 className="text-xl font-extrabold">Cómo funciona</h2>
        <div className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-eco-600 text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <s.icon size={16} className="text-eco-600" />
                  <p className="font-bold leading-tight">{s.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas en la red */}
      <section className="px-6 pt-10">
        <h2 className="text-xl font-extrabold">Marcas que ya están</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(sponsors ?? []).map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold"
            >
              <span
                className="grid h-5 w-5 place-items-center rounded text-[11px] font-bold text-white"
                style={{ backgroundColor: s.brandColor }}
              >
                {s.name[0]}
              </span>
              {s.name}
            </span>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 pt-10">
        <h2 className="text-xl font-extrabold">Planes</h2>
        <div className="mt-4 space-y-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                t.featured
                  ? 'rounded-2xl border border-eco-500 bg-eco-50 p-5 ring-1 ring-eco-500 dark:bg-eco-900/20'
                  : 'rounded-2xl border border-border bg-card p-5'
              }
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold">{t.name}</span>
                <span className="text-sm font-bold text-muted-foreground">{t.fee}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {t.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-eco-600" /> {inc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pt-10">
        <div className="rounded-3xl bg-gradient-to-br from-eco-600 to-eco-800 p-6 text-center text-white">
          <Leaf size={28} className="mx-auto" />
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">Sumá tu comercio hoy</h2>
          <p className="mt-1 text-sm text-eco-50/90">
            En minutos tenés tu QR, tus beneficios y tu panel de impacto.
          </p>
          <Link to="/comercio/onboarding" className="mt-4 block">
            <Button variant="xp" block size="lg">
              Registrarse <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
        <Link
          to="/"
          className="mt-6 block text-center text-sm font-semibold text-eco-700 dark:text-eco-300"
        >
          ¿Sos usuario? Entrá a la app →
        </Link>
      </section>
    </div>
  )
}
