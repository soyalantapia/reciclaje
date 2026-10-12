import { describe, expect, it } from 'vitest'
import { colorDeLaAppDelHincha } from '@/hooks/usePaletaDelClub'
import { AZUL_DE_TALLERES, escudoDeLaAppDelHincha, esTalleres, marcaOficial, rubroDe } from './logos'

describe('los logos de la demo', () => {
  it('Talleres, en cualquiera de las dos demos, trae su escudo oficial y su azul', () => {
    for (const id of ['s_club', 's_talleres']) {
      const m = marcaOficial({ id, name: 'Talleres' })
      expect(m?.escudo).toMatch(/clubes\/talleres\/escudo\.svg$/)
      expect(m?.color).toBe(AZUL_DE_TALLERES)
    }
  })

  it('otra institución, o la demo armada para otro club, no lleva el escudo de Talleres', () => {
    expect(marcaOficial({ id: 's_club', name: 'Belgrano' })).toBeNull()
    expect(marcaOficial({ id: 's_muni', name: 'Talleres' })).toBeNull()
    expect(esTalleres(' talleres ')).toBe(true)
  })

  it('cada empresa de la red tiene su rubro para el ícono; una desconocida es un comercio', () => {
    expect(rubroDe('s_ypf')).toBe('combustible')
    expect(rubroDe('s_grido')).toBe('helado')
    expect(rubroDe('s_nueva')).toBe('comercio')
  })

  it('la app del hincha toma el azul y el escudo sólo en la demo del club de Talleres', () => {
    expect(colorDeLaAppDelHincha('club', 'Talleres')).toBe(AZUL_DE_TALLERES)
    expect(escudoDeLaAppDelHincha('club', 'Talleres')).toMatch(/escudo\.svg$/)
    expect(colorDeLaAppDelHincha('general', 'Talleres')).toBeUndefined()
    expect(escudoDeLaAppDelHincha('general', 'Talleres')).toBeUndefined()
    expect(colorDeLaAppDelHincha('club', 'Belgrano')).toBeUndefined()
  })
})
