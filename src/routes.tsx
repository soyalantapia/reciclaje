import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/features/AppLayout'
import { RequireAuth } from '@/components/features/RequireAuth'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * lazy() con retry: tras un deploy, el index cacheado puede apuntar a chunks
 * viejos que ya no existen → "Failed to fetch dynamically imported module".
 * El primer fallo gatilla un reload (una vez por sesión) para tomar el bundle
 * nuevo; si vuelve a fallar, propaga al ErrorBoundary.
 */
function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const KEY = 'reciclaxp-chunk-reload'
    try {
      return await factory()
    } catch (err) {
      const reloaded =
        typeof window !== 'undefined' && window.sessionStorage.getItem(KEY) === '1'
      if (!reloaded && typeof window !== 'undefined') {
        window.sessionStorage.setItem(KEY, '1')
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}

if (typeof window !== 'undefined') {
  window.sessionStorage.removeItem('reciclaxp-chunk-reload')
}

const Login = lazyWithRetry(() => import('@/pages/Login'))
const Home = lazyWithRetry(() => import('@/pages/Home'))
const Scan = lazyWithRetry(() => import('@/pages/Scan'))
const MapPoints = lazyWithRetry(() => import('@/pages/MapPoints'))
const Marketplace = lazyWithRetry(() => import('@/pages/Marketplace'))
const Ranking = lazyWithRetry(() => import('@/pages/Ranking'))
const ImpactProjectPage = lazyWithRetry(() => import('@/pages/ImpactProjectPage'))
const Traceability = lazyWithRetry(() => import('@/pages/Traceability'))
const Causes = lazyWithRetry(() => import('@/pages/Causes'))
const CauseDetail = lazyWithRetry(() => import('@/pages/CauseDetail'))
const Marcas = lazyWithRetry(() => import('@/pages/Marcas'))
const CommerceQr = lazyWithRetry(() => import('@/pages/CommerceQr'))
const Profile = lazyWithRetry(() => import('@/pages/Profile'))
const B2BDashboard = lazyWithRetry(() => import('@/pages/B2BDashboard'))
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>
}

export const router = createBrowserRouter(
  [
    { path: '/login', element: withSuspense(<Login />) },
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        {
          path: '/',
          element: <AppLayout />,
          children: [
            { index: true, element: withSuspense(<Home />) },
            { path: 'escanear', element: withSuspense(<Scan />) },
            { path: 'mapa', element: withSuspense(<MapPoints />) },
            { path: 'beneficios', element: withSuspense(<Marketplace />) },
            { path: 'ranking', element: withSuspense(<Ranking />) },
            { path: 'perfil', element: withSuspense(<Profile />) },
            { path: 'proyecto/:id', element: withSuspense(<ImpactProjectPage />) },
            { path: 'trazabilidad/:projectId', element: withSuspense(<Traceability />) },
            { path: 'causas', element: withSuspense(<Causes />) },
            { path: 'causa/:id', element: withSuspense(<CauseDetail />) },
            { path: 'marcas', element: withSuspense(<Marcas />) },
            { path: 'qr-comercios', element: withSuspense(<CommerceQr />) },
          ],
        },
        { path: 'empresas', element: withSuspense(<B2BDashboard />) },
      ],
    },
    { path: '*', element: withSuspense(<NotFound />) },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
)
