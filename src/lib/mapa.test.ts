import { describe, expect, it } from 'vitest'
import type { RecyclePoint } from '@/types'
import {
  CENTRO_DE_CORDOBA, distanciaKm, enlaceComoLlegar, estaEnCordoba, filtrarPuntos, materialesDeLaRed, ordenarPuntos,
  recuadroDe, textoDeDistancia,
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
})

describe('filtrarPuntos y materialesDeLaRed', () => {
  it('«Abiertos ahora» deja los abiertos; un material deja los que lo reciben; juntos, los dos', () => {
    const todos = [cerca, centro, lejos]
    expect(filtrarPuntos(todos, { abiertos: false, material: null })).toEqual(todos)
    expect(filtrarPuntos(todos, { abiertos: true, material: null }).map((p) => p.id)).toEqual(['centro', 'lejos'])
    expect(filtrarPuntos(todos, { abiertos: false, material: 'tapitas' }).map((p) => p.id)).toEqual(['cerca', 'centro'])
    expect(filtrarPuntos(todos, { abiertos: true, material: 'tapitas' }).map((p) => p.id)).toEqual(['centro'])
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
  })

  it('el recuadro encierra todos los lugares; sin lugares no hay recuadro', () => {
    expect(recuadroDe([PLAZA_ESPANA, KEMPES, PLAZA_SAN_MARTIN])).toEqual([[-31.428564, -64.246145], [-31.368847, -64.183581]])
    expect(recuadroDe([])).toBeNull()
  })
})
