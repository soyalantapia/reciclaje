/** Lo que necesita de un store guardado con `persist` de zustand. */
interface StoreGuardado {
  persist: { getOptions: () => { name?: string }; rehydrate: () => Promise<void> | void }
}

/**
 * Que el store tome lo que otra pestaña del mismo navegador escribió, sin recargar. Durante la demo, la app del
 * hincha y el panel del club van en dos pestañas: un aporte en una tiene que verse en la otra. El navegador avisa
 * con `storage` sólo a las otras pestañas, nunca a la que escribió.
 */
export function sincronizarEntrePestanas(store: StoreGuardado): void {
  if (typeof window === 'undefined') return
  const clave = store.persist.getOptions().name
  window.addEventListener('storage', (e) => {
    if (clave && e.key === clave) void store.persist.rehydrate()
  })
}
