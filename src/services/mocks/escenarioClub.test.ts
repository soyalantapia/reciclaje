import { describe, expect, it } from 'vitest'
import { datosGenerales } from './datos'
import { datosDelClub } from './escenarioClub'
import { metricsFor } from '@/lib/metrics'
import { pestanasDelRanking } from '@/lib/escenario'

const CLUB = { nombre: 'Club de Prueba', estadio: 'Estadio Prueba', sede: 'Sede Prueba' }
const club = datosDelClub(datosGenerales, CLUB)
const ID_CLUB = club.sponsors[0].id

// La demo se muestra el 13/10/2026: ninguna fecha estimada puede estar vencida.
const DIA_DE_LA_REUNION = '2026-10-13'

describe('escenario club', () => {
  it('cada pestaña del ranking tiene su ranking y su sede es un sponsor que existe, en los dos escenarios', () => {
    const escenarios = [['club', club], ['general', datosGenerales]] as const
    for (const [escenario, datos] of escenarios) {
      for (const pestana of pestanasDelRanking(escenario)) {
        expect(datos.rankings[pestana.value], `${escenario}/${pestana.value}`).toBeDefined()
        if (pestana.sponsorId) expect(datos.sponsors.map((s) => s.id), `${escenario}/${pestana.value}`).toContain(pestana.sponsorId)
      }
    }
  })

  it('no muestra a otro club real', () => {
    expect(JSON.stringify(club)).not.toMatch(/river|monumental|millonario/i)
  })

  it('el club es el primer sponsor y su producto es el destacado', () => {
    expect(club.sponsors[0]).toMatchObject({ name: CLUB.nombre, category: 'club' })
    expect(club.projects[0].sponsorId).toBe(ID_CLUB)
    expect(club.projects[0].sponsorName).toBe(CLUB.nombre)
  })

  it('los puntos del club se llaman Punto R', () => {
    const puntos = club.points.filter((p) => p.sponsorId === ID_CLUB)
    expect(puntos.length).toBeGreaterThanOrEqual(2)
    for (const p of puntos) expect(p.name.startsWith('Punto R')).toBe(true)
    expect(puntos.map((p) => p.name).join(' ')).toContain(CLUB.estadio)
  })

  it('tiene ranking de la hinchada con el premio-experiencia del club', () => {
    expect(club.rankings.club.length).toBeGreaterThan(0)
    expect(club.rankings.club.filter((e) => e.isCurrentUser)).toHaveLength(1)
    expect(club.prizes.club.sponsorId).toBe(ID_CLUB)
    expect(club.rankings.river).toBeUndefined()
  })

  it('carga recompensas del club: entrada, camiseta y experiencia', () => {
    const categorias = club.benefits.filter((b) => b.sponsorId === ID_CLUB).map((b) => b.category)
    expect(categorias).toEqual(expect.arrayContaining(['entrada', 'merch', 'experiencia']))
  })

  it('la trazabilidad del producto del club no afirma que una máquina pesó', () => {
    const traza = club.traceByProject[club.projects[0].id]
    expect(traza.length).toBeGreaterThan(0)
    expect(JSON.stringify(traza)).not.toMatch(/máquina pesó|sensor/i)
  })

  it('el aporte propio nunca supera lo juntado, ni lo juntado a la meta', () => {
    for (const p of club.projects) {
      expect(p.myContributionUnits).toBeLessThanOrEqual(p.collectedUnits)
      expect(p.collectedUnits).toBeLessThanOrEqual(p.goalUnits)
    }
  })

  it('el producto y el panel del club dicen las mismas tapitas juntadas', () => {
    const sponsor = club.sponsors[0]
    const panel = metricsFor(sponsor, club.points)
    expect(club.projects[0].collectedUnits).toBe(panel.capsRecovered)
  })

  it('cada aporte del historial apunta a un punto que existe', () => {
    const ids = new Set(club.points.map((p) => p.id))
    for (const c of club.contributions) expect(ids.has(c.pointId)).toBe(true)
  })
})

describe('fechas estimadas', () => {
  it.each([
    ['general', datosGenerales],
    ['club', club],
  ])('ninguna está vencida el día de la reunión (%s)', (_nombre, datos) => {
    for (const p of datos.projects) expect(p.estimatedDate > DIA_DE_LA_REUNION).toBe(true)
  })
})

describe('demo general', () => {
  it('queda igual: sigue teniendo su club de ejemplo y sus pestañas de ranking', () => {
    expect(datosGenerales.sponsors.some((s) => s.slug === 'river')).toBe(true)
    expect(Object.keys(datosGenerales.rankings)).toEqual(['global', 'river', 'ypf'])
  })
})
