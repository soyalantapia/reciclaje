import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  Fuel,
  Gift,
  HeartHandshake,
  Landmark,
  Leaf,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  QrCode,
  Recycle,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Store,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { LandingHeader } from '@/components/landing/LandingHeader'

// TODO: reemplazá por tus datos reales antes de publicar.
const CONTACT = {
  whatsapp: '5493510000000', // formato internacional, sin "+" ni espacios
  email: 'hola@reciclaxp.app',
}
const waLink = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
  'Hola! Quiero sumar mi comercio a ReciclaXP 🌿',
)}`

const PROBLEMS = [
  {
    icon: Users,
    title: 'Competís por cada cliente',
    desc: 'Cuesta cada vez más que la gente entre, vuelva y te elija por sobre el de al lado.',
  },
  {
    icon: ShieldAlert,
    title: 'Te piden sustentabilidad, pero no podés probarla',
    desc: 'Acciones de RSE que terminan en un PDF lindo y sin datos reales para mostrar.',
  },
  {
    icon: Wallet,
    title: 'Las promos regalan margen',
    desc: 'Descuentos que no traen gente nueva ni te dejan nada para comunicar.',
  },
]

const FEATURES = [
  { icon: TrendingUp, title: 'Tráfico que vuelve', desc: 'Beneficios y premios que traen gente nueva y la hacen volver por más.' },
  { icon: ShieldCheck, title: 'RSE verificable', desc: 'Reportes de impacto descargables (CSV/PDF) para auditoría y comunicación.' },
  { icon: Leaf, title: 'Huella Verde + placa', desc: 'Reputación ambiental pública que sube con cada aporte, lista para tu vidriera.' },
  { icon: BarChart3, title: 'Datos en vivo', desc: 'Panel con usuarios, aportes, kg recuperados y campañas, en tiempo real.' },
  { icon: Megaphone, title: 'Beneficios y campañas', desc: 'Publicás premios, multiplicadores y desafíos cuando querés, desde tu panel.' },
  { icon: QrCode, title: 'QR por punto', desc: 'Cada punto tiene su QR para descargar e imprimir. Tu cliente escanea y aporta.' },
]

const STEPS = [
  { icon: QrCode, title: 'Poné tu punto y tu QR', desc: 'Coordinamos la instalación del depósito o máquina y te generamos el QR de tu comercio.' },
  { icon: Recycle, title: 'Tus clientes reciclan', desc: 'Escanean, aportan y suman XP. Vuelven a tu local a canjear sus beneficios.' },
  { icon: BarChart3, title: 'Publicás y medís', desc: 'Lanzás beneficios y campañas, y ves tu impacto y tus reportes en vivo.' },
]

const VERTICALS = [
  { icon: Store, title: 'Comercios', desc: 'Cafés, restós, kioscos y locales que quieren tráfico y fidelizar.' },
  { icon: Fuel, title: 'Estaciones de servicio', desc: 'Puntos de alto flujo que suman un servicio verde con datos.' },
  { icon: ShieldCheck, title: 'Marcas', desc: 'RSE verificable y Huella Verde para comunicar con respaldo.' },
  { icon: Trophy, title: 'Clubes y estadios', desc: 'Activá a la hinchada con campañas e impacto compartido.' },
  { icon: Landmark, title: 'Municipios', desc: 'Puntos verdes con trazabilidad y reportes para la gestión.' },
  { icon: Building2, title: 'Cadenas y multi-sede', desc: 'Datos agregados, API y account manager para escalar.' },
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

const FAQS = [
  {
    q: '¿Quién instala el punto de reciclaje?',
    a: 'Lo coordinamos con vos: depósito, máquina o tótem, y te generamos el QR de tu comercio para que tus clientes empiecen a aportar.',
  },
  {
    q: '¿De quién son los datos?',
    a: 'Tuyos. Ves usuarios, aportes y kg en tu panel en vivo, y te llevás reportes en CSV/PDF para RSE o auditoría.',
  },
  {
    q: '¿Qué pasa con lo que reciclan mis clientes?',
    a: 'Cada aporte queda trazado y suma a causas reales, como el reciclado de tapitas para hospitales. Esa historia la podés comunicar con tu marca.',
  },
  {
    q: '¿Necesito mucho espacio o instalación compleja?',
    a: 'No. Arrancás con un punto que entra en tu local; lo dimensionamos juntos según tu flujo de gente.',
  },
  {
    q: '¿Cómo se cobra y puedo cambiar de plan?',
    a: 'Es una suscripción mensual. Empezás con un punto y escalás, cambiás o pausás tu plan cuando quieras desde el panel.',
  },
  {
    q: '¿Cuánto tardo en arrancar?',
    a: 'En minutos creás tu cuenta y tenés tu QR y tu panel. La instalación del punto la coordinamos a continuación.',
  },
]

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function CommerceLanding() {
  const { data: sponsors } = useApi(() => api.getSponsors(), [])

  // Scroll suave para las pestañas ancla (solo mientras estás en la landing).
  useEffect(() => {
    const el = document.documentElement
    el.classList.add('scroll-smooth')
    return () => el.classList.remove('scroll-smooth')
  }, [])

  return (
    <div id="top" className="min-h-dvh bg-background">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-eco-600 to-eco-800 text-white">
        <div className="bg-eco-grid absolute inset-0 opacity-20" />
        <Container size="wide" className="relative">
          <div className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-12 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                <Store size={14} /> Para comercios y marcas
              </div>
              <h1 className="mt-4 font-extrabold leading-[1.05] [font-size:clamp(2.1rem,5vw,3.5rem)]">
                Tus clientes reciclan, ganan beneficios y vuelven a tu local.
              </h1>
              <p className="mt-4 max-w-xl text-eco-50/90 [font-size:clamp(1rem,1.4vw,1.2rem)]">
                ReciclaXP es el programa de reciclaje con recompensas para tu comercio: ponés tu
                punto con QR, tus clientes suman XP y los canjean con vos. Ganás tráfico, datos en
                vivo y una Huella Verde verificable. La instalación la coordinamos nosotros.
              </p>

              <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:max-w-xl">
                <Link to="/comercio/onboarding" className="sm:flex-1">
                  <Button variant="xp" block size="lg">
                    Registrá tu comercio <ArrowRight size={18} />
                  </Button>
                </Link>
                <a href={waLink} target="_blank" rel="noreferrer" className="sm:flex-1">
                  <Button variant="secondary" block size="lg">
                    <MessageCircle size={18} /> Hablar con un asesor
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur sm:max-w-md">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Rocket size={20} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-eco-50/80">
                    Por lanzarse · cupos fundadores
                  </p>
                  <p className="text-sm font-extrabold leading-tight">
                    Sé uno de los primeros 100 puntos en Córdoba Capital
                  </p>
                </div>
              </div>
            </div>

            {/* Mockup del panel (vista de producto, sin datos inventados) */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="px-1 text-sm font-bold text-eco-50/90">Tu panel, en vivo</p>
                <div className="mt-3 rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                      <Leaf size={16} /> Huella Verde
                    </span>
                    <span className="text-xs font-semibold text-eco-50/80">tu reputación verde</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[72%] rounded-full bg-xp-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { icon: TrendingUp, label: 'Aportes' },
                    { icon: Users, label: 'Usuarios' },
                    { icon: Gift, label: 'Beneficios' },
                    { icon: BarChart3, label: 'Reportes' },
                  ].map((t) => (
                    <div key={t.label} className="rounded-2xl bg-white/10 p-4">
                      <t.icon size={20} />
                      <p className="mt-2 text-sm font-bold leading-tight">{t.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl bg-white/10 p-4">
                  <p className="mb-2 text-xs font-semibold text-eco-50/80">Aportes por mes</p>
                  <div className="flex h-16 items-end gap-2">
                    {[40, 55, 50, 70, 85].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-eco-200/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Barra de confianza (honesta) */}
      <Container size="wide" as="section" className="py-7">
        <Reveal className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm font-semibold text-muted-foreground">
            Pensado para comercios, estaciones, marcas, clubes y municipios.
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-eco-700 dark:text-eco-300">
            <HeartHandshake size={16} /> Programa con impacto trazable (tapitas → hospitales)
          </p>
        </Reveal>
      </Container>

      {/* Problema */}
      <Container size="wide" as="section" className="py-10 lg:py-16">
        <Reveal>
          <h2 className="text-center font-extrabold [font-size:clamp(1.5rem,3vw,2.25rem)]">
            Reciclar debería sumarte clientes, no trabajo.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            Hoy fidelizar y mostrar impacto van por carriles separados. Por eso cuesta tanto.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border bg-card p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger">
                  <p.icon size={20} />
                </span>
                <p className="mt-3 font-bold leading-tight">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Solución + Features */}
      <section id="producto" className="scroll-mt-24 bg-muted/40 py-12 lg:py-20">
        <Container size="wide">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
              La solución
            </p>
            <h2 className="mt-2 font-extrabold [font-size:clamp(1.6rem,3vw,2.5rem)] lg:max-w-3xl">
              Un solo flujo que junta tráfico y RSE verificable.
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Cada persona que recicla en tu punto es un cliente que vuelve por su beneficio. Y cada
              aporte queda registrado como impacto real que podés comunicar, con datos.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.05}>
                <div className="h-full rounded-2xl border border-border bg-card p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300">
                    <f.icon size={20} />
                  </span>
                  <p className="mt-3 font-bold leading-tight">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-24 py-12 lg:py-20">
        <Container size="wide">
          <Reveal>
            <h2 className="font-extrabold [font-size:clamp(1.6rem,3vw,2.5rem)]">Cómo funciona</h2>
            <p className="mt-2 text-muted-foreground">En tres pasos, sin complicaciones.</p>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="flex h-full items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-eco-600 text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div className="flex-1 rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2">
                      <s.icon size={18} className="text-eco-600" />
                      <p className="font-bold leading-tight">{s.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Impacto */}
      <section id="impacto" className="scroll-mt-24 py-12 lg:py-20">
        <Container size="wide">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-eco-200 bg-eco-50 dark:border-eco-700/40 dark:bg-eco-900/20 lg:grid lg:grid-cols-2">
              <div className="p-6 lg:p-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eco-600/10 px-3 py-1 text-xs font-bold text-eco-700 dark:text-eco-300">
                  <HeartHandshake size={14} /> Impacto real
                </span>
                <h2 className="mt-3 font-extrabold [font-size:clamp(1.5rem,3vw,2.25rem)]">
                  Tu RSE deja de ser un PDF lindo.
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Lo que reciclan tus clientes queda trazado y suma a causas concretas, como el
                  reciclado de tapitas para hospitales. Comunicás impacto que se puede verificar —
                  no promesas — y lo respaldás con tus reportes y tu Huella Verde.
                </p>
                <Link to="/comercio/onboarding" className="mt-5 inline-block">
                  <Button size="lg">
                    Registrá tu comercio <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
              <div className="relative hidden bg-eco-600 bg-eco-grid p-10 lg:block">
                <div className="grid h-full place-items-center">
                  <div className="text-center text-white">
                    <Recycle size={64} strokeWidth={1.6} className="mx-auto opacity-90" />
                    <p className="mt-4 text-lg font-extrabold">Aporte → XP → beneficio → impacto</p>
                    <p className="mt-1 text-sm text-eco-50/80">Todo trazado, de punta a punta.</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Soluciones por rubro */}
      <Container size="wide" as="section" className="py-12 lg:py-20">
        <Reveal>
          <h2 className="font-extrabold [font-size:clamp(1.6rem,3vw,2.5rem)]">Para tu rubro</h2>
          <p className="mt-2 text-muted-foreground">Un mismo programa, adaptado a cómo trabajás.</p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => (
            <Reveal key={v.title} delay={(i % 3) * 0.05}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300">
                  <v.icon size={20} />
                </span>
                <div>
                  <p className="font-bold leading-tight">{v.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Marcas (aspiracional, honesto) */}
        <Reveal className="mt-10">
          <p className="text-sm font-semibold text-muted-foreground">Marcas que queremos sumar</p>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </Reveal>
      </Container>

      {/* Planes */}
      <section id="planes" className="scroll-mt-24 bg-muted/40 py-12 lg:py-20">
        <Container size="wide">
          <Reveal>
            <h2 className="font-extrabold [font-size:clamp(1.6rem,3vw,2.5rem)]">Planes</h2>
            <p className="mt-2 text-muted-foreground">Empezás con un punto y escalás cuando quieras.</p>
          </Reveal>
          <div className="mt-8 grid items-start gap-4 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06}>
                <div
                  className={
                    t.featured
                      ? 'relative rounded-3xl border border-eco-500 bg-card p-6 shadow-lg ring-1 ring-eco-500 md:-translate-y-2'
                      : 'rounded-3xl border border-border bg-card p-6'
                  }
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-eco-600 px-3 py-1 text-xs font-bold text-white">
                      Más elegido
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-extrabold">{t.name}</span>
                    <span className="text-sm font-bold text-muted-foreground">{t.fee}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {t.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="mt-0.5 shrink-0 text-eco-600" /> {inc}
                      </li>
                    ))}
                  </ul>
                  <Link to="/comercio/onboarding" className="mt-6 block">
                    <Button block variant={t.featured ? 'primary' : 'secondary'}>
                      Registrarme
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Precios + IVA. Coordinamos la instalación de tu punto.{' '}
            <a href={waLink} target="_blank" rel="noreferrer" className="font-semibold text-eco-700 dark:text-eco-300">
              ¿Dudas con el plan? Escribinos
            </a>
            .
          </p>
        </Container>
      </section>

      {/* Por qué ahora (fundadores) */}
      <Container size="wide" as="section" className="py-12 lg:py-20">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 text-center lg:p-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-xp-100 px-3 py-1 text-xs font-bold text-xp-700 dark:bg-xp-700/20 dark:text-xp-300">
              <Rocket size={14} /> Por qué ahora
            </span>
            <h2 className="mx-auto mt-3 max-w-3xl font-extrabold [font-size:clamp(1.5rem,3vw,2.25rem)]">
              Estamos abriendo los primeros 100 puntos en Córdoba Capital.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Los comercios fundadores entran primero, ayudan a moldear el programa y arrancan antes
              que su competencia. Sin métricas infladas: lo que ves es lo que estamos construyendo.
            </p>
            <Link to="/comercio/onboarding" className="mx-auto mt-6 inline-block">
              <Button size="lg">
                Sumarme como fundador <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </Reveal>
      </Container>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-12 lg:py-20">
        <Container size="wide">
          <Reveal>
            <h2 className="font-extrabold [font-size:clamp(1.6rem,3vw,2.5rem)]">Preguntas frecuentes</h2>
            <p className="mt-2 text-muted-foreground">Lo que todo comercio nos pregunta antes de empezar.</p>
          </Reveal>
          <div className="mt-8 grid gap-2 lg:grid-cols-2 lg:items-start lg:gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA final */}
      <Container size="wide" as="section" className="pb-14">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-eco-600 to-eco-800 p-8 text-center text-white lg:p-12">
            <Leaf size={28} className="mx-auto" />
            <h2 className="mt-3 font-extrabold [font-size:clamp(1.6rem,3vw,2.5rem)]">
              Sumá tu comercio hoy
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-eco-50/90">
              En minutos tenés tu QR, tus beneficios y tu panel de impacto. La instalación la
              coordinamos nosotros.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
              <Link to="/comercio/onboarding" className="sm:flex-1">
                <Button variant="xp" block size="lg">
                  Registrá tu comercio <ArrowRight size={18} />
                </Button>
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer" className="sm:flex-1">
                <Button variant="secondary" block size="lg">
                  <MessageCircle size={18} /> Hablar con un asesor
                </Button>
              </a>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Footer */}
      <footer className="border-t border-border">
        <Container size="wide" className="py-8 text-center md:flex md:items-center md:justify-between md:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 text-eco-700 dark:text-eco-300 md:justify-start">
              <Recycle size={18} strokeWidth={2.4} />
              <span className="font-extrabold">ReciclaXP</span>
            </div>
            <p className="mt-1 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground md:justify-start">
              <MapPin size={12} /> Córdoba, Argentina
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-semibold md:mt-0">
            <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-eco-700 dark:text-eco-300">
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1 text-eco-700 dark:text-eco-300">
              <Mail size={14} /> {CONTACT.email}
            </a>
            <Link to="/" className="text-eco-700 dark:text-eco-300">
              ¿Sos usuario? Entrá a la app →
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  )
}
