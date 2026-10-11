import { describe, expect, it } from 'vitest'

describe('el almacenamiento de las pruebas', () => {
  it('localStorage y sessionStorage guardan, leen y borran, como en un navegador', () => {
    for (const almacen of [localStorage, sessionStorage]) {
      almacen.setItem('clave', 'valor')
      expect(almacen.getItem('clave')).toBe('valor')
      almacen.removeItem('clave')
      expect(almacen.getItem('clave')).toBeNull()
    }
  })
})
