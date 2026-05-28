import { describe, it, expect } from 'vitest'
import { cn, formatNumber, formatXp, pct, shortCode } from './utils'

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
