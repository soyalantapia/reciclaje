import { describe, expect, it } from 'vitest'
import { estadosDelBanco, tapitasEncendidas, TAPITAS_DEL_BANCO } from './bancoDeTapitas'

const cuantas = (estados: string[], e: string) => estados.filter((x) => x === e).length

describe('tapitasEncendidas', () => {
  it('sin avance no enciende ninguna', () => {
    expect(tapitasEncendidas(0, 80)).toBe(0)
    expect(tapitasEncendidas(Number.NaN, 80)).toBe(0)
  })

  it('con algo de avance enciende al menos una: un proyecto que arrancó no se ve vacío', () => {
    expect(tapitasEncendidas(0.0001, 80)).toBe(1)
  })

  it('el 14 % de 80 son 11', () => {
    expect(tapitasEncendidas(42840 / 300000, 80)).toBe(11)
  })

  it('completo o pasado enciende todas', () => {
    expect(tapitasEncendidas(1, 80)).toBe(80)
    expect(tapitasEncendidas(1.5, 80)).toBe(80)
  })
})

describe('estadosDelBanco', () => {
  it('las tuyas son las últimas encendidas, y si aportaste hay al menos una', () => {
    const e = estadosDelBanco({ total: TAPITAS_DEL_BANCO, progreso: 42840 / 300000, propias: 640 / 42840 })
    expect(e).toHaveLength(80)
    expect(cuantas(e, 'hinchada')).toBe(10)
    expect(cuantas(e, 'tuya')).toBe(1)
    expect(e[10]).toBe('tuya')
    expect(cuantas(e, 'vacia')).toBe(69)
  })

  it('sin aporte propio no hay tuyas', () => {
    expect(cuantas(estadosDelBanco({ total: 80, progreso: 0.5, propias: 0 }), 'tuya')).toBe(0)
  })

  it('sin avance está todo vacío, aunque haya aporte propio', () => {
    expect(cuantas(estadosDelBanco({ total: 80, progreso: 0, propias: 1 }), 'vacia')).toBe(80)
  })

  it('si todo lo aportaste vos, todas las encendidas son tuyas', () => {
    const e = estadosDelBanco({ total: 80, progreso: 0.25, propias: 1 })
    expect(cuantas(e, 'tuya')).toBe(20)
    expect(cuantas(e, 'hinchada')).toBe(0)
  })
})
