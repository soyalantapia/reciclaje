import { describe, expect, it } from 'vitest'
import { ESCUDO_TOPE_BYTES, EscudoInvalido, prepararEscudo } from './escudo'

// Lo que usa el canvas no corre en jsdom: acá se prueba lo que se rechaza antes de abrir la imagen.
describe('prepararEscudo', () => {
  it('rechaza lo que no es una imagen', async () => {
    await expect(prepararEscudo(new File(['hola'], 'escudo.txt', { type: 'text/plain' }))).rejects.toThrow(EscudoInvalido)
  })

  it('rechaza un escudo de más de 2 MB', async () => {
    const pesado = new File([new Uint8Array(ESCUDO_TOPE_BYTES + 1)], 'escudo.png', { type: 'image/png' })
    await expect(prepararEscudo(pesado)).rejects.toThrow(/2 MB/)
  })
})
