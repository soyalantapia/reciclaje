// @vitest-environment node
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { request } from 'node:http'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { appsSinPublicar, crearManejador, resolverRuta } from './estatico.mjs'

const ARCHIVOS = new Set(['index.html', 'assets/index-abc.js', 'mockServiceWorker.js', 'club/index.html', 'club/assets/index-def.js'])
const existe = (rel) => ARCHIVOS.has(rel)

describe('resolverRuta', () => {
  it('la raíz y las rutas de la app general caen en su index.html', () => {
    expect(resolverRuta('/', existe)).toEqual({ archivo: 'index.html', fallback: true })
    expect(resolverRuta('/ranking', existe)).toEqual({ archivo: 'index.html', fallback: true })
  })

  it('el caso club vive bajo /club/ con su propio index.html', () => {
    expect(resolverRuta('/club', existe)).toEqual({ redirigir: '/club/' })
    expect(resolverRuta('/club/', existe)).toEqual({ archivo: 'club/index.html', fallback: true })
    expect(resolverRuta('/club/ranking', existe)).toEqual({ archivo: 'club/index.html', fallback: true })
  })

  it('un archivo que existe se sirve tal cual', () => {
    expect(resolverRuta('/assets/index-abc.js', existe)).toEqual({ archivo: 'assets/index-abc.js' })
    expect(resolverRuta('/club/assets/index-def.js', existe)).toEqual({ archivo: 'club/assets/index-def.js' })
  })

  it('un archivo que no existe da 404, no el HTML (un chunk viejo no se tiene que leer como JS)', () => {
    expect(resolverRuta('/assets/index-viejo.js', existe)).toEqual({ estado: 404 })
  })

  it('una llamada a la API sin el simulador activo devuelve el HTML, para que la app se recupere sola', () => {
    expect(resolverRuta('/club/api/ranking', existe)).toEqual({ archivo: 'club/index.html', fallback: true })
  })

  it('no deja salir de la carpeta publicada', () => {
    for (const ruta of ['/../../etc/passwd', '/%2e%2e/%2e%2e/etc/passwd', '/club/../../secreto.txt']) {
      const r = resolverRuta(ruta, existe)
      if (r.archivo) expect(r.archivo.startsWith('..')).toBe(false)
    }
    expect(resolverRuta('/%E0%A4%A', existe)).toEqual({ estado: 400 })
  })
})

describe('crearManejador', () => {
  let servidor
  let base
  beforeAll(async () => {
    const raiz = mkdtempSync(join(tmpdir(), 'reciclaxp-estatico-'))
    mkdirSync(join(raiz, 'assets'), { recursive: true })
    mkdirSync(join(raiz, 'club', 'assets'), { recursive: true })
    writeFileSync(join(raiz, 'index.html'), '<!doctype html><title>general</title>')
    writeFileSync(join(raiz, 'assets', 'index-abc.js'), 'console.log(1)')
    writeFileSync(join(raiz, 'club', 'index.html'), '<!doctype html><title>club</title>')
    servidor = createServer(crearManejador(raiz))
    await new Promise((ok) => servidor.listen(0, ok))
    base = `http://127.0.0.1:${servidor.address().port}`
  })
  afterAll(() => new Promise((ok) => servidor.close(ok)))

  const pedir = (ruta, headers = {}) =>
    new Promise((ok, mal) => {
      const req = request(base + ruta, { headers }, (res) => {
        let cuerpo = ''
        res.on('data', (c) => (cuerpo += c))
        res.on('end', () => ok({ estado: res.statusCode, headers: res.headers, cuerpo }))
      })
      req.on('error', mal)
      req.end()
    })

  it('responde el chequeo de salud', async () => {
    const r = await pedir('/healthz')
    expect(r.estado).toBe(200)
    expect(r.cuerpo).toBe('ok')
  })

  it('sirve cada app con su index.html y sin caché', async () => {
    const general = await pedir('/escanear')
    expect(general.cuerpo).toContain('general')
    expect(general.headers['cache-control']).toBe('no-cache')
    const club = await pedir('/club/ranking')
    expect(club.cuerpo).toContain('club')
  })

  it('los archivos con hash van con caché larga', async () => {
    const r = await pedir('/assets/index-abc.js')
    expect(r.estado).toBe(200)
    expect(r.headers['content-type']).toContain('javascript')
    expect(r.headers['cache-control']).toContain('immutable')
  })

  it('redirige /club a /club/ y da 404 a un archivo que no existe', async () => {
    const r = await pedir('/club?x=1')
    expect(r.estado).toBe(301)
    expect(r.headers.location).toBe('/club/?x=1')
    expect((await pedir('/assets/no-existe.js')).estado).toBe(404)
  })

  it('comprime cuando el navegador lo acepta', async () => {
    const r = await pedir('/assets/index-abc.js', { 'accept-encoding': 'gzip' })
    expect(r.headers['content-encoding']).toBe('gzip')
  })
})

describe('cuando falta el build de una app', () => {
  let servidor
  let base
  let raiz
  beforeAll(async () => {
    raiz = mkdtempSync(join(tmpdir(), 'reciclaxp-incompleto-'))
    writeFileSync(join(raiz, 'index.html'), '<!doctype html><title>general</title>')
    servidor = createServer(crearManejador(raiz))
    await new Promise((ok) => servidor.listen(0, ok))
    base = `http://127.0.0.1:${servidor.address().port}`
  })
  afterAll(() => new Promise((ok) => servidor.close(ok)))

  it('appsSinPublicar nombra el index.html que falta, para que el servidor no arranque a medias', () => {
    expect(appsSinPublicar(raiz)).toEqual(['club/index.html'])
  })

  it('appsSinPublicar no nombra nada cuando las dos apps están', () => {
    const completa = mkdtempSync(join(tmpdir(), 'reciclaxp-completo-'))
    mkdirSync(join(completa, 'club'))
    writeFileSync(join(completa, 'index.html'), 'g')
    writeFileSync(join(completa, 'club', 'index.html'), 'c')
    expect(appsSinPublicar(completa)).toEqual([])
  })

  it('una ruta del club sin su build da 503 con un texto, no una conexión cortada', async () => {
    const r = await new Promise((ok, mal) => {
      const req = request(`${base}/club/ranking`, (res) => {
        let cuerpo = ''
        res.on('data', (c) => (cuerpo += c))
        res.on('end', () => ok({ estado: res.statusCode, cuerpo }))
      })
      req.on('error', mal)
      req.end()
    })
    expect(r.estado).toBe(503)
    expect(r.cuerpo).toContain('no está publicada')
  })
})
