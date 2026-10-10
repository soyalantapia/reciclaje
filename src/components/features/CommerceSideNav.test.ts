import { describe, expect, it } from 'vitest'
import { etiquetaDelPanel, navDelPanel } from './CommerceSideNav'

describe('menú del panel', () => {
  it('en la demo del club no hay «Plan»: no se le muestran precios de comercio al club', () => {
    expect(navDelPanel('club').map((i) => i.to)).not.toContain('/comercio/plan')
    expect(navDelPanel('club').map((i) => i.to)).toContain('/comercio/reportes')
  })
  it('en la demo general sigue estando', () => {
    expect(navDelPanel('general').map((i) => i.to)).toContain('/comercio/plan')
  })
})

describe('etiqueta del panel', () => {
  it('un club o un estadio ven «Panel de la institución», en el menú de escritorio y en el del celular', () => {
    expect(etiquetaDelPanel('club')).toBe('Panel de la institución')
    expect(etiquetaDelPanel('estadio')).toBe('Panel de la institución')
    expect(etiquetaDelPanel('cafe')).toBe('Panel del comercio')
  })
})
