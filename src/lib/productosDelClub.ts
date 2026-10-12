import type { FormaDelProducto, ImpactProject, Patrocinador, RecyclePoint, Sponsor, TraceEvent } from '@/types'
import { TAPITAS_POR_KILO } from './metrics'

/**
 * Los productos que el club publica desde su panel (E1.3 del piloto): lo que construye su
 * hinchada, con una meta en kilos y el Punto R donde se junta. En la demo viven en el navegador
 * (`src/store/commerceProducts.ts`) y el simulador los sirve junto a los del seed.
 */

/** Las formas que se eligen en «Nuevo producto», con el nombre que se propone para cada una. */
export const FORMAS: { forma: FormaDelProducto; nombre: string; nombrePorDefecto: string }[] = [
  { forma: 'banco', nombre: 'Banco de suplentes', nombrePorDefecto: 'Banco de suplentes visitante' },
  { forma: 'butacas', nombre: 'Butacas', nombrePorDefecto: 'Butacas para la platea' },
  { forma: 'arco', nombre: 'Arco para las inferiores', nombrePorDefecto: 'Arco para las inferiores' },
  { forma: 'libre', nombre: 'Otro', nombrePorDefecto: '' },
]

/** Los hitos de un producto nuevo: los mismos cuatro del banco, ninguno hecho. */
const HITOS = ['Recolección', 'Pesaje y retiro', 'Fabricación', 'Instalación']

export interface NuevoProducto {
  id: string
  forma: FormaDelProducto
  nombre: string
  metaKg: number
  punto: RecyclePoint
  club: { id: string; nombre: string }
  /** ISO. */
  creadoEn: string
  /** La empresa de la red que lo acompaña; sin ella, el producto es sólo del club. */
  patrocinador?: Patrocinador
}

/**
 * Un producto publicado desde el panel. Arranca en cero, con la meta en kilos contada en tapitas
 * con la cuenta del panel, y sin fecha estimada: se pone cuando se sepa cuándo se fabrica. Se
 * dibuja como banco (`illustration: 'bench'`) para usar el festejo, el recorrido y el banco de la
 * hinchada; `forma` decide qué dibujan las tapitas.
 */
export function crearProducto(n: NuevoProducto): ImpactProject {
  const nombre = n.nombre.trim()
  return {
    id: n.id,
    title: nombre,
    sponsorId: n.club.id,
    sponsorName: n.club.nombre,
    description: `Las tapitas que la hinchada deje en el ${n.punto.name} van a «${nombre}». Con la meta cumplida, se fabrica y se instala.`,
    material: 'tapitas',
    unitLabel: 'tapitas',
    goalUnits: Math.round(n.metaKg * TAPITAS_POR_KILO),
    collectedUnits: 0,
    myContributionUnits: 0,
    estimatedDate: '',
    illustration: 'bench',
    milestones: HITOS.map((label) => ({ label, done: false })),
    topContributors: [],
    forma: n.forma,
    puntoId: n.punto.id,
    creadoEn: n.creadoEn,
    ...(n.patrocinador && { patrocinador: n.patrocinador }),
  }
}

/** Los kilos de la meta, con la misma cuenta: las 300.000 tapitas del banco son 1.261 kg. */
export function kilosDeLaMeta(p: ImpactProject): number {
  return Math.round(p.goalUnits / TAPITAS_POR_KILO)
}

/** El nombre corto de un producto, para las pestañas del inicio y el informe. */
export function nombreDelProducto(p: ImpactProject): string {
  return p.etiqueta ?? p.title
}

/** ¿Lo publicó el club desde el panel? Los del seed no tienen forma. */
export function esDelPanel(p: ImpactProject): boolean {
  return p.forma !== undefined
}

/**
 * El producto al que va un aporte hecho en un punto: el más nuevo que el club publicó para ese
 * Punto R; si no hay, el del club, como hasta hoy. Un producto abierto por punto.
 */
export function proyectoDelPunto(
  punto: RecyclePoint,
  sembrados: ImpactProject[],
  creados: ImpactProject[],
): ImpactProject | undefined {
  const delPunto = creados
    .filter((p) => p.puntoId === punto.id)
    .sort((a, b) => (b.creadoEn ?? '').localeCompare(a.creadoEn ?? ''))[0]
  return delPunto ?? sembrados.find((p) => p.sponsorId === punto.sponsorId)
}

/** Los Punto R donde junta un producto: el suyo, o los del club que no tomó un producto del panel. */
export function puntosDelProducto(p: ImpactProject, puntos: RecyclePoint[], creados: ImpactProject[]): RecyclePoint[] {
  if (p.puntoId) return puntos.filter((pt) => pt.id === p.puntoId)
  const tomados = new Set(creados.map((c) => c.puntoId))
  return puntos.filter((pt) => pt.sponsorId === p.sponsorId && !tomados.has(pt.id))
}

/**
 * El recorrido de un producto del panel: las mismas siete etapas del banco, ninguna hecha ni
 * fechada. El primer aporte de la hinchada marca «Tu aporte» (ver `conAporteDeLaSesionEnLaTraza`).
 */
export function trazaDeUnProducto(p: ImpactProject, punto: string): TraceEvent[] {
  return [
    { stage: 'aporte', title: 'Tu aporte', detail: `Las tapitas que dejás en el ${punto}.`, date: null, done: false },
    {
      stage: 'validacion',
      title: 'Pesaje del lote',
      detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.',
      date: null,
      done: false,
      operator: p.sponsorName,
    },
    {
      stage: 'lote',
      title: 'Lote del partido',
      detail: 'Los aportes del partido quedan agrupados en un lote con su peso.',
      date: null,
      done: false,
    },
    { stage: 'retiro', title: 'Retiro', detail: 'El reciclador retira el material del club.', date: null, done: false },
    {
      stage: 'clasificacion',
      title: 'Clasificación y limpieza',
      detail: 'Separación por color y tipo de plástico.',
      date: null,
      done: false,
    },
    {
      stage: 'transformacion',
      title: 'Fabricación',
      detail: `Con el material recuperado se fabrica «${p.title}».`,
      date: null,
      done: false,
    },
    { stage: 'producto', title: 'Instalación', detail: `«${p.title}» se instala en el club.`, date: null, done: false },
  ]
}

/**
 * Cómo nombra el festejo el destino de un aporte: el banco del club es «el banco de la hinchada»;
 * un producto del panel, por su nombre.
 */
export function destinoDelProducto(p: ImpactProject): { rotulo: string; frase: string } {
  return esDelPanel(p)
    ? { rotulo: p.title, frase: `a «${p.title}»` }
    : { rotulo: 'banco de la hinchada', frase: 'al banco de la hinchada' }
}

/** El título de la lista del banco de la hinchada: sólo el banco tiene a la hinchada «en el banco». */
export function tituloDeLaHinchada(p: ImpactProject): string {
  return esDelPanel(p) ? 'La hinchada que suma' : 'La hinchada en el banco'
}

/** Quiénes pueden acompañar un producto: las empresas y los comercios de la red, no el club ni el municipio. */
const PUEDEN_PATROCINAR = new Set(['estacion', 'comercio', 'marca'])

export function patrocinadoresPosibles(red: Sponsor[]): Patrocinador[] {
  return red
    .filter((s) => PUEDEN_PATROCINAR.has(s.category))
    .map((s) => ({ id: s.id, nombre: s.name, color: s.brandColor }))
}

/** Cómo se nombra el apoyo junto al producto. */
export function textoDelApoyo(p: ImpactProject): string | undefined {
  return p.patrocinador ? `Con el apoyo de ${p.patrocinador.nombre}` : undefined
}
