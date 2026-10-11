import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint, Sponsor } from '@/types'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { useSessionStore } from '@/store/session'
import { usePuntosDelPanel } from './usePuntosDelPanel'

const punto = (id: string, sponsorId: string): RecyclePoint => ({
  id, name: id, sponsorId, type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas'], openNow: true,
})
const delSimulador = [punto('p_club_estadio', 's_club')]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: { getPoints: () => Promise.resolve(delSimulador) },
}))

const clubNuevo: Sponsor = {
  id: 's_new_1', name: 'Club Nuevo', slug: 'club-nuevo', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 70, kgRecovered: 100,
}
const delAlta = punto('p_new_1', 's_new_1')

beforeEach(() => {
  useCreatedCommerceStore.setState({ commerce: null, point: null })
})

describe('usePuntosDelPanel', () => {
  it('a quien se dio de alta le suma su Punto R a los del simulador', async () => {
    useSessionStore.setState({ commerce: clubNuevo })
    useCreatedCommerceStore.setState({ commerce: clubNuevo, point: delAlta })
    const { result } = renderHook(() => usePuntosDelPanel())
    await waitFor(() => expect(result.current.points?.map((p) => p.id)).toEqual(['p_club_estadio', 'p_new_1']))
  })

  it('a otro comercio no le suma el punto de un alta ajena', async () => {
    useSessionStore.setState({ commerce: { ...clubNuevo, id: 's_club' } })
    useCreatedCommerceStore.setState({ commerce: clubNuevo, point: delAlta })
    const { result } = renderHook(() => usePuntosDelPanel())
    await waitFor(() => expect(result.current.points?.map((p) => p.id)).toEqual(['p_club_estadio']))
  })
})
