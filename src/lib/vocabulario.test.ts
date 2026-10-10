import { describe, expect, it } from 'vitest'
import { vocabularioDelPanel } from './vocabulario'

describe('vocabularioDelPanel', () => {
  it('a un club o a un estadio no se le habla como a un comercio', () => {
    for (const categoria of ['club', 'estadio']) {
      const v = vocabularioDelPanel(categoria)
      expect(v.panel).toBe('Panel de la institución')
      expect(Object.values(v).join(' · ')).not.toMatch(/comercio|clientes|vidriera|\blocal\b/)
    }
  })

  it('un comercio sigue hablando como comercio', () => {
    const v = vocabularioDelPanel('marca')
    expect(v.panel).toBe('Panel del comercio')
    expect(v.comunidad).toBe('tus clientes')
    expect(v.dondeVaElQr).toBe('el local')
  })
})
