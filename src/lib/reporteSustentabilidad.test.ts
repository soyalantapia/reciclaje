import { describe, expect, it } from 'vitest'
import type { ImpactProject, SponsorMetrics } from '@/types'
import { AVISO_DE_EJEMPLO } from './reporte'
import { NOTA_DEL_REPORTE, SIN_REFERENCIA, csvDeIndicadores, indicadoresParaElReporte } from './reporteSustentabilidad'

const m = {
  sponsorId: 's_club', sponsorName: 'Talleres', greenScore: 64, activeUsers: 162, contributions: 828,
  xpEmitted: 56304, benefitsRedeemed: 28, kgRecovered: 180, capsRecovered: 42840, monthlySeries: [], byPoint: [],
} as SponsorMetrics

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', etiqueta: 'Banco de suplentes',
  sponsorId: 's_club', sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas',
  goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31',
  illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

const butacas = {
  ...banco, id: 'pr_nuevo_1', title: 'Butacas para la platea', etiqueta: undefined, goalUnits: 119000,
  collectedUnits: 50, forma: 'butacas',
} as ImpactProject

const filas = indicadoresParaElReporte({ m, productos: [banco, butacas], puntosR: 2 })
const fila = (indicador: string) => filas.find((f) => f.indicador.startsWith(indicador))!

describe('indicadoresParaElReporte', () => {
  it('ordena los datos en las dimensiones del reporte del club: ambiental, comunitaria e infraestructura', () => {
    expect([...new Set(filas.map((f) => f.dimension))]).toEqual(['Ambiental', 'Comunitaria', 'Infraestructura'])
  })

  it('el plástico va en kilos y en toneladas, alineado con GRI 306-4 y el ODS 12.5', () => {
    expect(fila('Plástico recuperado para reciclar')).toMatchObject({
      dimension: 'Ambiental', valor: '180 kg (0,18 t)', numero: 180, unidad: 'kg', referencia: 'GRI 306-4 · ODS 12.5',
    })
    expect(fila('Tapitas recuperadas')).toMatchObject({ valor: '42.840', referencia: 'GRI 306-4 (plástico)' })
    expect(fila('Puntos de recolección (Punto R)')).toMatchObject({ valor: '2', numero: 2, referencia: 'GRI 306-2' })
  })

  it('la comunidad usa las mismas métricas del informe, y sin referencia forzada donde no encaja', () => {
    expect(fila('Hinchas que participaron este mes')).toMatchObject({ dimension: 'Comunitaria', valor: '162', referencia: 'GRI 413-1' })
    expect(fila('Aportes registrados')).toMatchObject({ valor: '828', referencia: SIN_REFERENCIA })
    expect(fila('Beneficios canjeados por la hinchada')).toMatchObject({ valor: '28', referencia: SIN_REFERENCIA })
    expect(SIN_REFERENCIA).toBe('—')
  })

  it('cada producto es una fila de infraestructura, con su meta en kilos y su avance', () => {
    const infraestructura = filas.filter((f) => f.dimension === 'Infraestructura')
    expect(infraestructura.map((f) => [f.indicador, f.valor, f.referencia])).toEqual([
      ['Banco de suplentes (meta 1.261 kg)', '42.840 de 300.000 tapitas · 14%', 'ODS 12.5'],
      ['Butacas para la platea (meta 500 kg)', '50 de 119.000 tapitas · 0%', 'ODS 12.5'],
    ])
  })

  it('sin productos no hay filas de infraestructura, y sin Punto R la fila dice 0', () => {
    const sinNada = indicadoresParaElReporte({ m, productos: [], puntosR: 0 })
    expect(sinNada.some((f) => f.dimension === 'Infraestructura')).toBe(false)
    expect(sinNada.find((f) => f.indicador === 'Puntos de recolección (Punto R)')).toMatchObject({ valor: '0', numero: 0 })
  })

  it('cada fila tiene su id, distinto aunque dos productos se llamen igual', () => {
    const repetidos = indicadoresParaElReporte({ m, productos: [butacas, { ...butacas, id: 'pr_nuevo_2' }], puntosR: 2 })
    const ids = repetidos.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(repetidos.filter((f) => f.dimension === 'Infraestructura').map((f) => f.id)).toEqual([
      'producto-pr_nuevo_1',
      'producto-pr_nuevo_2',
    ])
  })

  it('no dice «certificado», «verificable» ni «auditado» en ninguna parte, y la nota aclara que no es una verificación', () => {
    const textos = [...filas.flatMap((f) => [f.indicador, f.valor, f.referencia]), NOTA_DEL_REPORTE].join(' ')
    // «verificación» sí puede aparecer: es la palabra con que la nota dice que esto no lo es.
    expect(textos).not.toMatch(/certific|verificab|verificad|auditad/i)
    expect(NOTA_DEL_REPORTE).toContain('No es una verificación')
  })
})

describe('csvDeIndicadores', () => {
  it('arranca con la marca BOM y el aviso de datos de ejemplo, y lleva el número con su unidad y referencia', () => {
    const csv = csvDeIndicadores(filas)
    const [aviso, cabecera, primera] = csv.split('\n')
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(aviso).toBe(`\uFEFF"${AVISO_DE_EJEMPLO}"`)
    expect(cabecera).toBe('dimensión,indicador,valor,unidad,referencia')
    expect(primera).toBe('Ambiental,Plástico recuperado para reciclar,180,kg,GRI 306-4 · ODS 12.5')
    expect(csv.split('\n')).toHaveLength(2 + filas.length)
  })

  it('un nombre con coma o comillas viaja entre comillas, sin correr las columnas', () => {
    const raro = { ...butacas, id: 'pr_raro', title: 'Banco "La 12", platea norte' } as ImpactProject
    const csv = csvDeIndicadores(indicadoresParaElReporte({ m, productos: [raro], puntosR: 2 }))
    expect(csv.split('\n').at(-1)).toBe('Infraestructura,"Banco ""La 12"", platea norte (meta 500 kg)",50,tapitas,ODS 12.5')
  })
})
