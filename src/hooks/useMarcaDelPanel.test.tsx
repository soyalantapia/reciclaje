import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Sponsor } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'
import { VERSION_DE_LOS_DATOS } from '@/store/versionDeDatos'
import { useMarcaDelPanel } from './useMarcaDelPanel'

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
const ESCUDO = 'data:image/png;base64,ESCUDO'

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
  useSessionStore.setState({ commerce: club })
})

describe('useMarcaDelPanel', () => {
  it('devuelve la marca de la institución que entró, con las variables de su paleta', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    const { result } = renderHook(() => useMarcaDelPanel())
    expect(result.current).toMatchObject({ escudo: ESCUDO, color: '#0b2d6b' })
    expect(result.current?.estilo).toMatchObject({ '--eco-600': '#0b2d6b' })
  })

  it('cada institución toma la suya, no la de otra', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    useMarcaDelClubStore.getState().guardar('s_estadio', { color: '#aa0000' })
    useSessionStore.setState({ commerce: { ...club, id: 's_estadio', category: 'estadio' } })
    expect(renderHook(() => useMarcaDelPanel()).result.current).toMatchObject({ color: '#aa0000' })
  })

  it('sin marca guardada, no hay marca', () => {
    expect(renderHook(() => useMarcaDelPanel()).result.current).toBeNull()
  })

  it('un comercio no toma marca de club, aunque haya algo guardado con su id', () => {
    useSessionStore.setState({ commerce: { ...club, id: 's_cafe', category: 'comercio' } })
    useMarcaDelClubStore.getState().guardar('s_cafe', { color: '#0b2d6b' })
    expect(renderHook(() => useMarcaDelPanel()).result.current).toBeNull()
  })
})

// El verde de ReciclaXP es el «todavía no eligió el suyo»: un escudo del que no salió ningún color (blanco y
// gris) se guarda con él, y no puede oscurecer el panel como si el club lo hubiera elegido.
describe('el verde de ReciclaXP no es un color propio', () => {
  it('no pisa la paleta, pero el escudo se muestra', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#059669' })
    const { result } = renderHook(() => useMarcaDelPanel())
    expect(result.current).toEqual({ escudo: ESCUDO, color: '#059669', estilo: {} })
  })

  it('tampoco si llega sin la # o con espacios', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: ' 059669 ' })
    expect(renderHook(() => useMarcaDelPanel()).result.current?.estilo).toEqual({})
  })

  it('un verde que no es el de ReciclaXP sí pisa la paleta', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#00a000' })
    expect(Object.keys(renderHook(() => useMarcaDelPanel()).result.current!.estilo)).toHaveLength(11)
  })
})

// Lo que el navegador tiene guardado puede no respetar la forma: una versión vieja, o alguien que lo tocó.
// zustand mezcla lo guardado con lo de fábrica sin mirarlo, así que llega tal cual.
describe('si lo guardado en el navegador viene roto', () => {
  /** Lo que está en localStorage, y el store lo lee de nuevo como cuando se abre la pestaña. */
  async function guardadoEnElNavegador(estado: unknown) {
    localStorage.setItem(
      claveDeAlmacenamiento('marca-del-club'),
      JSON.stringify({ state: estado, version: VERSION_DE_LOS_DATOS }),
    )
    await useMarcaDelClubStore.persist.rehydrate()
  }

  it('sin ninguna marca (marcas: null), no hay marca y no tira', async () => {
    await guardadoEnElNavegador({ marcas: null })
    expect(useMarcaDelClubStore.getState().marcas).toBeNull()
    expect(renderHook(() => useMarcaDelPanel()).result.current).toBeNull()
  })

  it('una marca sin color toma el verde de ReciclaXP, sin pisar la paleta, y conserva su escudo', async () => {
    await guardadoEnElNavegador({ marcas: { s_club: { escudo: ESCUDO } } })
    expect(renderHook(() => useMarcaDelPanel()).result.current).toEqual({ escudo: ESCUDO, color: '#059669', estilo: {} })
  })

  it('una marca con el color en un número hace lo mismo', async () => {
    await guardadoEnElNavegador({ marcas: { s_club: { color: 123 } } })
    expect(renderHook(() => useMarcaDelPanel()).result.current).toEqual({ color: '#059669', estilo: {} })
  })
})
