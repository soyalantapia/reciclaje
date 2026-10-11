import { NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { cn } from '@/lib/utils'
import { ESCENARIO } from '@/lib/escenario'
import { CommerceSideNav, etiquetaDelPanel, navDelPanel } from './CommerceSideNav'
import { AvisoDemo } from './AvisoDemo'

export function CommerceLayout() {
  const navigate = useNavigate()
  const commerce = useSessionStore((s) => s.commerce)
  const logoutCommerce = useSessionStore((s) => s.logoutCommerce)
  // El informe lleva su propio aviso, arriba y al pie: sólo ahí el de la demo no se imprime.
  const enElInforme = useMatch('/comercio/informe')

  if (!commerce) return null

  function salir() {
    logoutCommerce()
    navigate('/comercio/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-background lg:flex">
      {/* Navegación lateral (desktop) */}
      <CommerceSideNav className="hidden lg:flex" />

      {/* Columna de contenido */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Header con pill-nav (mobile/tablet) */}
        <header
          data-no-imprimir
          className="pt-safe sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base font-extrabold text-white"
                style={{ backgroundColor: commerce.brandColor }}
              >
                {commerce.name[0]}
              </span>
              <div className="min-w-0">
                <p className="truncate font-extrabold leading-tight">{commerce.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {etiquetaDelPanel(commerce.category)} · ReciclaXP
                </p>
              </div>
            </div>
            <button
              onClick={salir}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <LogOut size={16} /> Salir
            </button>
          </div>

          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {navDelPanel(ESCENARIO, commerce.category).map(({ to, label, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-eco-600 text-white' : 'text-muted-foreground hover:bg-muted',
                  )
                }
              >
                <Icon size={15} /> {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-4 lg:px-8 lg:pt-8 print:max-w-none print:p-0">
          {/* Se imprime en todo el panel (un resumen impreso circula sin la pantalla), salvo en el informe */}
          <div data-no-imprimir={enElInforme ? true : undefined}>
            <AvisoDemo />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
