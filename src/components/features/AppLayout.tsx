import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Coins, Flame, Trophy } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { formatNumber } from '@/lib/utils'
import { Logo } from './Logo'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { AvisoDemo } from './AvisoDemo'
import { ESCENARIO, claveDeAlmacenamiento } from '@/lib/escenario'
import { escudoDeLaAppDelHincha } from '@/lib/logos'
import { usePaletaDeLaAppDelHincha } from '@/hooks/usePaletaDelClub'

export function AppLayout() {
  const navigate = useNavigate()
  const spendableXp = useWalletStore((s) => s.spendableXp)
  const streakDays = useWalletStore((s) => s.streakDays)
  // En la demo de Talleres, la app toma el azul del club.
  usePaletaDeLaAppDelHincha()

  // Si llegamos por un QR (deep-link ?p=), el punto quedó pendiente: vamos al escáner.
  useEffect(() => {
    if (sessionStorage.getItem(claveDeAlmacenamiento('scan-point'))) navigate('/escanear')
  }, [navigate])

  // El mapa se precarga en un momento libre: al tocar «Mapa», ya está bajado.
  useEffect(() => {
    // Sin red la precarga falla en silencio: no hay nada que avisar, la pantalla se baja igual cuando se abre.
    const precargar = () => {
      void import('@/pages/MapPoints').catch(() => {})
      void import('@/components/features/MapaDeCordoba').catch(() => {})
    }
    // `typeof` y no `in`: con `'requestIdleCallback' in window` TypeScript deja `window` en `never` en el resto.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(precargar)
      return () => window.cancelIdleCallback(id)
    }
    // Safari no trae requestIdleCallback: un plazo corto hace lo mismo.
    const t = window.setTimeout(precargar, 1500)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="min-h-dvh bg-background md:flex">
      {/* Navegación lateral (tablet/desktop) */}
      <SideNav className="hidden md:flex" />

      {/* Columna de contenido */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Header mobile (en md+ los controles viven en la sidebar): una tarjeta de vidrio que flota, redondeada
            en las cuatro esquinas y despegada de los bordes. */}
        <header className="sticky top-0 z-30 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-[22px] border border-white/70 bg-card/80 py-2 pl-3 pr-2 shadow-[0_10px_30px_-14px_rgba(6,40,31,0.4)] ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-card/75 dark:ring-white/5">
            {/* Lo que entra en cada ancho: desde 400 px, todo; debajo, la racha queda en la llama y el número; y
                debajo de 375 px, el logo queda en su ícono. Así no se sale de la tarjeta ni con un XP de seis cifras. */}
            <button onClick={() => navigate('/')} aria-label="Ir al inicio">
              {/* Con el escudo del club al lado (demo de Talleres) el nombre se va antes: debajo de 440 px. */}
              <Logo textoClassName={escudoDeLaAppDelHincha(ESCENARIO) ? 'max-[439px]:hidden' : 'max-[374px]:hidden'} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-xp-100 px-2.5 py-1 text-xs font-bold text-xp-700 dark:bg-xp-700/20 dark:text-xp-300">
                {/* En un celular angosto queda el número con la llama: «días» sigue para los lectores de pantalla */}
                <Flame size={14} /> {streakDays}{' '}
                <span className="max-[399px]:sr-only">días</span>
              </span>
              <button
                onClick={() => navigate('/beneficios')}
                aria-label="Ver mis XP canjeables"
                className="inline-flex items-center gap-1.5 rounded-full bg-eco-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-sm transition active:scale-95"
              >
                <Coins size={15} /> {formatNumber(spendableXp)}
              </button>
              <button
                onClick={() => navigate('/ranking')}
                aria-label="Ver ranking"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Trophy size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-3 md:px-8 md:pb-12 md:pt-8">
          <AvisoDemo />
          <Outlet />
        </main>
      </div>

      {/* Tab bar (solo mobile) */}
      <BottomNav />
    </div>
  )
}
