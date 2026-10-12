// El sonido del festejo: se arma con el sintetizador del navegador, sin archivos, y respeta el silencio.
import { beforeEach, describe, expect, it } from 'vitest'
import { useSonidoStore } from '@/store/sonido'
import { prepararSonido, sonarLogro, sonarTapitas, olvidarSonido } from './sonido'

/** Un AudioContext de mentira que anota cuándo arranca cada oscilador. */
class ContextoFalso {
  currentTime = 10
  state = 'suspended'
  destination = {}
  static arranques: number[] = []
  resume() {
    this.state = 'running'
    return Promise.resolve()
  }
  createGain() {
    return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: () => ({}) }
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect: () => ({}),
      start: (t: number) => ContextoFalso.arranques.push(t),
      stop() {},
    }
  }
}

beforeEach(() => {
  ContextoFalso.arranques = []
  olvidarSonido()
  useSonidoStore.setState({ activo: true })
  ;(globalThis as { AudioContext?: unknown }).AudioContext = ContextoFalso
})

describe('sonido del festejo', () => {
  it('sin preparar (sin un toque de la persona) no suena nada', () => {
    sonarTapitas([0.5, 1])
    expect(ContextoFalso.arranques).toEqual([])
  })

  it('un tic por tapita, a la hora en que cae', () => {
    prepararSonido()
    sonarTapitas([1, 1.07, 1.14])
    // Cada tic arranca a su tiempo, contado desde ahora (10 s): 11, 11.07, 11.14.
    const inicios = [...new Set(ContextoFalso.arranques.map((t) => t.toFixed(2)))]
    expect(inicios).toEqual(['11.00', '11.07', '11.14'])
  })

  it('el logro suena con cuatro notas que suben', () => {
    prepararSonido()
    sonarLogro(0.5)
    expect(ContextoFalso.arranques).toHaveLength(4)
    expect(ContextoFalso.arranques[0]).toBeCloseTo(10.5)
    expect([...ContextoFalso.arranques].sort()).toEqual(ContextoFalso.arranques)
  })

  it('en silencio no suena nada', () => {
    prepararSonido()
    useSonidoStore.setState({ activo: false })
    sonarTapitas([1])
    sonarLogro(0)
    expect(ContextoFalso.arranques).toEqual([])
  })

  it('un navegador sin Web Audio no rompe nada', () => {
    delete (globalThis as { AudioContext?: unknown }).AudioContext
    expect(() => {
      prepararSonido()
      sonarTapitas([1])
      sonarLogro(0)
    }).not.toThrow()
  })
})
