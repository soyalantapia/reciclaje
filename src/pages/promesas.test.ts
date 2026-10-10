import { describe, expect, it } from 'vitest'

/**
 * Lo que la demo no puede prometer hasta el piloto, en cualquier pantalla
 * (docs/producto/prometido-vs-demo.md). Hoy los reportes son de ejemplo y el reporte mismo dice que
 * no sirve como respaldo de RSE, no hay constancia verificable y la trazabilidad tiene etapas fijas.
 * La landing de comercios tiene además su propio candado, que la renderiza (CommerceLanding.test.tsx).
 */
const PROMESAS = [/reportes? (de )?RSE/i, /reporte para RSE/i, /RSE verificable/i, /evento verificable/i]

const fuentes = import.meta.glob(['./**/*.tsx', '!./**/*.test.tsx'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>

describe('pantallas', () => {
  it('se leyeron las pantallas (si esto da 0, el candado pasaría sin mirar nada)', () => {
    expect(Object.keys(fuentes).length).toBeGreaterThan(20)
  })

  it('ninguna promete reportes de RSE ni hitos verificables', () => {
    const encontradas = Object.entries(fuentes).flatMap(([archivo, texto]) =>
      PROMESAS.filter((p) => p.test(texto)).map((p) => `${archivo} ${p}`),
    )
    expect(encontradas).toEqual([])
  })
})
