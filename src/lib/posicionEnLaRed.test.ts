import { describe, expect, it } from 'vitest'
import { posicionEnLaRed, textoDePosicion } from './posicionEnLaRed'

const red = [
  { id: 'a', name: 'Coca-Cola', greenScore: 90 },
  { id: 'b', name: 'Grido', greenScore: 68 },
  { id: 'club', name: 'Talleres', greenScore: 64 },
]

describe('posicionEnLaRed', () => {
  it('dice el puesto real en la red y a cuántos puntos está el siguiente (antes decía «Top 12%» a todos)', () => {
    const p = posicionEnLaRed('club', 64, red)
    expect(p).toEqual({ puesto: 3, total: 3, siguiente: { nombre: 'Grido', diferencia: 4 } })
    expect(textoDePosicion(p)).toBe('Puesto 3 de 3 en la red · a 4 puntos de Grido')
  })

  it('el primero no tiene a quién alcanzar', () => {
    const p = posicionEnLaRed('a', 90, red)
    expect(p).toEqual({ puesto: 1, total: 3 })
    expect(textoDePosicion(p)).toBe('Primer puesto de la red 🌎')
  })

  it('un comercio recién creado, que todavía no está en la lista, se cuenta igual', () => {
    expect(posicionEnLaRed('nuevo', 70, red)).toEqual({ puesto: 2, total: 4, siguiente: { nombre: 'Coca-Cola', diferencia: 20 } })
  })
})
