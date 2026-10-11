import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  TONOS,
  colorDominante,
  colorLegible,
  contrasteConBlanco,
  esColorPropio,
  estiloDeMarca,
  paletaDeMarca,
} from './marca'

/** Una imagen de mentira: tramos de `n` píxeles RGBA iguales. */
const pixeles = (...tramos: [n: number, r: number, g: number, b: number, a: number][]) =>
  new Uint8ClampedArray(tramos.flatMap(([n, r, g, b, a]) => Array.from({ length: n }, () => [r, g, b, a]).flat()))

describe('paletaDeMarca', () => {
  it('trae los 11 tonos, con el color de la marca en el 600', () => {
    const p = paletaDeMarca('#0b2d6b')
    expect(Object.keys(p)).toEqual([...TONOS])
    expect(p['600']).toBe('#0b2d6b')
    expect(p['50']).toBe('color-mix(in oklab, #0b2d6b 8%, white)')
    expect(p['950']).toBe('color-mix(in oklab, #0b2d6b 40%, black)')
  })

  it('un color tan claro que el texto blanco no se lee encima se oscurece hasta que se lea', () => {
    expect(contrasteConBlanco('#ffe14d')).toBeLessThan(4.5)
    const c = colorLegible('#ffe14d')
    expect(c).not.toBe('#ffe14d')
    expect(contrasteConBlanco(c)).toBeGreaterThanOrEqual(4.5)
    expect(paletaDeMarca('#ffe14d')['600']).toBe(c)
  })

  it('un color oscuro queda como está, en minúsculas', () => {
    expect(colorLegible('#0B2D6B')).toBe('#0b2d6b')
  })

  it('un color roto vuelve al de ReciclaXP', () => {
    expect(paletaDeMarca('rojo')['600']).toBe('#059669')
  })

  // Lo que está guardado en el navegador puede venir sin color, o con uno que no es texto: no tiene que tirar.
  it.each([[undefined], [null], [123], [{}]])('un color que ni siquiera es texto (%j) vuelve al de ReciclaXP, sin tirar', (roto) => {
    const color = roto as unknown as string
    expect(colorLegible(color)).toBe('#059669')
    expect(paletaDeMarca(color)['600']).toBe('#059669')
    expect(estiloDeMarca(color)['--eco-600']).toBe('#059669')
    expect(contrasteConBlanco(color)).toBe(contrasteConBlanco('#059669'))
  })
})

describe('esColorPropio', () => {
  it('un color que la institución eligió lo es, sea claro u oscuro', () => {
    expect(esColorPropio('#0b2d6b')).toBe(true)
    expect(esColorPropio('#ffe14d')).toBe(true)
    expect(esColorPropio('#0B2D6B')).toBe(true)
  })

  it('el verde de ReciclaXP no: es el «todavía no eligió el suyo», y no pisa la paleta', () => {
    expect(esColorPropio('#059669')).toBe(false)
    // Y tampoco si llega con otra forma: sin la # o con espacios.
    expect(esColorPropio('059669')).toBe(false)
    expect(esColorPropio(' #059669 ')).toBe(false)
  })

  it('un verde parecido, pero que no es el de ReciclaXP, sí es propio', () => {
    expect(esColorPropio('#059668')).toBe(true)
    expect(esColorPropio('#05a669')).toBe(true)
  })

  it.each([[undefined], [null], [123], [{}], [''], ['rojo'], ['#12345']])('lo que no es un color (%j) no lo es', (roto) => {
    expect(esColorPropio(roto)).toBe(false)
  })
})

describe('estiloDeMarca', () => {
  it('devuelve las 11 variables que pisan la paleta eco', () => {
    const e = estiloDeMarca('#0b2d6b')
    expect(Object.keys(e)).toEqual(TONOS.map((t) => `--eco-${t}`))
    expect(e['--eco-600']).toBe('#0b2d6b')
  })
})

describe('colorDominante', () => {
  it('encuentra el azul de un escudo azul y blanco, sin contar el borde negro ni lo transparente', () => {
    const escudo = pixeles([300, 255, 255, 255, 255], [200, 11, 45, 107, 255], [80, 0, 0, 0, 255], [400, 0, 0, 0, 0])
    expect(colorDominante(escudo)).toBe('#0b2d6b')
  })

  it('entre dos colores gana el que más se usa', () => {
    expect(colorDominante(pixeles([100, 200, 30, 30, 255], [150, 11, 45, 107, 255]))).toBe('#0b2d6b')
  })

  it('en una imagen blanca, gris o transparente no hay color', () => {
    expect(colorDominante(pixeles([50, 255, 255, 255, 255], [50, 128, 128, 128, 255], [50, 11, 45, 107, 0]))).toBeNull()
  })
})

describe('la paleta eco pasa por variables (src/index.css)', () => {
  // Sin esto, el panel no puede tomar la marca: Tailwind pegaría el valor fijo en cada clase.
  const css = readFileSync('src/index.css', 'utf8')
  const VALORES = ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22']

  it.each(TONOS.map((t, i) => [t, VALORES[i]]))('eco-%s apunta a su variable, que vale %s', (tono, valor) => {
    expect(css).toContain(`--color-eco-${tono}: var(--eco-${tono});`)
    expect(css).toContain(`--eco-${tono}: ${valor};`)
  })
})
