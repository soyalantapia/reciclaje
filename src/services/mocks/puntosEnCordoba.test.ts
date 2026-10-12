import { describe, expect, it } from 'vitest'
import { datosGenerales } from './datos'
import { datosDelClub } from './escenarioClub'
import { VERSION_DE_LOS_DATOS } from '@/store/versionDeDatos'

const club = datosDelClub(datosGenerales, { nombre: 'Talleres', estadio: 'Estadio', sede: 'Sede social' })
// Córdoba capital, con margen: el Kempes queda adentro, Buenos Aires y los pueblos de la provincia no.
const enCordoba = (p: { lat: number; lng: number }) => p.lat > -31.5 && p.lat < -31.3 && p.lng > -64.3 && p.lng < -64.1
const BUENOS_AIRES = /Palermo|Recoleta|Libertador|Cabildo|Panamericana|Lanús|Vicente López|Pilar|CABA|Plaza Mitre/

const UBICACIONES: Record<string, [number, number]> = {
  p_ypf_libertador: [-31.41847, -64.176348],
  p_ypf_cabildo: [-31.422153, -64.189875],
  p_ypf_pana: [-31.409436, -64.184583],
  p_muni_plaza: [-31.417111, -64.19123],
  p_lumen_palermo: [-31.430756, -64.187332],
  p_mcdonalds_palermo: [-31.428794, -64.190979],
  p_starbucks_recoleta: [-31.423175, -64.18696],
  p_grido_lanus: [-31.420568, -64.187765],
  p_club_estadio: [-31.368847, -64.246145],
  p_club_sede: [-31.415995, -64.183657],
}

// Nombre en la demo general y dirección de cada punto: la tabla del diseño, una fila por id.
const NOMBRE_Y_DIRECCION: Record<string, [string, string]> = {
  p_ypf_libertador: ['YPF Bv. Perón', 'Bv. Perón, Centro'],
  p_ypf_cabildo: ['YPF San Luis', 'San Luis, Güemes'],
  p_ypf_pana: ['YPF Humberto Primo', 'Humberto Primo, Centro'],
  p_muni_plaza: ['Punto Verde Plaza de la Intendencia', 'Plaza de la Intendencia, Centro'],
  p_lumen_palermo: ['Café Lúmen Nueva Córdoba', 'Ituzaingó 1202, Nueva Córdoba'],
  p_mcdonalds_palermo: ["McDonald's Nueva Córdoba", 'Obispo Trejo 1154, Nueva Córdoba'],
  p_starbucks_recoleta: ['Starbucks Nueva Córdoba', 'San Lorenzo 25, Nueva Córdoba'],
  p_grido_lanus: ['Grido Bv. San Juan', 'Bv. San Juan 125, Nueva Córdoba'],
  p_club_estadio: ['Punto R · Estadio', 'Estadio Mario Alberto Kempes, ingreso principal en días de partido'],
  // Sin número de calle: el de la sede sale de una sola fuente pública, débil. Se agrega cuando el club lo confirme.
  p_club_sede: ['Punto R · Sede social', 'Frente a la Plaza San Martín, Centro'],
}

// En la demo general el club es Talleres y sus dos Punto R conservan los ids de los QR impresos
// (`p_talleres_*`); en la del club son `p_club_*`. La tabla los lleva como `p_club_*`.
const idDeLaTabla = (id: string) => id.replace('p_talleres_', 'p_club_')

// Los aportes del historial cuyo nombre no es el del punto de su `pointId`. Que el nombre exista entre
// los puntos no alcanza: un aporte con el id de un punto y el nombre de otro también pasaría. Si el
// `pointId` no es de un punto de la demo, el aporte también cuenta.
const aportesConOtroNombre = (datos: typeof club) =>
  datos.contributions
    .filter((c) => c.pointName !== datos.points.find((p) => p.id === c.pointId)?.name)
    .map((c) => c.id)

describe('los puntos de las dos demos, en Córdoba capital', () => {
  it.each([
    ['general', datosGenerales],
    ['club', club],
  ])('en la demo %s, cada punto tiene lat/lng adentro de Córdoba y su ciudad es Córdoba', (_, datos) => {
    expect(datos.points.length).toBeGreaterThan(0)
    for (const p of datos.points) {
      expect(enCordoba(p), p.id).toBe(true)
      expect(p.city, p.id).toBe('Córdoba')
      expect(p).not.toHaveProperty('x')
    }
  })

  // El Perfil muestra «{ciudad} · desde …»: la persona de la demo también vive en Córdoba capital.
  it.each([
    ['general', datosGenerales],
    ['club', club],
  ])('en la demo %s, la persona del Perfil es de Córdoba', (_, datos) => {
    expect(datos.currentUser.city).toBe('Córdoba')
  })

  it('cada id queda en su lugar, con los ids de siempre', () => {
    for (const p of [...datosGenerales.points, ...club.points]) {
      const lugar = UBICACIONES[idDeLaTabla(p.id)]
      expect(lugar, p.id).toBeDefined()
      expect([p.lat, p.lng], p.id).toEqual(lugar)
    }
    // Y no se perdió ninguno: entre las dos demos están los diez de la tabla, ni uno más.
    const ids = new Set([...datosGenerales.points, ...club.points].map((p) => idDeLaTabla(p.id)))
    expect([...ids].sort()).toEqual(Object.keys(UBICACIONES).sort())
  })

  it('la demo general lleva el nombre y la dirección de la tabla, y la del club las mismas direcciones', () => {
    for (const p of datosGenerales.points) {
      expect([p.name, p.address], p.id).toEqual(NOMBRE_Y_DIRECCION[idDeLaTabla(p.id)])
    }
    for (const p of club.points) {
      expect(p.address, p.id).toBe(NOMBRE_Y_DIRECCION[idDeLaTabla(p.id)][1])
    }
  })

  it('no queda Buenos Aires en los puntos, los beneficios ni el historial', () => {
    for (const datos of [datosGenerales, club]) {
      expect(JSON.stringify(datos.points)).not.toMatch(BUENOS_AIRES)
      expect(JSON.stringify(datos.benefits)).not.toMatch(BUENOS_AIRES)
      expect(JSON.stringify(datos.contributions)).not.toMatch(BUENOS_AIRES)
    }
  })

  it('los beneficios de las dos demos son de Córdoba', () => {
    for (const datos of [datosGenerales, club]) {
      expect(datos.benefits.length).toBeGreaterThan(0)
      for (const b of datos.benefits) expect(b.city, b.id).toBe('Córdoba')
    }
  })

  it('el municipio de la demo general es de ejemplo, y no está en la del club', () => {
    expect(datosGenerales.sponsors.find((s) => s.id === 's_muni')?.name).toBe('Municipio de ejemplo')
    expect(datosGenerales.sponsors.find((s) => s.id === 's_muni')?.slug).toBe('municipio-de-ejemplo')
    expect(club.points.some((p) => p.id === 'p_muni_plaza')).toBe(false)
  })

  it('el historial y las métricas de la demo general usan los nombres nuevos', () => {
    expect(datosGenerales.contributions.map((c) => c.pointName)).toEqual(
      expect.arrayContaining(['YPF Bv. Perón', 'Café Lúmen Nueva Córdoba', 'Punto Verde Plaza de la Intendencia']),
    )
    expect(aportesConOtroNombre(datosGenerales)).toEqual([])
    expect(datosGenerales.contributions.map((c) => c.sponsorName)).not.toContain('Municipio de Vicente López')
    expect(datosGenerales.sponsorMetrics.s_ypf.byPoint.map((p) => p.point)).toEqual(['Bv. Perón', 'San Luis', 'Humberto Primo'])
  })

  it('la demo del club usa los nombres de ejemplo', () => {
    const nombres = club.points.map((p) => p.name)
    expect(nombres).toEqual(expect.arrayContaining([
      'Norte Energía Bv. Perón', 'Norte Energía San Luis', 'Norte Energía Humberto Primo', 'Café Lúmen Nueva Córdoba',
      'Burger Plaza Nueva Córdoba', 'Café Andino Nueva Córdoba', 'Helados del Parque Bv. San Juan',
      'Punto R · Estadio', 'Punto R · Sede social',
    ]))
    expect(JSON.stringify(club.points)).not.toMatch(/YPF|McDonald|Starbucks|Grido/)
  })

  it('en la demo del club, el historial y las métricas llevan los mismos nombres de ejemplo', () => {
    expect(club.contributions.length).toBeGreaterThan(0)
    expect(aportesConOtroNombre(club)).toEqual([])
    expect(club.sponsorMetrics.s_ypf.byPoint.map((p) => p.point)).toEqual(['Bv. Perón', 'San Luis', 'Humberto Primo'])
  })

  it('las causas son de Córdoba y no nombran instituciones reales', () => {
    for (const datos of [datosGenerales, club]) {
      expect(datos.causes.map((c) => c.city)).toEqual(['Córdoba', 'Córdoba', 'Córdoba'])
      expect(JSON.stringify(datos.causes)).not.toMatch(/CABA|La Matanza|Cañuelas|Gutiérrez/)
    }
  })

  it('la versión de los datos guardados sube a 3: cambiaron los nombres de los puntos', () => {
    expect(VERSION_DE_LOS_DATOS).toBe(3)
  })
})
