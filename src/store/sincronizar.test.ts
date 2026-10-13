// La app del hincha y el panel del club van en dos pestañas del mismo navegador durante la demo. Lo que una escribe,
// la otra lo toma sin recargar. Sólo lo hacían los productos, los pesajes y la marca: en la auditoría del 13/10, el
// panel abierto seguía en 42.840 después de un aporte hecho en la pestaña de la app.
import { beforeEach, describe, expect, it } from 'vitest'
import { useActivityStore } from './activity'
import { useWalletStore } from './wallet'
import { useCommerceBenefitsStore } from './commerceBenefits'
import { useCommerceCampaignsStore } from './commerceCampaigns'
import { useCouponsStore } from './coupons'
import { useSessionStore } from './session'

type ConPersist = { persist: { getOptions: () => { name?: string; version?: number } } }

/** Escribe lo que escribiría otra pestaña y avisa como avisa el navegador. */
async function otraPestanaEscribe(store: ConPersist, state: object) {
  const { name, version } = store.persist.getOptions()
  localStorage.setItem(name!, JSON.stringify({ state, version }))
  window.dispatchEvent(new StorageEvent('storage', { key: name! }))
  await new Promise((r) => setTimeout(r, 0))
}

beforeEach(() => {
  useActivityStore.setState({ sessionContributions: [] })
  useCommerceBenefitsStore.setState({ created: [], pausedIds: [] })
  useCommerceCampaignsStore.setState({ campaigns: [], pausedIds: [] })
  useCouponsStore.setState({ coupons: [] })
})

describe('lo que escribe otra pestaña', () => {
  it('el aporte hecho en la app llega al panel abierto', async () => {
    await otraPestanaEscribe(useActivityStore, { sessionContributions: [{ id: 'c_otra', units: 50 }] })
    expect(useActivityStore.getState().sessionContributions.map((c) => c.id)).toEqual(['c_otra'])
  })

  it('el saldo de XP de la otra pestaña de la app', async () => {
    await otraPestanaEscribe(useWalletStore, { ...useWalletStore.getState(), spendableXp: 4321 })
    expect(useWalletStore.getState().spendableXp).toBe(4321)
  })

  it('el beneficio y la campaña que publica el panel llegan a la app abierta', async () => {
    await otraPestanaEscribe(useCommerceBenefitsStore, { created: [{ id: 'b_otra' }], pausedIds: [] })
    await otraPestanaEscribe(useCommerceCampaignsStore, { campaigns: [{ id: 'k_otra' }], pausedIds: [] })
    expect(useCommerceBenefitsStore.getState().created.map((b) => b.id)).toEqual(['b_otra'])
    expect(useCommerceCampaignsStore.getState().campaigns.map((c) => c.id)).toEqual(['k_otra'])
  })

  it('el cupón canjeado en otra pestaña', async () => {
    await otraPestanaEscribe(useCouponsStore, { coupons: [{ id: 'cu_otra' }] })
    expect(useCouponsStore.getState().coupons.map((c) => c.id)).toEqual(['cu_otra'])
  })

  // La verificación del 13/10: con el panel abierto antes que la app, el panel no sabía que entró Camila y mostraba
  // «Un hincha dejó 50 tapitas» y a Camila con 640 tapitas, mientras la app decía 690.
  it('quien entró a la app en otra pestaña, sin perder el panel abierto en esta', async () => {
    const talleres = { id: 's_club', name: 'Talleres' }
    useSessionStore.setState({ user: null, isAuthenticated: false, commerce: talleres as never })
    await otraPestanaEscribe(useSessionStore, { user: { id: 'u_me', name: 'Camila Ríos' }, isAuthenticated: true, commerce: talleres })
    expect(useSessionStore.getState().user?.name).toBe('Camila Ríos')
    expect(useSessionStore.getState().commerce?.id).toBe('s_club')
  })
})
