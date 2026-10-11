// Lo que sostiene «lo ven el panel y la app del hincha aunque estén en dos pestañas»: el listener de
// `storage` del store. El payload necesita la `version` vigente; si no, persist lo descarta.
import { beforeEach, describe, expect, it } from 'vitest'
import type { ImpactProject, RecyclePoint } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { crearProducto } from '@/lib/productosDelClub'
import { useCommerceProductsStore } from './commerceProducts'
import { VERSION_DE_LOS_DATOS } from './versionDeDatos'

const clave = claveDeAlmacenamiento('commerce-products')
const sede: RecyclePoint = {
  id: 'p_club_sede', name: 'Punto R · Sede social', sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba',
  x: 0, y: 0, acceptedMaterials: ['tapitas'], openNow: true,
}
const producto = (id: string): ImpactProject =>
  crearProducto({
    id, forma: 'butacas', nombre: 'Butacas', metaKg: 500, punto: sede, club: { id: 's_club', nombre: 'Talleres' },
    creadoEn: '2026-10-10T12:00:00.000Z',
  })

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
  localStorage.clear()
})

const esperar = () => new Promise((r) => setTimeout(r, 20))
const guardar = (creados: ImpactProject[], version = VERSION_DE_LOS_DATOS) =>
  localStorage.setItem(clave, JSON.stringify({ state: { creados }, version }))

describe('el listener de `storage` de los productos del club', () => {
  it('toma lo que otra pestaña escribió', async () => {
    guardar([producto('pr_otra')])
    window.dispatchEvent(new StorageEvent('storage', { key: clave }))
    await esperar()
    expect(useCommerceProductsStore.getState().creados.map((p) => p.id)).toEqual(['pr_otra'])
  })

  it('ignora lo que se escribió en otras claves', async () => {
    guardar([producto('pr_otra')])
    window.dispatchEvent(new StorageEvent('storage', { key: 'otra-clave' }))
    await esperar()
    expect(useCommerceProductsStore.getState().creados).toEqual([])
  })

  it('si otra pestaña borra la clave, no pisa lo que hay en memoria', async () => {
    useCommerceProductsStore.getState().agregar(producto('pr_mio'))
    localStorage.removeItem(clave)
    window.dispatchEvent(new StorageEvent('storage', { key: clave }))
    await esperar()
    expect(useCommerceProductsStore.getState().creados.map((p) => p.id)).toEqual(['pr_mio'])
  })

  it('un valor guardado roto no tira la app', async () => {
    localStorage.setItem(clave, '{no es json')
    window.dispatchEvent(new StorageEvent('storage', { key: clave }))
    await esperar()
    expect(useCommerceProductsStore.getState().creados).toEqual([])
  })

  it('lo guardado con otra versión se descarta', async () => {
    guardar([producto('pr_viejo')], 1)
    window.dispatchEvent(new StorageEvent('storage', { key: clave }))
    await esperar()
    expect(useCommerceProductsStore.getState().creados).toEqual([])
  })
})
