import type {
  Benefit,
  BenefitCategory,
  Cause,
  Contribution,
  Coupon,
  ImpactProject,
  PurchasePayload,
  PurchaseResult,
  RankingResult,
  RecyclePoint,
  ScanPayload,
  ScanResult,
  Sponsor,
  SponsorMetrics,
  TraceEvent,
  User,
} from '@/types'
import { ERRORS } from '@/lib/copy'

// Mismo prefijo que el scope del SW de MSW. En GH Pages → /reciclaje/api,
// en dev → /api. Si las requests salieran fuera de este scope, caerían al
// server real (404 / SPA fallback).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const BASE_URL = `${BASE}/api`

export class ApiError extends Error {
  public readonly code:
    | 'network'
    | 'not_found'
    | 'server'
    | 'unauthorized'
    | 'forbidden'
    | 'unknown'
  public readonly status?: number

  constructor(code: ApiError['code'], message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

function classifyHttp(status: number): ApiError['code'] {
  if (status === 404) return 'not_found'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status >= 500) return 'server'
  return 'unknown'
}

function isHtmlResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || ''
  return ct.toLowerCase().includes('text/html')
}

const MSW_RECOVER_KEY = 'reciclaxp-msw-recover'

/**
 * Recibir HTML donde esperábamos JSON = el SW de MSW dejó de controlar la
 * página (pasa a veces tras navegación SPA). El único fix observado es un
 * reload completo, que vuelve a arrancar MSW. Lo hacemos UNA vez por sesión
 * (flag en sessionStorage); si tras el reload sigue fallando, no recargamos
 * de nuevo y dejamos que la UI muestre el error con "Reintentar".
 */
function tryRecoverFromHtml(): boolean {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_USE_MSW === 'false') return false
  if (sessionStorage.getItem(MSW_RECOVER_KEY) === '1') return false
  sessionStorage.setItem(MSW_RECOVER_KEY, '1')
  window.location.reload()
  return true
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError('network', ERRORS.network)
  }

  // Si llega HTML, MSW no está controlando la página (caímos al SPA fallback).
  if (isHtmlResponse(res)) {
    // Intento de autorecuperación: reload único para re-arrancar MSW.
    if (tryRecoverFromHtml()) {
      // La página se está recargando; no resolvemos para no mostrar error.
      return new Promise<T>(() => {})
    }
    throw new ApiError(
      'server',
      'No pudimos cargar los datos. Probá reintentar.',
      res.status,
    )
  }

  // Llegó JSON: MSW (o el backend) responde bien. Limpiamos el flag de
  // recuperación para permitir un nuevo intento ante un fallo futuro.
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(MSW_RECOVER_KEY)
  }

  if (!res.ok) {
    const code = classifyHttp(res.status)
    const fallback =
      code === 'not_found'
        ? ERRORS.notFound
        : code === 'server'
          ? ERRORS.serverError
          : code === 'unauthorized'
            ? ERRORS.unauthorized
            : code === 'forbidden'
              ? ERRORS.forbidden
              : ERRORS.unknown
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(code, body?.message || fallback, res.status)
  }
  return res.json() as Promise<T>
}

export const api = {
  getMe: () => request<User>('/me'),
  getSponsors: () => request<Sponsor[]>('/sponsors'),
  getSponsorMetrics: (id: string) => request<SponsorMetrics>(`/sponsors/${id}/metrics`),
  getPoints: () => request<RecyclePoint[]>('/points'),
  getProjects: () => request<ImpactProject[]>('/projects'),
  getProject: (id: string) => request<ImpactProject>(`/projects/${id}`),
  getProjectTrace: (id: string) => request<TraceEvent[]>(`/projects/${id}/trace`),

  getBenefits: (filters?: { category?: BenefitCategory; city?: string; sponsor?: string }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.set('category', filters.category)
    if (filters?.city) params.set('city', filters.city)
    if (filters?.sponsor) params.set('sponsor', filters.sponsor)
    const qs = params.toString()
    return request<Benefit[]>(`/benefits${qs ? `?${qs}` : ''}`)
  },
  redeemBenefit: (id: string) =>
    request<Coupon>(`/benefits/${id}/redeem`, { method: 'POST' }),

  getContributions: () => request<Contribution[]>('/contributions'),
  scan: (payload: ScanPayload) =>
    request<ScanResult>('/contributions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRanking: (scope: 'global' | 'river' | 'ypf' = 'global') =>
    request<RankingResult>(`/ranking?scope=${scope}`),

  getCauses: () => request<Cause[]>('/causes'),
  getCause: (id: string) => request<Cause>(`/causes/${id}`),

  purchase: (payload: PurchasePayload) =>
    request<PurchaseResult>('/purchases', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
