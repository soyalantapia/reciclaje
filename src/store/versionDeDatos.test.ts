import { beforeEach, describe, expect, it, vi } from 'vitest'
import { claveDeAlmacenamiento } from '@/lib/escenario'

const guardado = (version: number) =>
  JSON.stringify({
    state: { sessionContributions: [{ id: 'c_viejo', pointName: 'Máquinas Estadio Monumental', sponsorName: 'River Plate' }] },
    version,
  })

/** Un localStorage en memoria: el del entorno de pruebas no trae `clear` ni guarda de verdad. */
function almacenEnMemoria(): Storage {
  const datos = new Map<string, string>()
  return {
    get length() {
      return datos.size
    },
    clear: () => datos.clear(),
    getItem: (k) => datos.get(k) ?? null,
    key: (i) => [...datos.keys()][i] ?? null,
    removeItem: (k) => void datos.delete(k),
    setItem: (k, v) => void datos.set(k, String(v)),
  }
}

describe('datos de la demo guardados en el navegador', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', almacenEnMemoria())
    vi.resetModules()
  })

  it('lo guardado antes del cambio a Talleres se descarta: no vuelve a aparecer «River» por lo que había en el navegador', async () => {
    localStorage.setItem(claveDeAlmacenamiento('activity'), guardado(1))
    const { useActivityStore } = await import('./activity')
    expect(useActivityStore.getState().sessionContributions).toEqual([])
  })

  it('lo guardado con la versión actual se conserva', async () => {
    const { VERSION_DE_LOS_DATOS } = await import('./versionDeDatos')
    localStorage.setItem(claveDeAlmacenamiento('activity'), guardado(VERSION_DE_LOS_DATOS))
    const { useActivityStore } = await import('./activity')
    expect(useActivityStore.getState().sessionContributions.map((c) => c.id)).toEqual(['c_viejo'])
  })
})
