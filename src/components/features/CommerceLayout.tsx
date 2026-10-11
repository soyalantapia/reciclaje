import { useLayoutEffect } from 'react'
import { NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'
import { cn } from '@/lib/utils'
import { ESCENARIO } from '@/lib/escenario'
import { esColorPropio, estiloDeMarca } from '@/lib/marca'
import { esInstitucion } from '@/lib/vocabulario'
import { CommerceSideNav, etiquetaDelPanel, navDelPanel } from './CommerceSideNav'
import { AvisoDemo } from './AvisoDemo'
import { EscudoDelPanel } from './EscudoDelPanel'

export function CommerceLayout() {
  const navigate = useNavigate()
  const commerce = useSessionStore((s) => s.commerce)
  const logoutCommerce = useSessionStore((s) => s.logoutCommerce)
  // El informe lleva su propio aviso, arriba y al pie: sólo ahí el de la demo no se imprime. El
  // informe de una institución es su pantalla de Reportes.
  const enReportes = useMatch('/comercio/reportes')
  const marca = useMarcaDelPanel()

  // Los Modal se montan en document.body, fuera de este contenedor: mientras el panel está abierto,
  // la paleta de la marca va también en <html>, y se saca al salir. Es un efecto de layout para que
  // se saque en el mismo cuadro en que se sale: el login no pinta ni un cuadro con los colores del club.
  // Sin un color propio (el verde de ReciclaXP) no hay nada que poner: la paleta de siempre ya es esa.
  const colorDeLaMarca = marca && esColorPropio(marca.color) ? marca.color : undefined
  useLayoutEffect(() => {
    if (!colorDeLaMarca) return
    const raiz = document.documentElement
    const variables = Object.entries(estiloDeMarca(colorDeLaMarca))
    for (const [nombre, valor] of variables) raiz.style.setProperty(nombre, valor)
    return () => {
      for (const [nombre] of variables) raiz.style.removeProperty(nombre)
    }
  }, [colorDeLaMarca])

  if (!commerce) return null

  const enElInforme = Boolean(enReportes) && esInstitucion(commerce.category)

  function salir() {
    logoutCommerce()
    navigate('/comercio/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-background lg:flex" style={marca?.estilo}>
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
              <EscudoDelPanel className="h-9 w-9 text-base" />
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
