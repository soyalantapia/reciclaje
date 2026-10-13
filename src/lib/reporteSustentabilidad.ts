import type { ImpactProject, SponsorMetrics } from '@/types'
import { kilosDeLaMeta, nombreDelProducto } from './productosDelClub'
import { AVISO_DE_EJEMPLO } from './reporte'
import { formatNumber, objectsToCsv, pct } from './utils'

/**
 * Los datos del programa ordenados para el Reporte de Sustentabilidad de la institución. Talleres
 * publica uno desde 2023, con su Memoria y Balance: se inspira en GRI y en la Agenda 2030 y mide
 * diez dimensiones (ver docs/superpowers/specs/2026-10-11-reporte-sustentabilidad-design.md).
 * Acá van sólo las tres donde el programa aporta datos, con los nombres que usa el club, y sólo las
 * referencias que encajan sin forzar. Alineado, no certificado: eso lo dice la nota.
 */

/** Una fila de los indicadores para el reporte. */
export interface IndicadorDelReporte {
  /** Único en la tabla aunque dos productos se llamen igual: el de un producto lleva su id. */
  id: string
  /** La dimensión del reporte del club donde va, con el nombre que usa el club. */
  dimension: 'Ambiental' | 'Comunitaria' | 'Infraestructura'
  indicador: string
  /** Cómo se muestra: «180 kg (0,18 t)», «42.840 de 300.000 tapitas · 14%». */
  valor: string
  /** El número de la planilla, con su unidad. */
  numero: number
  unidad: string
  /** El estándar GRI o el ODS con que se alinea; `SIN_REFERENCIA` donde ninguno encaja. */
  referencia: string
}

/** Lo que dice la columna Referencia donde ningún estándar encaja sin forzar. */
export const SIN_REFERENCIA = '—'

/** Lo que dice la sección al pie: alinear no es verificar, y en la demo los datos son de ejemplo. */
export const NOTA_DEL_REPORTE =
  'Ordenado según las dimensiones del Reporte de Sustentabilidad del club y alineado con los estándares GRI y la Agenda 2030. No es una verificación: el armado y la verificación del reporte son del club. En la demo, datos de ejemplo; en el piloto, los kilos salen de los pesajes que registra el club.'

export function indicadoresParaElReporte({
  m,
  productos,
  puntosR,
}: {
  m: SponsorMetrics
  productos: ImpactProject[]
  puntosR: number
}): IndicadorDelReporte[] {
  return [
    {
      id: 'plastico',
      dimension: 'Ambiental',
      indicador: 'Plástico recuperado para reciclar',
      // GRI pide los residuos en toneladas; el club piensa en kilos: van los dos.
      valor: `${formatNumber(m.kgRecovered)} kg (${formatNumber(m.kgRecovered / 1000)} t)`,
      numero: m.kgRecovered,
      unidad: 'kg',
      referencia: 'GRI 306-4 · ODS 12.5',
    },
    {
      id: 'tapitas',
      dimension: 'Ambiental',
      indicador: 'Tapitas recuperadas',
      valor: formatNumber(m.capsRecovered),
      numero: m.capsRecovered,
      unidad: 'tapitas',
      referencia: 'GRI 306-4 (plástico)',
    },
    {
      id: 'puntos-r',
      dimension: 'Ambiental',
      indicador: 'Puntos de recolección (Punto R)',
      valor: formatNumber(puntosR),
      numero: puntosR,
      unidad: 'puntos',
      referencia: 'GRI 306-2',
    },
    {
      id: 'hinchas',
      dimension: 'Comunitaria',
      indicador: 'Hinchas que participaron',
      valor: formatNumber(m.activeUsers),
      numero: m.activeUsers,
      unidad: 'hinchas',
      referencia: 'GRI 413-1',
    },
    {
      id: 'aportes',
      dimension: 'Comunitaria',
      indicador: 'Aportes registrados',
      valor: formatNumber(m.contributions),
      numero: m.contributions,
      unidad: 'aportes',
      referencia: SIN_REFERENCIA,
    },
    {
      id: 'canjes',
      dimension: 'Comunitaria',
      indicador: 'Beneficios canjeados por la hinchada',
      valor: formatNumber(m.benefitsRedeemed),
      numero: m.benefitsRedeemed,
      unidad: 'canjes',
      referencia: SIN_REFERENCIA,
    },
    ...productos.map(
      (p): IndicadorDelReporte => ({
        id: `producto-${p.id}`,
        dimension: 'Infraestructura',
        indicador: `${nombreDelProducto(p)} (meta ${formatNumber(kilosDeLaMeta(p))} kg)`,
        valor: `${formatNumber(p.collectedUnits)} de ${formatNumber(p.goalUnits)} ${p.unitLabel} · ${pct(p.collectedUnits, p.goalUnits)}%`,
        numero: p.collectedUnits,
        unidad: p.unitLabel,
        referencia: 'ODS 12.5',
      }),
    ),
  ]
}

/**
 * La planilla de los indicadores, para quien arma la memoria. Viaja sin la pantalla, así que
 * arranca con el aviso de datos de ejemplo y la marca BOM para que Excel lea los acentos, como el
 * CSV de Reportes.
 */
export function csvDeIndicadores(filas: IndicadorDelReporte[]): string {
  const planilla = filas.map((f) => ({
    dimensión: f.dimension,
    indicador: f.indicador,
    valor: f.numero,
    unidad: f.unidad,
    referencia: f.referencia,
  }))
  return `\uFEFF"${AVISO_DE_EJEMPLO}"\n${objectsToCsv(planilla)}`
}
