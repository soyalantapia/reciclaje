import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Sponsor } from '@/types'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'
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
