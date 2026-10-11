/**
 * La marca de una institución en su panel: un color y, si lo subió, su escudo. Nada de esto está en
 * el código: lo carga quien usa el panel y queda en su navegador (src/store/marcaDelClub.ts), porque
 * el repo y la demo son públicos. Acá está la lógica pura: la paleta que pisa los tokens eco-* y el
 * color que se toma del escudo.
 */

export const TONOS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
export type Tono = (typeof TONOS)[number]

/**
 * El color de ReciclaXP: el que queda si llega un color roto, y el de una institución que todavía no
 * eligió el suyo. Como no es un color que la institución haya puesto, no pisa la paleta (`esColorPropio`).
 */
export const COLOR_DE_RECICLAXP = '#059669'

type Rgb = [number, number, number]

function hexARgb(hex: unknown): Rgb | null {
  // Lo guardado en el navegador puede venir sin color, o con uno que no es texto: es un color roto.
  if (typeof hex !== 'string') return null
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbAHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

/** La luminancia relativa de WCAG 2. */
function luminancia([r, g, b]: Rgb): number {
  const lineal = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
}

/** El contraste del texto blanco sobre ese color (de 1 a 21; 4,5 es el mínimo para leer). */
export function contrasteConBlanco(hex: string): number {
  const rgb = hexARgb(hex) ?? hexARgb(COLOR_DE_RECICLAXP)!
  return 1.05 / (luminancia(rgb) + 0.05)
}

/**
 * El color que va en los botones (el 600): el de la marca, oscurecido de a poco si el texto blanco
 * no se lee encima. Un color roto vuelve al de ReciclaXP.
 */
export function colorLegible(hex: string): string {
  const rgb = hexARgb(hex)
  // El verde de ReciclaXP rinde 3,8:1 contra el blanco: oscurecerlo lo haría otro verde, no el de siempre.
  if (!rgb) return COLOR_DE_RECICLAXP
  for (let paso = 0; paso <= 20; paso++) {
    const c = rgbAHex(rgb.map((v) => v * (1 - paso * 0.05)) as Rgb)
    if (contrasteConBlanco(c) >= 4.5) return c
  }
  return '#000000'
}

/** Los 11 tonos de la marca: los claros mezclan el color con blanco; los oscuros, con negro. */
export function paletaDeMarca(color: string): Record<Tono, string> {
  const c = colorLegible(color)
  const conBlanco = (p: number) => `color-mix(in oklab, ${c} ${p}%, white)`
  const conNegro = (p: number) => `color-mix(in oklab, ${c} ${p}%, black)`
  return {
    '50': conBlanco(8),
    '100': conBlanco(16),
    '200': conBlanco(30),
    '300': conBlanco(48),
    '400': conBlanco(68),
    '500': conBlanco(85),
    '600': c,
    '700': conNegro(85),
    '800': conNegro(70),
    '900': conNegro(55),
    '950': conNegro(40),
  }
}

/**
 * Las variables que pisan la paleta eco: van en el contenedor del panel de la institución
 * (`style={estiloDeMarca(color)}`) y, mientras ese panel está abierto, también en `<html>`, para lo que
 * se monta fuera del contenedor (los Modal).
 */
export function estiloDeMarca(color: string): Record<`--eco-${Tono}`, string> {
  const paleta = paletaDeMarca(color)
  return Object.fromEntries(TONOS.map((t) => [`--eco-${t}`, paleta[t]])) as Record<`--eco-${Tono}`, string>
}

/**
 * ¿La institución eligió un color propio? El verde de ReciclaXP no cuenta: es el que queda si todavía no
 * eligió ninguno, o si del escudo no salió ningún color, y no tiene que pisar la paleta ni oscurecerla
 * como si lo hubiera elegido. Un color roto tampoco, porque cae a ese verde. La comparación es por el
 * color y no por el texto: `#059669`, `059669` y ` #059669 ` son el mismo.
 */
export function esColorPropio(color: unknown): boolean {
  const rgb = hexARgb(color)
  return rgb !== null && rgbAHex(rgb) !== COLOR_DE_RECICLAXP.toLowerCase()
}

/**
 * El color de un escudo: el más usado entre los que tienen color. No cuenta lo transparente, lo
 * blanco, lo negro ni lo gris. Recibe los bytes RGBA de la imagen (`ImageData.data`). Sin ningún
 * color, devuelve null.
 */
export function colorDominante(pixeles: ArrayLike<number>): string | null {
  const cubetas = new Map<number, { n: number; r: number; g: number; b: number }>()
  for (let i = 0; i + 3 < pixeles.length; i += 4) {
    const r = pixeles[i]
    const g = pixeles[i + 1]
    const b = pixeles[i + 2]
    const a = pixeles[i + 3]
    if (a < 128) continue // transparente
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max < 40) continue // negro
    if (min > 215) continue // blanco
    if (max - min < 40) continue // gris: sin saturación
    // Los parecidos caen en la misma cubeta (16 niveles por canal): los bordes suavizados no compiten.
    const clave = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const c = cubetas.get(clave) ?? { n: 0, r: 0, g: 0, b: 0 }
    c.n++
    c.r += r
    c.g += g
    c.b += b
    cubetas.set(clave, c)
  }
  let mejor: { n: number; r: number; g: number; b: number } | undefined
  for (const c of cubetas.values()) if (!mejor || c.n > mejor.n) mejor = c
  return mejor ? rgbAHex([mejor.r / mejor.n, mejor.g / mejor.n, mejor.b / mejor.n]) : null
}
