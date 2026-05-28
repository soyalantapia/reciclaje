import { describe, it, expect } from 'vitest'
import { cn, formatNumber, formatXp, parsePointFromQr, pct, shortCode } from './utils'

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
    expect(parsePointFromQr('p_river_monumental')).toBe('p_river_monumental')
  })
  it('devuelve null si no reconoce', () => {
    expect(parsePointFromQr('hola mundo')).toBeNull()
  })
})
