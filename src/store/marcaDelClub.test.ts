import { beforeEach, describe, expect, it } from 'vitest'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { useMarcaDelClubStore } from './marcaDelClub'
import { VERSION_DE_LOS_DATOS } from './versionDeDatos'

const clave = claveDeAlmacenamiento('marca-del-club')
// Un escudo de mentira: no es el de ningún club.
const ESCUDO = 'data:image/png;base64,ESCUDO'

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
  localStorage.clear()
})

describe('la marca de cada institución', () => {
  it('se guarda y se borra por institución, sin tocar las otras', () => {
    const { guardar, quitar } = useMarcaDelClubStore.getState()
    guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    guardar('s_otro', { color: '#aa0000' })
    quitar('s_club')
    expect(useMarcaDelClubStore.getState().marcas).toEqual({ s_otro: { color: '#aa0000' } })
  })

  it('guardar la marca de una institución no pisa la de otra', () => {
    const { guardar } = useMarcaDelClubStore.getState()
    guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    guardar('s_otro', { color: '#aa0000' })
    expect(useMarcaDelClubStore.getState().marcas).toEqual({
      s_club: { escudo: ESCUDO, color: '#0b2d6b' },
      s_otro: { color: '#aa0000' },
    })
  })

  it('queda en el navegador, con su clave y la versión de los datos', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    expect(JSON.parse(localStorage.getItem(clave)!)).toMatchObject({
      state: { marcas: { s_club: { color: '#0b2d6b' } } },
      version: VERSION_DE_LOS_DATOS,
    })
  })

  it('toma lo que otra pestaña escribió', async () => {
    localStorage.setItem(clave, JSON.stringify({ state: { marcas: { s_club: { color: '#0b2d6b' } } }, version: VERSION_DE_LOS_DATOS }))
    window.dispatchEvent(new StorageEvent('storage', { key: clave }))
    await new Promise((r) => setTimeout(r, 20))
    expect(useMarcaDelClubStore.getState().marcas).toEqual({ s_club: { color: '#0b2d6b' } })
  })
})
