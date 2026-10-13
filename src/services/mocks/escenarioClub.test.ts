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

describe('el club de las demos es Talleres', () => {
  it('ninguna de las dos demos nombra a River, ni en los textos ni en los ids', () => {
    expect(JSON.stringify(datosGenerales)).not.toMatch(/river|monumental|millonario/i)
    expect(JSON.stringify(club)).not.toMatch(/river|monumental|millonario/i)
  })

  it('la demo general tiene a Talleres en la red, con su proyecto, su ranking y su premio', () => {
    const talleres = datosGenerales.sponsors.find((s) => s.name === 'Talleres')
    expect(talleres).toBeDefined()
    expect(datosGenerales.projects.some((p) => p.sponsorId === talleres!.id)).toBe(true)
    expect(datosGenerales.rankings.talleres).toBeDefined()
    expect(datosGenerales.prizes.talleres?.sponsorName).toBe('Talleres')
  })
})

describe('Talleres dice lo mismo en las dos demos', () => {
  // La demo general está en la dirección corta (reciclaxp.xnod.tech): si alguien del club entra
  // ahí, tiene que ver el mismo Talleres que en /club, no otro con máquinas y al 62 %.
  const enLaDelClub = datosDelClub(datosGenerales, { nombre: 'Talleres', estadio: 'Estadio', sede: 'Sede social' })
  const bancoGeneral = datosGenerales.projects.find((p) => p.sponsorId === 's_talleres')!
  const bancoDelClub = enLaDelClub.projects[0]
  const lo = (p: typeof bancoGeneral) => [p.title, p.goalUnits, p.collectedUnits, p.myContributionUnits, p.estimatedDate]

  it('el banco de suplentes tiene la misma meta, el mismo avance y la misma fecha', () => {
    expect(lo(bancoGeneral)).toEqual(lo(bancoDelClub))
  })

  it('el club, sus puntos y su traza son los del piloto: Punto R, sin máquinas ni sensores', () => {
    const talleres = datosGenerales.sponsors.find((s) => s.id === 's_talleres')!
    expect([talleres.greenScore, talleres.kgRecovered]).toEqual([enLaDelClub.sponsors[0].greenScore, enLaDelClub.sponsors[0].kgRecovered])
    const puntos = datosGenerales.points.filter((p) => p.sponsorId === 's_talleres')
    expect(puntos.map((p) => p.name)).toEqual(['Punto R · Estadio', 'Punto R · Sede social'])
    expect(JSON.stringify(datosGenerales.traceByProject[bancoGeneral.id])).not.toMatch(/IoT|Sensor|Máquina|máquina/)
  })

  it('el panel de Talleres calcula como el del club (sin métricas cargadas a mano que lo contradigan)', () => {
    expect(datosGenerales.sponsorMetrics.s_talleres).toBeUndefined()
  })

  it('el QR del estadio de Talleres conserva su id', () => {
    expect(datosGenerales.points.some((p) => p.id === 'p_talleres_estadio')).toBe(true)
  })
})

describe('la demo del club no muestra marcas reales como aliadas', () => {
  it('ninguna marca real de la demo general aparece en la del club, tampoco en la pestaña del ranking', () => {
    expect(JSON.stringify(club)).not.toMatch(/YPF|Coca-Cola|McDonald|Starbucks|Adidas|Grido/)
    expect(pestanasDelRanking('club').map((t) => t.label).join(' ')).not.toMatch(/YPF/)
  })

  it('los ids no cambian: los QR impresos y los enlaces siguen andando', () => {
    expect(club.points.some((p) => p.id === 'p_ypf_libertador')).toBe(true)
    expect(club.sponsors.find((s) => s.id === 's_ypf')?.name).toBe('Norte Energía')
  })

  it('la demo general no cambia', () => {
    expect(datosGenerales.sponsors.find((s) => s.id === 's_ypf')?.name).toBe('YPF')
  })
})

describe('la demo del club pasa en Córdoba', () => {
  const FUERA_DE_CORDOBA = /Vicente López|Palermo|Recoleta|Lanús|Pilar|CABA|Libertador|Cabildo|Panamericana/

  it('los puntos de la red, el historial, las métricas y los beneficios no quedan en Buenos Aires', () => {
    expect(club.points.every((p) => p.city === 'Córdoba')).toBe(true)
    const lugares = JSON.stringify([club.points, club.contributions, club.sponsorMetrics, club.benefits, club.sponsors])
    expect(lugares).not.toMatch(FUERA_DE_CORDOBA)
  })

  it('el historial del hincha es reciente y nombra puntos que existen en la demo', () => {
    const nombres = new Set(club.points.map((p) => p.name))
    for (const c of club.contributions) {
      expect(nombres.has(c.pointName)).toBe(true)
      expect(c.createdAt >= '2026-09-01').toBe(true)
    }
  })
})

describe('textos que la demo no puede sostener', () => {
  it('ningún dato de ejemplo promete «en vivo» ni «tiempo real»: la demo no tiene servidor', () => {
    expect(JSON.stringify(datosGenerales)).not.toMatch(/en vivo|tiempo real/i)
    expect(JSON.stringify(club)).not.toMatch(/en vivo|tiempo real/i)
  })

  it('no dice que los recicladores están certificados', () => {
    expect(JSON.stringify(datosGenerales.causes)).not.toMatch(/certificad/i)
    expect(JSON.stringify(club.causes)).not.toMatch(/certificad/i)
  })
})

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
    expect(club.rankings.talleres).toBeUndefined()
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
    expect(datosGenerales.sponsors.some((s) => s.slug === 'talleres')).toBe(true)
    // El orden de las pestañas sale de pestanasDelRanking; acá importa que estén las tres.
    expect(Object.keys(datosGenerales.rankings).sort()).toEqual(['global', 'talleres', 'ypf'])
  })
})

describe('los rankings no se contradicen entre pestañas', () => {
  // La auditoría del 12/10: en «Hinchada», Facu R. tenía 6.240 XP, más que el n.º 1 del global (4.820), y en el global
  // no aparecía; y Camila sumaba más XP en las pestañas que en el global.
  for (const [demo, datos, pestana] of [
    ['club', club, 'club'],
    ['general', datosGenerales, 'talleres'],
  ] as const) {
    it(`${demo}: quien está en la hinchada está en el global con los mismos XP, si le alcanza para el top`, () => {
      const global = datos.rankings.global
      const ultimoDelTop = global[global.length - 1].xpThisMonth
      for (const e of datos.rankings[pestana]) {
        if (e.isCurrentUser || e.xpThisMonth < ultimoDelTop) continue
        expect(global.find((g) => g.userId === e.userId)?.xpThisMonth, `${demo}: ${e.name}`).toBe(e.xpThisMonth)
      }
    })

    it(`${demo}: el global está ordenado, numerado y con Camila una sola vez`, () => {
      const global = datos.rankings.global
      expect(global.map((e) => e.position)).toEqual(global.map((_, i) => i + 1))
      expect([...global].sort((a, b) => b.xpThisMonth - a.xpThisMonth)).toEqual(global)
      expect(global.filter((e) => e.isCurrentUser)).toHaveLength(1)
    })

    it(`${demo}: lo que Camila suma en cada pestaña no pasa su global`, () => {
      const xpDeCamila = (scope: string) => datos.rankings[scope]?.find((e) => e.isCurrentUser)?.xpThisMonth ?? 0
      const enLasPestanas = Object.keys(datos.rankings)
        .filter((s) => s !== 'global')
        .reduce((t, s) => t + xpDeCamila(s), 0)
      expect(enLasPestanas).toBeLessThanOrEqual(xpDeCamila('global'))
    })
  }
})
