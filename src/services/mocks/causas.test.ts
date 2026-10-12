// La tarjeta de una causa muestra «X / Y kg» (CauseCard) y su detalle usa su unidad: tienen que ser la misma.
// El hospital decía «3.120 / 5.000 kg» en la lista y «3.120 / 5.000 tapitas» en el detalle.
import { describe, expect, it } from 'vitest'
import { causes } from './data'

describe('causas de ejemplo', () => {
  it('cada una mide en kilos, como dice su tarjeta', () => {
    for (const c of causes) expect(c.unitLabel, c.name).toMatch(/^kg\b/)
  })
})
