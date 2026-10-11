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
  it('«Productos» es de las instituciones: un club o un estadio lo ven, un comercio no', () => {
    expect(navDelPanel('club', 'club').map((i) => i.to)).toContain('/comercio/productos')
    expect(navDelPanel('general', 'estadio').map((i) => i.to)).toContain('/comercio/productos')
    expect(navDelPanel('general', 'comercio').map((i) => i.to)).not.toContain('/comercio/productos')
    expect(navDelPanel('general').map((i) => i.to)).not.toContain('/comercio/productos')
  })

  it('para el club, «Productos» va segundo, después del resumen', () => {
    expect(navDelPanel('club', 'club').map((i) => i.label).slice(0, 2)).toEqual(['Resumen', 'Productos'])
  })

  it('«Marca» es de las instituciones: un club o un estadio la ven, un comercio no', () => {
    expect(navDelPanel('club', 'club').map((i) => i.to)).toContain('/comercio/marca')
    expect(navDelPanel('general', 'estadio').map((i) => i.to)).toContain('/comercio/marca')
    expect(navDelPanel('general', 'comercio').map((i) => i.to)).not.toContain('/comercio/marca')
    expect(navDelPanel('general').map((i) => i.to)).not.toContain('/comercio/marca')
  })

  it('«Marca» va entre «Reportes» y «Plan»; donde no hay «Plan», queda al final', () => {
    const general = navDelPanel('general', 'club').map((i) => i.label)
    expect(general.slice(general.indexOf('Reportes'))).toEqual(['Reportes', 'Marca', 'Plan'])
    const club = navDelPanel('club', 'club').map((i) => i.label)
    expect(club.slice(club.indexOf('Reportes'))).toEqual(['Reportes', 'Marca'])
  })
})

describe('etiqueta del panel', () => {
  it('un club o un estadio ven «Panel de la institución», en el menú de escritorio y en el del celular', () => {
    expect(etiquetaDelPanel('club')).toBe('Panel de la institución')
    expect(etiquetaDelPanel('estadio')).toBe('Panel de la institución')
    expect(etiquetaDelPanel('cafe')).toBe('Panel del comercio')
  })
})
