import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/features/AppLayout'
import { RequireAuth } from '@/components/features/RequireAuth'
import { RequireCommerce } from '@/components/features/RequireCommerce'
import { CommerceLayout } from '@/components/features/CommerceLayout'
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
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'))

// Comercio (B2B)
const CommerceLogin = lazyWithRetry(() => import('@/pages/commerce/CommerceLogin'))
const CommerceRegister = lazyWithRetry(() => import('@/pages/commerce/CommerceRegister'))
const CommerceResumen = lazyWithRetry(() => import('@/pages/commerce/CommerceResumen'))
const CommerceBenefits = lazyWithRetry(() => import('@/pages/commerce/CommerceBenefits'))
const CommerceCampaigns = lazyWithRetry(() => import('@/pages/commerce/CommerceCampaigns'))
const CommercePoints = lazyWithRetry(() => import('@/pages/commerce/CommercePoints'))
const CommerceReports = lazyWithRetry(() => import('@/pages/commerce/CommerceReports'))
const CommercePlan = lazyWithRetry(() => import('@/pages/commerce/CommercePlan'))

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
      ],
    },
    { path: '/comercio/login', element: withSuspense(<CommerceLogin />) },
    { path: '/comercio/registro', element: withSuspense(<CommerceRegister />) },
    {
      path: '/comercio',
      element: <RequireCommerce />,
      children: [
        {
          path: '/comercio',
          element: <CommerceLayout />,
          children: [
            { index: true, element: withSuspense(<CommerceResumen />) },
            { path: 'beneficios', element: withSuspense(<CommerceBenefits />) },
            { path: 'campanias', element: withSuspense(<CommerceCampaigns />) },
            { path: 'puntos', element: withSuspense(<CommercePoints />) },
            { path: 'reportes', element: withSuspense(<CommerceReports />) },
            { path: 'plan', element: withSuspense(<CommercePlan />) },
          ],
        },
      ],
    },
    { path: '/empresas', element: <Navigate to="/comercio" replace /> },
    { path: '*', element: withSuspense(<NotFound />) },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
)
