import { describe, expect, it } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor } from '@/types'
import { TAPITAS_POR_KILO } from './metrics'
import {
  FORMAS,
  crearProducto,
  destinoDelProducto,
  esDelPanel,
  kilosDeLaMeta,
  nombreDelProducto,
  patrocinadoresPosibles,
  textoDelApoyo,
  proyectoDelPunto,
  puntosDelProducto,
  tituloDeLaHinchada,
  trazaDeUnProducto,
  type NuevoProducto,
} from './productosDelClub'

const punto = (id: string, name: string, sponsorId = 's_club'): RecyclePoint => ({
  id, name, sponsorId, type: 'deposito', address: '', city: 'Córdoba', lat: 0, lng: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
const estadio = punto('p_club_estadio', 'Punto R · Estadio')
const sede = punto('p_club_sede', 'Punto R · Sede social')

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', etiqueta: 'Banco de suplentes',
  sponsorId: 's_club', sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas',
  goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31',
  illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

const nuevo = (cambios: Partial<NuevoProducto> = {}) =>
  crearProducto({
    id: 'pr_nuevo_1', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
    club: { id: 's_club', nombre: 'Talleres' }, creadoEn: '2026-10-10T12:00:00.000Z', ...cambios,
  })

describe('crearProducto', () => {
  it('arranca en cero, con la meta en tapitas a 238 por kilo y sin fecha inventada', () => {
    const p = nuevo()
    expect(TAPITAS_POR_KILO).toBe(238)
    expect(p.goalUnits).toBe(119000)
    expect(p.collectedUnits).toBe(0)
    expect(p.myContributionUnits).toBe(0)
    expect(p.estimatedDate).toBe('')
    expect(p.topContributors).toEqual([])
    expect(p.milestones.map((h) => h.label)).toEqual(['Recolección', 'Pesaje y retiro', 'Fabricación', 'Instalación'])
    expect(p.milestones.every((h) => !h.done)).toBe(true)
  })

  it('se dibuja como banco, con su forma, su Punto R y el club', () => {
    const p = nuevo({ forma: 'arco', nombre: '  Arco para las inferiores  ' })
    expect(p.title).toBe('Arco para las inferiores')
    expect(p.illustration).toBe('bench')
    expect(p.forma).toBe('arco')
    expect(p.puntoId).toBe('p_club_sede')
    expect(p.creadoEn).toBe('2026-10-10T12:00:00.000Z')
    expect(p.sponsorId).toBe('s_club')
    expect(p.sponsorName).toBe('Talleres')
    expect(p.material).toBe('tapitas')
    expect(p.unitLabel).toBe('tapitas')
    expect(p.description).toBe(
      'Las tapitas que la hinchada deje en el Punto R · Sede social van a «Arco para las inferiores». Con la meta cumplida, se fabrica y se instala.',
    )
  })
})

describe('FORMAS', () => {
  it('son las cuatro que se eligen en el panel, con su nombre propuesto', () => {
    expect(FORMAS.map((f) => f.forma)).toEqual(['banco', 'butacas', 'arco', 'libre'])
    expect(FORMAS.map((f) => f.nombre)).toEqual(['Banco de suplentes', 'Butacas', 'Arco para las inferiores', 'Otro'])
    expect(FORMAS.map((f) => f.nombrePorDefecto)).toEqual([
      'Banco de suplentes visitante',
      'Butacas para la platea',
      'Arco para las inferiores',
      '',
    ])
  })
})

describe('kilosDeLaMeta y nombreDelProducto', () => {
  it('la meta en kilos sale con la misma cuenta del panel', () => {
    expect(kilosDeLaMeta(nuevo())).toBe(500)
    expect(kilosDeLaMeta(banco)).toBe(1261)
  })

  it('el nombre corto es la etiqueta, si la hay; si no, el título', () => {
    expect(nombreDelProducto(banco)).toBe('Banco de suplentes')
    expect(nombreDelProducto(nuevo())).toBe('Butacas para la platea')
  })
})

describe('proyectoDelPunto', () => {
  it('sin productos del panel, el aporte va al proyecto del club, como hasta hoy', () => {
    expect(proyectoDelPunto(sede, [banco], [])?.id).toBe('pr_banco_club')
  })

  it('en el Punto R de un producto del panel va a ese producto; en otro punto, al banco', () => {
    const butacas = nuevo()
    expect(proyectoDelPunto(sede, [banco], [butacas])?.id).toBe('pr_nuevo_1')
    expect(proyectoDelPunto(estadio, [banco], [butacas])?.id).toBe('pr_banco_club')
  })

  it('si hubiera dos para el mismo punto, gana el más nuevo', () => {
    const viejo = nuevo({ id: 'pr_viejo', creadoEn: '2026-10-09T12:00:00.000Z' })
    const reciente = nuevo({ id: 'pr_reciente', creadoEn: '2026-10-10T12:00:00.000Z' })
    expect(proyectoDelPunto(sede, [banco], [viejo, reciente])?.id).toBe('pr_reciente')
    expect(proyectoDelPunto(sede, [banco], [reciente, viejo])?.id).toBe('pr_reciente')
  })

  it('un punto de otro sponsor no toma los productos del club', () => {
    expect(proyectoDelPunto(punto('p_otro', 'Otro', 's_otro'), [banco], [nuevo()])).toBeUndefined()
  })
})

describe('puntosDelProducto', () => {
  it('un producto del panel junta en su punto; el banco, en los del club que quedan libres', () => {
    const butacas = nuevo()
    expect(puntosDelProducto(butacas, [estadio, sede], [butacas]).map((p) => p.id)).toEqual(['p_club_sede'])
    expect(puntosDelProducto(banco, [estadio, sede], [butacas]).map((p) => p.id)).toEqual(['p_club_estadio'])
    expect(puntosDelProducto(banco, [estadio, sede], []).map((p) => p.id)).toEqual(['p_club_estadio', 'p_club_sede'])
  })
})

describe('trazaDeUnProducto', () => {
  it('son las siete etapas del banco, con el producto y su punto, y ninguna hecha ni fechada', () => {
    const t = trazaDeUnProducto(nuevo(), 'Punto R · Sede social')
    expect(t.map((e) => e.stage)).toEqual([
      'aporte', 'validacion', 'lote', 'retiro', 'clasificacion', 'transformacion', 'producto',
    ])
    expect(t.every((e) => !e.done && e.date === null)).toBe(true)
    expect(t[0].detail).toBe('Las tapitas que dejás en el Punto R · Sede social.')
    expect(t[1].title).toBe('Pesaje del lote')
    expect(t[1].operator).toBe('Talleres')
    expect(t[5].detail).toBe('Con el material recuperado se fabrica «Butacas para la platea».')
    expect(t[6].detail).toBe('«Butacas para la platea» se instala en el club.')
  })
})

describe('destinoDelProducto y tituloDeLaHinchada', () => {
  it('el banco del club sigue siendo «el banco de la hinchada»', () => {
    expect(esDelPanel(banco)).toBe(false)
    expect(destinoDelProducto(banco)).toEqual({ rotulo: 'banco de la hinchada', frase: 'al banco de la hinchada' })
    expect(tituloDeLaHinchada(banco)).toBe('La hinchada en el banco')
  })

  it('un producto del panel se nombra por su nombre', () => {
    const p = nuevo()
    expect(esDelPanel(p)).toBe(true)
    expect(destinoDelProducto(p)).toEqual({ rotulo: 'Butacas para la platea', frase: 'a «Butacas para la platea»' })
    expect(tituloDeLaHinchada(p)).toBe('La hinchada que suma')
  })
})

describe('el patrocinador de un producto', () => {
  const sponsor = (id: string, name: string, category: Sponsor['category']): Sponsor => ({
    id, name, slug: id, category, brandColor: '#123456', tagline: '', greenScore: 50, kgRecovered: 0,
  })

  it('pueden acompañar un producto las empresas y los comercios de la red, no el club ni el municipio', () => {
    const red = [
      sponsor('s_ypf', 'Norte Energía', 'estacion'),
      sponsor('s_club', 'Talleres', 'estadio'),
      sponsor('s_muni', 'Municipio de ejemplo', 'municipio'),
      sponsor('s_cafe', 'Café Lúmen', 'comercio'),
      sponsor('s_coca', 'Bebidas Serranas', 'marca'),
    ]
    expect(patrocinadoresPosibles(red)).toEqual([
      { id: 's_ypf', nombre: 'Norte Energía', color: '#123456' },
      { id: 's_cafe', nombre: 'Café Lúmen', color: '#123456' },
      { id: 's_coca', nombre: 'Bebidas Serranas', color: '#123456' },
    ])
  })

  it('el producto lo guarda y lo nombra; sin patrocinador, no dice nada', () => {
    const base = {
      id: 'pr_x', forma: 'butacas' as const, nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
      club: { id: 's_club', nombre: 'Talleres' }, creadoEn: '2026-10-12T00:00:00Z',
    }
    const con = crearProducto({ ...base, patrocinador: { id: 's_ypf', nombre: 'Norte Energía', color: '#0f3d91' } })
    expect(con.patrocinador).toEqual({ id: 's_ypf', nombre: 'Norte Energía', color: '#0f3d91' })
    expect(textoDelApoyo(con)).toBe('Con el apoyo de Norte Energía')
    const sin = crearProducto(base)
    expect(sin).not.toHaveProperty('patrocinador')
    expect(textoDelApoyo(sin)).toBeUndefined()
  })
})
