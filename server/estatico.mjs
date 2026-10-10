/**
 * Servidor estático de ReciclaXP para Railway (sin dependencias).
 *
 * Sirve dos builds del mismo código desde `dist/`:
 * - la app general en la raíz (`dist/index.html`);
 * - el caso club bajo `/club/` (`dist/club/index.html`), el build con VITE_ESCENARIO=club.
 *
 * Las rutas de la app (sin extensión) caen en el index.html de su app, como en cualquier SPA.
 * Un archivo con extensión que no existe da 404: si después de publicar alguien pide un chunk
 * viejo, recibir HTML con 200 haría fallar el import con un error confuso.
 * Las llamadas a la API (/api, /club/api) caen en el HTML a propósito: la app lo detecta, entiende
 * que el simulador (MSW) no estaba activo y recarga una vez (src/services/api.ts).
 */
import { createReadStream, statSync } from 'node:fs'
import { extname, join, posix } from 'node:path'
import { createGzip } from 'node:zlib'

/** El orden importa: el prefijo más específico primero. */
export const APPS = [
  { prefijo: '/club/', carpeta: 'club' },
  { prefijo: '/', carpeta: '' },
]

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
}

const COMPRIMIBLE = /^(text\/|application\/(json|manifest\+json)|image\/svg)/

/**
 * Qué responder para una ruta pedida.
 * @param {string} pathname ruta de la URL, sin query
 * @param {(rel: string) => boolean} existe si un archivo existe, relativo a dist/
 * @returns {{archivo: string, fallback?: true} | {redirigir: string} | {estado: number}}
 */
export function resolverRuta(pathname, existe) {
  let ruta
  try {
    ruta = decodeURIComponent(pathname)
  } catch {
    return { estado: 400 }
  }
  if (ruta === '/club') return { redirigir: '/club/' }
  // normalize con la ruta anclada en «/» colapsa los «..»: no se puede salir de dist/.
  const limpia = posix.normalize(ruta.startsWith('/') ? ruta : `/${ruta}`)
  const app = APPS.find((a) => limpia.startsWith(a.prefijo)) ?? APPS[APPS.length - 1]
  const relativo = limpia.slice(1)
  if (relativo && !relativo.endsWith('/') && existe(relativo)) return { archivo: relativo }
  if (extname(relativo)) return { estado: 404 }
  return { archivo: posix.join(app.carpeta, 'index.html'), fallback: true }
}

/** Manejador HTTP que sirve `raiz` (la carpeta dist/). */
export function crearManejador(raiz) {
  const existe = (rel) => {
    try {
      return statSync(join(raiz, rel)).isFile()
    } catch {
      return false
    }
  }

  return (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' })
      res.end()
      return
    }
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
      res.end('ok')
      return
    }

    const r = resolverRuta(url.pathname, existe)
    if ('estado' in r) {
      res.writeHead(r.estado, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(r.estado === 404 ? 'No encontrado' : 'Pedido inválido')
      return
    }
    if ('redirigir' in r) {
      res.writeHead(301, { location: r.redirigir + url.search })
      res.end()
      return
    }

    const tipo = TIPOS[extname(r.archivo)] ?? 'application/octet-stream'
    const inmutable = !r.fallback && /(^|\/)assets\//.test(r.archivo)
    const headers = {
      'content-type': tipo,
      'cache-control': inmutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    }
    const comprimir = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '') && COMPRIMIBLE.test(tipo)
    if (comprimir) {
      headers['content-encoding'] = 'gzip'
      headers.vary = 'Accept-Encoding'
    }
    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    const flujo = createReadStream(join(raiz, r.archivo))
    flujo.on('error', () => res.destroy())
    ;(comprimir ? flujo.pipe(createGzip()) : flujo).pipe(res)
  }
}
