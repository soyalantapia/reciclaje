import { describe, expect, it } from 'vitest'
import { claveDeAlmacenamiento, leerEscenario } from './escenario'

describe('leerEscenario', () => {
  it('sólo "club" activa el escenario del club', () => {
    expect(leerEscenario('club')).toBe('club')
    expect(leerEscenario(undefined)).toBe('general')
    expect(leerEscenario('')).toBe('general')
    expect(leerEscenario('CLUB')).toBe('general')
  })
})

describe('claveDeAlmacenamiento', () => {
  it('la demo general conserva las claves de siempre (no pierde el estado guardado)', () => {
    expect(claveDeAlmacenamiento('activity', 'general')).toBe('reciclaxp-activity')
    expect(claveDeAlmacenamiento('scan-point', 'general')).toBe('reciclaxp-scan-point')
  })

  it('el escenario club guarda aparte, para no pisar a la demo publicada', () => {
    expect(claveDeAlmacenamiento('activity', 'club')).toBe('reciclaxp-club-activity')
    expect(claveDeAlmacenamiento('activity', 'club')).not.toBe(claveDeAlmacenamiento('activity', 'general'))
  })
})
