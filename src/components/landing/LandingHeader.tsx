import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Recycle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const TABS = [
  { id: 'producto', label: 'Producto' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'planes', label: 'Planes' },
  { id: 'faq', label: 'FAQ' },
]

/**
 * Header sticky con pestañas ancla + scroll-spy (IntersectionObserver) y menú mobile.
 */
export function LandingHeader() {
  const [active, setActive] = useState('producto')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (!sections.length) return
    const visible = new Set<string>()
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        })
        // Marca la primera sección visible en orden; en el hero no marca ninguna.
        const current = TABS.find((t) => visible.has(t.id))
        setActive(current ? current.id : '')
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2" aria-label="ReciclaXP — inicio">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-eco-600 text-white">
            <Recycle size={20} strokeWidth={2.4} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">ReciclaXP</span>
        </a>

        {/* Pestañas (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Secciones">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              aria-current={active === t.id ? 'true' : undefined}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                active === t.id
                  ? 'bg-eco-100 text-eco-800 dark:bg-eco-900/40 dark:text-eco-200'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </a>
          ))}
        </nav>

        {/* CTAs (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/comercio/login"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Ingresar
          </Link>
          <Link to="/comercio/onboarding">
            <Button size="sm">Registrá tu comercio</Button>
          </Link>
        </div>

        {/* Toggle mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl text-foreground hover:bg-muted lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú mobile */}
      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Secciones">
            {TABS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm font-semibold',
                  active === t.id
                    ? 'bg-eco-100 text-eco-800 dark:bg-eco-900/40 dark:text-eco-200'
                    : 'text-muted-foreground',
                )}
              >
                {t.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid gap-2">
            <Link to="/comercio/onboarding" onClick={() => setOpen(false)}>
              <Button block>Registrá tu comercio</Button>
            </Link>
            <Link to="/comercio/login" onClick={() => setOpen(false)}>
              <Button block variant="secondary">
                Ingresar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
