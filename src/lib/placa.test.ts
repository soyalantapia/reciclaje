// La placa de la Huella Verde se descarga y se comparte fuera de la app: tiene que decir que es un dato de ejemplo,
// como cada pantalla con números (la regla de honestidad del proyecto).
import { describe, expect, it } from 'vitest'
import { placaHuellaVerde } from './placa'

describe('placaHuellaVerde', () => {
  it('lleva el nombre, el puntaje y el aviso de datos de ejemplo', () => {
    const svg = placaHuellaVerde('Talleres', 64)
    expect(svg).toContain('>Talleres<')
    expect(svg).toContain('>64<')
    expect(svg).toMatch(/Datos de ejemplo/)
  })

  it('escapa el nombre: un «&» o un «<» no rompen el SVG', () => {
    expect(placaHuellaVerde('Café & Co <Centro>', 70)).toContain('Café &amp; Co &lt;Centro&gt;')
  })
})
