import { colorDominante } from './marca'

/** El escudo más pesado que se acepta. */
export const ESCUDO_TOPE_BYTES = 2 * 1024 * 1024
/** El lado más largo del escudo guardado: alcanza para el menú, el encabezado y el PDF. */
const LADO = 256
const TIPOS = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

/** Un escudo que no se puede usar, con un mensaje para quien lo subió. */
export class EscudoInvalido extends Error {}

/**
 * Lee el escudo que sube el club, lo achica a 256 px de lado (un SVG se dibuja a ese tamaño) y toma
 * su color. Devuelve el escudo como data URL PNG, para guardarlo en el navegador. Sólo corre en el
 * navegador: usa canvas.
 */
export async function prepararEscudo(archivo: File): Promise<{ escudo: string; color: string | null }> {
  if (!TIPOS.includes(archivo.type)) throw new EscudoInvalido('El escudo tiene que ser una imagen PNG, JPG, SVG o WebP.')
  if (archivo.size > ESCUDO_TOPE_BYTES) throw new EscudoInvalido('El escudo pesa más de 2 MB: probá con uno más liviano.')
  const url = URL.createObjectURL(archivo)
  try {
    const img = await cargarImagen(url)
    const ancho = img.naturalWidth || LADO
    const alto = img.naturalHeight || LADO
    // Una imagen de píxeles no se agranda (se vería borrosa); un SVG sí, porque no pierde.
    const escala = archivo.type === 'image/svg+xml' ? LADO / Math.max(ancho, alto) : Math.min(1, LADO / Math.max(ancho, alto))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(ancho * escala))
    canvas.height = Math.max(1, Math.round(alto * escala))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new EscudoInvalido('Este navegador no pudo leer la imagen.')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const color = colorDominante(ctx.getImageData(0, 0, canvas.width, canvas.height).data)
    return { escudo: canvas.toDataURL('image/png'), color }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new EscudoInvalido('No se pudo abrir la imagen del escudo.'))
    img.src = src
  })
}
