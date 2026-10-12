import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatKg, formatNumber, formatXp, parsePointFromQr, pct, shortCode, unidadDe } from './utils'

describe('pct', () => {
  it('calcula porcentaje redondeado', () => {
    expect(pct(312400, 500000)).toBe(62)
  })
  it('clampa a 100 y maneja total 0', () => {
    expect(pct(10, 5)).toBe(100)
    expect(pct(5, 0)).toBe(0)
  })
})

describe('formatNumber / formatXp', () => {
  it('formatea miles es-AR', () => {
    expect(formatNumber(12450)).toBe('12.450')
    expect(formatXp(5200)).toBe('5.200 XP')
  })
})

describe('cn', () => {
  it('mergea clases y resuelve conflictos de tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('shortCode', () => {
  it('genera un código del largo pedido', () => {
    expect(shortCode(6)).toHaveLength(6)
  })
})

describe('parsePointFromQr', () => {
  it('extrae el id de un deep-link ?p=', () => {
    expect(
      parsePointFromQr('https://soyalantapia.github.io/reciclaje/?p=p_mcdonalds_palermo'),
    ).toBe('p_mcdonalds_palermo')
  })
  it('extrae el id de reciclaxp:point:<id>', () => {
    expect(parsePointFromQr('reciclaxp:point:p_ypf_libertador')).toBe('p_ypf_libertador')
  })
  it('acepta el id crudo', () => {
    expect(parsePointFromQr('p_talleres_estadio')).toBe('p_talleres_estadio')
  })
  it('devuelve null si no reconoce', () => {
    expect(parsePointFromQr('hola mundo')).toBeNull()
  })
})

describe('formatDate', () => {
  it('una fecha sola (AAAA-MM-DD) se muestra ese mismo día, sin correrse por el huso horario', () => {
    const antes = process.env.TZ
    process.env.TZ = 'America/Argentina/Cordoba'
    try {
      expect(formatDate('2026-10-04')).toMatch(/^04\b/)
    } finally {
      if (antes === undefined) delete process.env.TZ
      else process.env.TZ = antes
    }
  })
})

describe('unidadDe', () => {
  it('con una sola unidad va en singular: decía «1 envases»', () => {
    expect(unidadDe('plastico', 1)).toBe('envase')
    expect(unidadDe('tapitas', 1)).toBe('tapita')
    expect(unidadDe('plastico', 2)).toBe('envases')
    expect(unidadDe('tapitas', 50)).toBe('tapitas')
  })
})

describe('formatKg', () => {
  it('con coma decimal, como se escribe acá: decía «1.4 kg»', () => {
    expect(formatKg(1.4)).toBe('1,4 kg')
    expect(formatKg(12)).toBe('12 kg')
    expect(formatKg(1250.5)).toBe('1.250,5 kg')
  })
})
