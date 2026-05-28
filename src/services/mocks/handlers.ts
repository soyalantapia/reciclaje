import { http, HttpResponse, delay } from 'msw'
import { XP_PER_UNIT, type Coupon, type ScanResult, type ScanPayload } from '@/types'
import { shortCode } from '@/lib/utils'
import {
  benefits,
  contributions,
  currentUser,
  points,
  projects,
  prizes,
  rankingGlobal,
  rankingRiver,
  rankingYpf,
  sponsorMetrics,
  sponsors,
  traceByProject,
} from './data'

// El SW de MSW vive en el scope del BASE_URL del bundle. Los handlers usan
// el mismo prefijo para que matcheen tanto en dev (/) como en prod
// (/reciclaje/).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const api = (path: string) => `${BASE}/api${path}`

export const handlers = [
  http.get(api('/me'), async () => {
    await delay(150)
    return HttpResponse.json(currentUser)
  }),

  http.get(api('/sponsors'), async () => {
    await delay(150)
    return HttpResponse.json(sponsors)
  }),

  http.get(api('/sponsors/:id/metrics'), async ({ params }) => {
    await delay(250)
    const metrics = sponsorMetrics[String(params.id)]
    if (!metrics) {
      return HttpResponse.json({ message: 'Sponsor sin métricas' }, { status: 404 })
    }
    return HttpResponse.json(metrics)
  }),

  http.get(api('/points'), async () => {
    await delay(200)
    return HttpResponse.json(points)
  }),

  http.get(api('/projects'), async () => {
    await delay(200)
    return HttpResponse.json(projects)
  }),

  http.get(api('/projects/:id'), async ({ params }) => {
    await delay(200)
    const project = projects.find((p) => p.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  http.get(api('/projects/:id/trace'), async ({ params }) => {
    await delay(200)
    const trace = traceByProject[String(params.id)] ?? []
    return HttpResponse.json(trace)
  }),

  http.get(api('/benefits'), async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const city = url.searchParams.get('city')
    const sponsor = url.searchParams.get('sponsor')
    let list = benefits
    if (category) list = list.filter((b) => b.category === category)
    if (city) list = list.filter((b) => b.city === city)
    if (sponsor) list = list.filter((b) => b.sponsorId === sponsor)
    return HttpResponse.json(list)
  }),

  http.post(api('/benefits/:id/redeem'), async ({ params }) => {
    await delay(400)
    const benefit = benefits.find((b) => b.id === params.id)
    if (!benefit) {
      return HttpResponse.json({ message: 'Beneficio no encontrado' }, { status: 404 })
    }
    const coupon: Coupon = {
      id: `cp_${shortCode(8)}`,
      benefitId: benefit.id,
      benefitTitle: benefit.title,
      sponsorName: benefit.sponsorName,
      code: shortCode(6),
      qrPayload: `reciclaxp:coupon:${benefit.id}:${Date.now()}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    }
    return HttpResponse.json(coupon)
  }),

  http.get(api('/contributions'), async () => {
    await delay(200)
    return HttpResponse.json(contributions)
  }),

  http.post(api('/contributions'), async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as ScanPayload
    const point = points.find((p) => p.id === body.pointId)
    if (!point) {
      return HttpResponse.json({ message: 'Punto no encontrado' }, { status: 404 })
    }
    const units = Math.max(1, Math.round(body.units))
    const xpEarned = units * (XP_PER_UNIT[body.material] ?? 1)
    const sponsor = sponsors.find((s) => s.id === point.sponsorId)
    const project = projects.find((p) => p.sponsorId === point.sponsorId)
    const result: ScanResult = {
      xpEarned,
      project,
      contribution: {
        id: `c_${shortCode(6)}`,
        userId: currentUser.id,
        pointId: point.id,
        pointName: point.name,
        sponsorId: point.sponsorId,
        sponsorName: sponsor?.name ?? '',
        material: body.material,
        units,
        xpEarned,
        projectId: project?.id,
        status: 'validado',
        createdAt: new Date().toISOString(),
        lotId: `LT-2026-${100 + Math.floor(Math.random() * 80)}`,
      },
    }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.get(api('/ranking'), async ({ request }) => {
    await delay(200)
    const scope = new URL(request.url).searchParams.get('scope') ?? 'global'
    const entries =
      scope === 'river' ? rankingRiver : scope === 'ypf' ? rankingYpf : rankingGlobal
    const prize = prizes[scope] ?? prizes.global
    return HttpResponse.json({ scope, entries, prize })
  }),
]
