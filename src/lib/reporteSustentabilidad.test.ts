import { describe, expect, it } from 'vitest'
import type { ImpactProject, SponsorMetrics } from '@/types'
import { AVISO_DE_EJEMPLO } from './reporte'
import { NOTA_DEL_REPORTE, csvDeIndicadores, indicadoresParaElReporte } from './reporteSustentabilidad'

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
    expect(fila('Aportes registrados')).toMatchObject({ valor: '828', referencia: '—' })
    expect(fila('Beneficios canjeados por la hinchada')).toMatchObject({ valor: '28', referencia: '—' })
  })

  it('cada producto es una fila de infraestructura, con su meta en kilos y su avance', () => {
    const infraestructura = filas.filter((f) => f.dimension === 'Infraestructura')
    expect(infraestructura.map((f) => [f.indicador, f.valor, f.referencia])).toEqual([
      ['Banco de suplentes (meta 1.261 kg)', '42.840 de 300.000 tapitas · 14%', 'ODS 12.5'],
      ['Butacas para la platea (meta 500 kg)', '50 de 119.000 tapitas · 0%', 'ODS 12.5'],
    ])
  })

  it('no dice «certificado» ni «verificado» en ninguna parte, y la nota aclara que no es una verificación', () => {
    const textos = [...filas.flatMap((f) => [f.indicador, f.valor, f.referencia]), NOTA_DEL_REPORTE].join(' ')
    expect(textos).not.toMatch(/certificad|verificad/i)
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
})
