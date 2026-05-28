import { describe, it, expect } from 'vitest'
import { levelFor, xpToNextLevel } from './copy'

describe('levelFor', () => {
  it('asigna Semilla en 0 XP', () => {
    expect(levelFor(0)).toEqual({ level: 1, name: 'Semilla' })
  })
  it('sube de nivel al cruzar el umbral', () => {
    expect(levelFor(1500).name).toBe('Brote')
    expect(levelFor(12450).name).toBe('Reciclador Pro')
  })
  it('topea en el nivel máximo', () => {
    expect(levelFor(999999).name).toBe('Leyenda Eco')
  })
})

describe('xpToNextLevel', () => {
  it('calcula XP faltante para el próximo nivel', () => {
    expect(xpToNextLevel(0)).toBe(1500)
  })
  it('devuelve 0 en nivel máximo', () => {
    expect(xpToNextLevel(40000)).toBe(0)
  })
})
