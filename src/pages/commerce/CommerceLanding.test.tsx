import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import CommerceLanding from './CommerceLanding'

vi.mock('@/services/api', () => ({ api: { getSponsors: () => new Promise(() => {}) } }))

beforeAll(() => {
  // jsdom no trae IntersectionObserver: el header y las animaciones al entrar en pantalla lo usan.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

/**
 * Lo que la landing de comercios no puede prometer hasta el piloto
 * (docs/producto/prometido-vs-demo.md, fila «RSE verificable…» y multiplicador).
 * Hoy los datos son de ejemplo, no hay panel en tiempo real ni constancia verificable,
 * y el multiplicador de XP no cambia los XP de nadie. «Verific…» atrapa también «impacto que se puede
 * verificar», que se escapaba del candado. Y no hay cobro: el plan no se cambia ni se pausa desde el panel.
 */
const PROMESAS_DEL_PILOTO = [/verific/i, /plan cuando quieras desde el panel/i, /\ben vivo\b/i, /tiempo real/i, /auditor[ií]a/i, /multiplicador/i]

describe('landing de comercios', () => {
  it('no promete lo que todavía no existe', () => {
    const { container } = render(
      <MemoryRouter>
        <CommerceLanding />
      </MemoryRouter>,
    )
    const texto = container.textContent ?? ''
    expect(texto).toContain('Huella Verde')
    const encontradas = PROMESAS_DEL_PILOTO.filter((p) => p.test(texto)).map(String)
    expect(encontradas).toEqual([])
  })
})
