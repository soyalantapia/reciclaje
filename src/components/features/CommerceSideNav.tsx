import { NavLink, useNavigate } from 'react-router-dom'
import {
  Armchair,
  CreditCard,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Palette,
  QrCode,
} from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { cn } from '@/lib/utils'
import { ESCENARIO, muestraPrecios, type Escenario } from '@/lib/escenario'
import { esInstitucion, vocabularioDelPanel } from '@/lib/vocabulario'
import { EscudoDelPanel } from './EscudoDelPanel'

export const COMMERCE_NAV = [
  { to: '/comercio', label: 'Resumen', end: true, icon: LayoutDashboard },
  { to: '/comercio/productos', label: 'Productos', icon: Armchair },
  { to: '/comercio/beneficios', label: 'Beneficios', icon: Gift },
  { to: '/comercio/campanias', label: 'Campañas', icon: Megaphone },
  { to: '/comercio/puntos', label: 'Puntos / QR', icon: QrCode },
  { to: '/comercio/reportes', label: 'Reportes', icon: FileText },
  { to: '/comercio/marca', label: 'Marca', icon: Palette },
  { to: '/comercio/plan', label: 'Plan', icon: CreditCard },
]

/** Lo que es sólo de un club o un estadio: lo que construye la hinchada y la marca del club. */
const SOLO_INSTITUCIONES = new Set(['/comercio/productos', '/comercio/marca'])

/**
 * El menú del panel: el del escritorio y el del celular salen de acá, para que no difieran.
 * En la demo del club no está «Plan» (ver `muestraPrecios`), y «Productos» y «Marca» son sólo de
 * las instituciones: un comercio no tiene hinchada ni escudo de club.
 */
export function navDelPanel(escenario: Escenario = ESCENARIO, categoria?: string) {
  return COMMERCE_NAV.filter(
    (i) =>
      (i.to !== '/comercio/plan' || muestraPrecios(escenario)) &&
      (!SOLO_INSTITUCIONES.has(i.to) || esInstitucion(categoria)),
  )
}

/** Cómo se llama el panel: un club o un estadio no son un comercio. */
export function etiquetaDelPanel(category?: string): string {
  return vocabularioDelPanel(category).panel
}

/**
 * Navegación lateral del hub de comercio para desktop (lg+).
 * En mobile/tablet se usa la pill-nav del header en CommerceLayout.
 */
export function CommerceSideNav({ className }: { className?: string }) {
  const navigate = useNavigate()
  const commerce = useSessionStore((s) => s.commerce)
  const logoutCommerce = useSessionStore((s) => s.logoutCommerce)

  if (!commerce) return null

  return (
    <aside
      data-no-imprimir
      className={cn(
        'pt-safe sticky top-0 h-dvh w-64 shrink-0 flex-col border-r border-border bg-card/40 px-3 pb-4',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-2 py-5">
        <EscudoDelPanel className="h-10 w-10 text-base" />
        <div className="min-w-0">
          <p className="truncate font-extrabold leading-tight">{commerce.name}</p>
          <p className="text-[11px] text-muted-foreground">{etiquetaDelPanel(commerce.category)} · ReciclaXP</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navDelPanel(ESCENARIO, commerce.category).map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-eco-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={20} strokeWidth={2.2} /> {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => {
          logoutCommerce()
          navigate('/comercio/login', { replace: true })
        }}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut size={20} /> Salir
      </button>
    </aside>
  )
}
