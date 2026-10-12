import { useSonidoStore } from '@/store/sonido'

/**
 * El sonido del festejo (pedido de Juanpi del 12/10/2026: «que las tapitas hagan un sonido»), armado con
 * el sintetizador del navegador: sin archivos que bajar. Chrome y Safari sólo dejan sonar después de un
 * toque, así que `prepararSonido` se llama en el toque de «Registrar aporte»; sin eso, no suena nada.
 * Sin Web Audio o en silencio, todo es un no-op.
 */
let contexto: AudioContext | null = null

type ConstructorDeAudio = new () => AudioContext

function constructorDeAudio(): ConstructorDeAudio | undefined {
  const g = globalThis as { AudioContext?: ConstructorDeAudio; webkitAudioContext?: ConstructorDeAudio }
  return g.AudioContext ?? g.webkitAudioContext
}

/** Se llama dentro del toque de la persona: crea o despierta el audio. */
export function prepararSonido(): void {
  const Audio = constructorDeAudio()
  if (!Audio) return
  try {
    contexto ??= new Audio()
    if (contexto.state === 'suspended') void contexto.resume()
  } catch {
    contexto = null
  }
}

/** Para las pruebas: vuelve al estado de una página recién abierta. */
export function olvidarSonido(): void {
  contexto = null
}

function listo(): AudioContext | null {
  return contexto && useSonidoStore.getState().activo ? contexto : null
}

/** Una nota corta: sube en 5 ms y se apaga sola. */
function nota(ctx: AudioContext, cuando: number, frecuencia: number, duracion: number, volumen: number, tipo: OscillatorType) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = tipo
  osc.frequency.setValueAtTime(frecuencia, cuando)
  gain.gain.setValueAtTime(0.0001, cuando)
  gain.gain.linearRampToValueAtTime(volumen, cuando + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(cuando)
  osc.stop(cuando + duracion + 0.02)
}

/** Un tic de tapita de plástico por cada golpe, a esos segundos desde ahora. */
export function sonarTapitas(golpes: number[]): void {
  const ctx = listo()
  if (!ctx) return
  golpes.forEach((t, i) => {
    const cuando = ctx.currentTime + t
    // Cada tapita suena un poco distinta, como de verdad.
    const tono = 1500 + ((i * 337) % 900)
    nota(ctx, cuando, tono, 0.07, 0.18, 'triangle')
  })
}

/** El logro: cuatro notas que suben (do, mi, sol, do), como campanitas. */
export function sonarLogro(retraso: number): void {
  const ctx = listo()
  if (!ctx) return
  ;[1046.5, 1318.5, 1568, 2093].forEach((f, i) => nota(ctx, ctx.currentTime + retraso + i * 0.09, f, 0.6, 0.14, 'sine'))
}
