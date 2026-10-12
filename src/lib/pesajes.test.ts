import { describe, expect, it } from 'vitest'
import type { RecyclePoint, TraceEvent } from '@/types'
import { estadoDelRecorrido } from './recorridoDeLaTapita'
import { conPesajeEnLaTraza, crearPesaje, kilosValidos, leerKilos, pesajesDelInforme, type Pesaje } from './pesajes'

const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', lat: 0, lng: 0,
  acceptedMaterials: ['tapitas'], openNow: true,
})
const estadio = punto('p_club_estadio', 'Punto R · Estadio')
const sede = punto('p_club_sede', 'Punto R · Sede social')

const pesaje = (id: string, fecha: string, p: RecyclePoint, kilos: number, creadoEn = `${fecha}T22:00:00.000Z`): Pesaje =>
  crearPesaje({ id, partido: `Partido ${id}`, fecha, punto: p, kilos, creadoEn })

const traza: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '50 tapitas en Punto R · Estadio.', date: '2026-10-12', done: true },
  { stage: 'validacion', title: 'Pesaje del lote', detail: 'Al cierre de cada partido…', date: null, done: false, operator: 'Talleres' },
  { stage: 'lote', title: 'Lote del partido', detail: '', date: null, done: false },
  { stage: 'retiro', title: 'Retiro', detail: '', date: null, done: false },
]

describe('crearPesaje', () => {
  it('guarda el partido, la fecha, el Punto R y los kilos, y cuenta las tapitas con la misma cuenta del panel', () => {
    const p = crearPesaje({ id: 'ps1', partido: '  Talleres vs. Belgrano ', fecha: '2026-10-12', punto: estadio, kilos: 12.5, creadoEn: 'x' })
    expect(p).toEqual({
      id: 'ps1', partido: 'Talleres vs. Belgrano', fecha: '2026-10-12', puntoId: 'p_club_estadio',
      puntoNombre: 'Punto R · Estadio', kilos: 12.5, tapitas: 2975, creadoEn: 'x',
    })
  })
})

describe('kilosValidos', () => {
  it('acepta un peso razonable de un partido y rechaza cero, negativos, vacíos y exagerados', () => {
    expect(kilosValidos(12.5)).toBe(true)
    expect(kilosValidos(0.1)).toBe(true)
    for (const k of [0, -3, Number.NaN, 5001]) expect(kilosValidos(k)).toBe(false)
  })
})

describe('pesajesDelInforme', () => {
  it('ordena del partido más nuevo al más viejo; en el mismo día, el último cargado primero', () => {
    const a = pesaje('a', '2026-10-05', estadio, 10)
    const b = pesaje('b', '2026-10-12', estadio, 12, '2026-10-12T20:00:00.000Z')
    const c = pesaje('c', '2026-10-12', sede, 3, '2026-10-12T21:00:00.000Z')
    expect(pesajesDelInforme([a, b, c]).map((p) => p.id)).toEqual(['c', 'b', 'a'])
  })
})

describe('conPesajeEnLaTraza', () => {
  it('sin un pesaje en los puntos del producto, el recorrido no cambia', () => {
    expect(conPesajeEnLaTraza(traza, [pesaje('s', '2026-10-12', sede, 3)], ['p_club_estadio'], 'Talleres')).toBe(traza)
  })

  it('con un pesaje en su punto, «Pesaje del lote» queda hecho con la fecha y los kilos, y lo que sigue es el lote', () => {
    const eventos = conPesajeEnLaTraza(traza, [pesaje('e', '2026-10-12', estadio, 12.5)], ['p_club_estadio'], 'Talleres')
    expect(eventos[1]).toMatchObject({ done: true, date: '2026-10-12', operator: 'Talleres' })
    expect(eventos[1].detail).toBe('Talleres pesó 12,5 kg en el Punto R · Estadio (Partido e).')
    expect(estadoDelRecorrido(eventos)).toMatchObject({ actual: 1, siguiente: 2 })
    // No toca el resto ni el original.
    expect(eventos[2]).toBe(traza[2])
    expect(traza[1].done).toBe(false)
  })

  it('con varios, muestra el más nuevo', () => {
    const eventos = conPesajeEnLaTraza(
      traza,
      [pesaje('viejo', '2026-10-05', estadio, 10), pesaje('nuevo', '2026-10-12', estadio, 14)],
      ['p_club_estadio'],
      'Talleres',
    )
    expect(eventos[1].detail).toContain('14 kg')
    expect(eventos[1].date).toBe('2026-10-12')
  })

  // La revisión del 12/10: el pesaje avanzaba «tu tapita» en un producto al que no aportaste, o en otro punto.
  it('si tu tapita todavía no entró a este recorrido, un pesaje no la hace avanzar', () => {
    const sinAporte = traza.map((e) => (e.stage === 'aporte' ? { ...e, done: false, date: null } : e))
    expect(conPesajeEnLaTraza(sinAporte, [pesaje('e', '2026-10-12', estadio, 12.5)], ['p_club_estadio'], 'Talleres')).toBe(sinAporte)
  })

  it('con tu aporte de la sesión, sólo cuenta el pesaje de ese Punto R', () => {
    const tuTapita = { puntoId: 'p_club_sede', fecha: '2026-10-12' }
    const enOtroPunto = [pesaje('e', '2026-10-12', estadio, 12.5)]
    expect(conPesajeEnLaTraza(traza, enOtroPunto, ['p_club_estadio', 'p_club_sede'], 'Talleres', tuTapita)).toBe(traza)
    const enElTuyo = [pesaje('s', '2026-10-12', sede, 3)]
    expect(conPesajeEnLaTraza(traza, enElTuyo, ['p_club_estadio', 'p_club_sede'], 'Talleres', tuTapita)[1].done).toBe(true)
  })

  it('con tu aporte de la sesión, un pesaje de antes de tu aporte no lo pesó', () => {
    const tuTapita = { puntoId: 'p_club_estadio', fecha: '2026-10-12' }
    expect(conPesajeEnLaTraza(traza, [pesaje('v', '2026-10-05', estadio, 10)], ['p_club_estadio'], 'Talleres', tuTapita)).toBe(traza)
    expect(conPesajeEnLaTraza(traza, [pesaje('h', '2026-10-12', estadio, 10)], ['p_club_estadio'], 'Talleres', tuTapita)[1].done).toBe(true)
  })
})

describe('leerKilos', () => {
  it('acepta la coma decimal y el punto de miles, como se escribe acá', () => {
    expect(leerKilos('12,5')).toBe(12.5)
    expect(leerKilos('1.250')).toBe(1250)
    expect(leerKilos('1.250,5')).toBe(1250.5)
    expect(leerKilos('12.5')).toBe(12.5)
    expect(leerKilos(' 30 ')).toBe(30)
    expect(Number.isNaN(leerKilos('doce'))).toBe(true)
  })
})
