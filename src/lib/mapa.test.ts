import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint } from '@/types'
import {
  CENTRO_DE_CORDOBA, CENTRO_Y_NUEVA_CORDOBA, distanciaKm, enlaceComoLlegar, estaEnCordoba, filtrarPuntos, materialesDeLaRed, ordenarPuntos,
  prefiereMenosMovimiento, recuadroDe, teselasDelMapa, textoDeDistancia,
} from './mapa'

const PLAZA_SAN_MARTIN = { lat: -31.416736, lng: -64.183581 }
const PLAZA_ESPANA = { lat: -31.428564, lng: -64.184875 }
const KEMPES = { lat: -31.368847, lng: -64.246145 }

const punto = (id: string, lugar: { lat: number; lng: number }, abierto: boolean, materiales: RecyclePoint['acceptedMaterials']): RecyclePoint => ({
  id, name: id, sponsorId: 's', type: 'deposito', address: '', city: 'Córdoba', ...lugar, acceptedMaterials: materiales, openNow: abierto,
})
const cerca = punto('cerca', PLAZA_ESPANA, false, ['tapitas'])
const centro = punto('centro', PLAZA_SAN_MARTIN, true, ['tapitas', 'vidrio'])
const lejos = punto('lejos', KEMPES, true, ['plastico'])

describe('distanciaKm', () => {
  it('de la Plaza San Martín a la Plaza España hay 1,3 km, y al Kempes 8 km', () => {
    expect(distanciaKm(PLAZA_SAN_MARTIN, PLAZA_ESPANA)).toBeCloseTo(1.32, 1)
    expect(distanciaKm(PLAZA_SAN_MARTIN, KEMPES)).toBeCloseTo(7.98, 0)
    expect(distanciaKm(PLAZA_ESPANA, PLAZA_ESPANA)).toBe(0)
  })
})

describe('textoDeDistancia', () => {
  it('en metros redondeados a la decena por debajo del kilómetro, y en kilómetros con una decimal', () => {
    expect(textoDeDistancia(0.347)).toBe('a 350 m')
    expect(textoDeDistancia(0.004)).toBe('a 10 m')
    expect(textoDeDistancia(1.234)).toBe('a 1,2 km')
    expect(textoDeDistancia(12)).toBe('a 12,0 km')
  })

  it('redondea a la decena para los dos lados, y casi un kilómetro ya se escribe en kilómetros', () => {
    expect(textoDeDistancia(0.342)).toBe('a 340 m')
    expect(textoDeDistancia(0.998)).toBe('a 1,0 km')
    expect(textoDeDistancia(1)).toBe('a 1,0 km')
  })
})

describe('filtrarPuntos y materialesDeLaRed', () => {
  it('«Abiertos» deja los abiertos; un material deja los que lo reciben; juntos, los dos', () => {
    const todos = [cerca, centro, lejos]
    expect(filtrarPuntos(todos, { abiertos: false, material: null })).toEqual(todos)
    expect(filtrarPuntos(todos, { abiertos: true, material: null }).map((p) => p.id)).toEqual(['centro', 'lejos'])
    expect(filtrarPuntos(todos, { abiertos: false, material: 'tapitas' }).map((p) => p.id)).toEqual(['cerca', 'centro'])
    expect(filtrarPuntos(todos, { abiertos: true, material: 'tapitas' }).map((p) => p.id)).toEqual(['centro'])
    // Un material que no es el primero del punto también cuenta.
    expect(filtrarPuntos(todos, { abiertos: false, material: 'vidrio' }).map((p) => p.id)).toEqual(['centro'])
  })

  it('los materiales de la red salen sin repetir, en el orden en que aparecen', () => {
    expect(materialesDeLaRed([cerca, centro, lejos])).toEqual(['tapitas', 'vidrio', 'plastico'])
  })
})

describe('ordenarPuntos', () => {
  it('sin ubicación, primero los abiertos', () => {
    expect(ordenarPuntos([cerca, centro, lejos]).map((p) => p.id)).toEqual(['centro', 'lejos', 'cerca'])
  })

  it('con ubicación, primero los abiertos y, entre ellos, del más cercano al más lejano', () => {
    expect(ordenarPuntos([lejos, cerca, centro], PLAZA_ESPANA).map((p) => p.id)).toEqual(['centro', 'lejos', 'cerca'])
  })

  it('no cambia la lista que recibe', () => {
    const lista = [cerca, centro]
    ordenarPuntos(lista)
    expect(lista.map((p) => p.id)).toEqual(['cerca', 'centro'])
  })
})

describe('enlaceComoLlegar, estaEnCordoba y recuadroDe', () => {
  it('«Cómo llegar» abre Google Maps con el destino', () => {
    expect(enlaceComoLlegar(PLAZA_ESPANA)).toBe('https://www.google.com/maps/dir/?api=1&destination=-31.428564,-64.184875')
  })

  it('Córdoba capital está en Córdoba; Buenos Aires, no', () => {
    expect(estaEnCordoba(KEMPES)).toBe(true)
    expect(estaEnCordoba(CENTRO_DE_CORDOBA)).toBe(true)
    expect(estaEnCordoba({ lat: -34.603722, lng: -58.381592 })).toBe(false)
    // El radio de 50 km: Alta Gracia (35 km) sí, Río Cuarto (190 km) no.
    expect(estaEnCordoba({ lat: -31.6529, lng: -64.4282 })).toBe(true)
    expect(estaEnCordoba({ lat: -33.1232, lng: -64.3493 })).toBe(false)
  })

  it('el mapa abre en un recuadro bien orientado que contiene la Plaza San Martín', () => {
    const [[sur, oeste], [norte, este]] = CENTRO_Y_NUEVA_CORDOBA
    expect(sur).toBeLessThan(norte)
    expect(oeste).toBeLessThan(este)
    expect(PLAZA_SAN_MARTIN.lat).toBeGreaterThan(sur)
    expect(PLAZA_SAN_MARTIN.lat).toBeLessThan(norte)
    expect(PLAZA_SAN_MARTIN.lng).toBeGreaterThan(oeste)
    expect(PLAZA_SAN_MARTIN.lng).toBeLessThan(este)
  })

  it('el recuadro encierra todos los lugares; sin lugares no hay recuadro', () => {
    expect(recuadroDe([PLAZA_ESPANA, KEMPES, PLAZA_SAN_MARTIN])).toEqual([[-31.428564, -64.246145], [-31.368847, -64.183581]])
    expect(recuadroDe([])).toBeNull()
  })
})

describe('prefiereMenosMovimiento', () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia
  })

  it('en un navegador sin matchMedia (jsdom no lo trae) no supone nada: el movimiento sigue', () => {
    expect(window.matchMedia).toBeUndefined()
    expect(prefiereMenosMovimiento()).toBe(false)
  })

  it('lee «prefers-reduced-motion: reduce» del sistema cada vez que se le pregunta, no una sola', () => {
    let reducir = true
    const matchMedia = vi.fn((consulta: string) => ({ matches: reducir, media: consulta }))
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia })

    expect(prefiereMenosMovimiento()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    // La persona puede cambiarlo con la pantalla abierta: el próximo toque ya lo ve.
    reducir = false
    expect(prefiereMenosMovimiento()).toBe(false)
  })
})

describe('teselasDelMapa', () => {
  it('sin configurar, usa las de OpenStreetMap con su atribución obligatoria', () => {
    const t = teselasDelMapa(undefined, undefined)
    expect(t.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    expect(t.atribucion).toContain('https://www.openstreetmap.org/copyright')
  })

  it('para el piloto, el proveedor se cambia con variables de entorno, sin tocar código', () => {
    const t = teselasDelMapa(' https://tiles.ejemplo.com/{z}/{x}/{y}.png?key=abc ', '&copy; Ejemplo')
    expect(t).toEqual({ url: 'https://tiles.ejemplo.com/{z}/{x}/{y}.png?key=abc', atribucion: '&copy; Ejemplo' })
  })

  it('una URL sin {z}, {x} e {y} no sirve: vuelve a OpenStreetMap', () => {
    expect(teselasDelMapa('https://tiles.ejemplo.com/mapa.png', '&copy; Ejemplo').url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
  })

  it('un proveedor propio sin atribución igual cita a OpenStreetMap, que es de donde salen los datos', () => {
    expect(teselasDelMapa('https://tiles.ejemplo.com/{z}/{x}/{y}.png', '').atribucion).toContain('OpenStreetMap')
  })
})
