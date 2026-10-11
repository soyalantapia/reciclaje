import { getResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ImpactProject, ScanResult, TraceEvent } from '@/types'
import { crearProducto } from '@/lib/productosDelClub'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { datos } from './datos'
import { handlers } from './handlers'

/** Le pide al simulador lo mismo que la app, sin red: `getResponse` corre los handlers directo. */
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const respuesta = await getResponse(handlers, new Request(new URL(`${base}/api${ruta}`, location.origin), init))
  if (!respuesta) throw new Error(`El simulador no atendió ${ruta}`)
  return (await respuesta.json()) as T
}

const { points, projects } = datos
// En la demo general, el primer proyecto es el banco de Talleres, con sus dos Punto R.
const banco = projects[0]
const estadio = points.find((p) => p.sponsorId === banco.sponsorId && p.id.endsWith('_estadio'))!
const sede = points.find((p) => p.sponsorId === banco.sponsorId && p.id.endsWith('_sede'))!
const butacas = crearProducto({
  id: 'pr_nuevo_prueba', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
  club: { id: banco.sponsorId, nombre: banco.sponsorName }, creadoEn: '2026-10-10T12:00:00.000Z',
})

const aportar = (pointId: string) =>
  pedir<ScanResult>('/contributions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointId, material: 'tapitas', units: 50 }),
  })

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
})

describe('simulador: los productos que publica el club', () => {
  it('sin productos del panel, sirve los del seed como siempre', async () => {
    const lista = await pedir<ImpactProject[]>('/projects')
    expect(lista.map((p) => p.id)).toEqual(projects.map((p) => p.id))
  })

  it('los publicados van después de los del seed y se pueden pedir por id', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    const lista = await pedir<ImpactProject[]>('/projects')
    expect(lista[0].id).toBe(banco.id)
    expect(lista.at(-1)?.id).toBe('pr_nuevo_prueba')
    const uno = await pedir<ImpactProject>('/projects/pr_nuevo_prueba')
    expect(uno.title).toBe('Butacas para la platea')
  })

  it('el recorrido de un producto publicado tiene sus siete etapas sin hacer, con su Punto R', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    const traza = await pedir<TraceEvent[]>('/projects/pr_nuevo_prueba/trace')
    expect(traza).toHaveLength(7)
    expect(traza.every((e) => !e.done)).toBe(true)
    expect(traza[0].detail).toBe(`Las tapitas que dejás en el ${sede.name}.`)
  })

  it('un aporte en el Punto R del producto va a ese producto; en el estadio, al banco', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    const enLaSede = await aportar(sede.id)
    expect(enLaSede.contribution.projectId).toBe('pr_nuevo_prueba')
    expect(enLaSede.project?.id).toBe('pr_nuevo_prueba')
    const enElEstadio = await aportar(estadio.id)
    expect(enElEstadio.contribution.projectId).toBe(banco.id)
  })

  it('después de eliminarlo, la sede vuelve a juntar para el banco', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    useCommerceProductsStore.getState().quitar('pr_nuevo_prueba')
    const enLaSede = await aportar(sede.id)
    expect(enLaSede.contribution.projectId).toBe(banco.id)
  })
})
