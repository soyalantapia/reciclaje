import type {
  Benefit,
  Contribution,
  ImpactProject,
  MonthlyPrize,
  RankingEntry,
  RecyclePoint,
  Sponsor,
  TraceEvent,
} from '@/types'
import { ESTACION_DE_EJEMPLO, type DatosDelClub } from '@/lib/escenario'
import type { DatosDemo } from './datos'

/** El club de ejemplo de la demo general: en este escenario no aparece. */
const CLUB_DE_EJEMPLO = 's_talleres'
/** Sponsors de la demo general que no van en la del club: el club de ejemplo y un municipio de Buenos Aires. */
const NO_VAN = new Set([CLUB_DE_EJEMPLO, 's_muni'])

/**
 * La red de ejemplo, en Córdoba. El hincha y el club están ahí, y la demo general tiene sus
 * puntos en Buenos Aires: el club veía «Puntos adheridos» en Palermo y Pilar, y al hincha
 * reciclando en Av. del Libertador. Las direcciones son de ejemplo.
 */
const PUNTOS_EN_CORDOBA: Record<string, { name: string; address: string }> = {
  p_ypf_libertador: { name: `${ESTACION_DE_EJEMPLO} Av. Colón 1500`, address: 'Av. Colón 1500' },
  p_ypf_cabildo: { name: `${ESTACION_DE_EJEMPLO} Av. Vélez Sarsfield 2100`, address: 'Av. Vélez Sarsfield 2100' },
  p_ypf_pana: { name: `${ESTACION_DE_EJEMPLO} Circunvalación`, address: 'Av. Circunvalación y Av. Rafael Núñez' },
  p_lumen_palermo: { name: 'Café Lúmen Nueva Córdoba', address: 'Obispo Trejo 800' },
  p_mcdonalds_palermo: { name: 'Burger Plaza Nueva Córdoba', address: 'Av. Hipólito Yrigoyen 300' },
  p_starbucks_recoleta: { name: 'Café Andino Cerro de las Rosas', address: 'Av. Rafael Núñez 4600' },
  p_grido_lanus: { name: 'Helados del Parque Centro', address: 'Bv. San Juan 400' },
}

/**
 * Las marcas de la demo general son reales (YPF, Coca-Cola, McDonald's…). En la del club
 * aparecían como «Marcas de la red», como si fueran aliadas de ReciclaXP frente al club. Acá van
 * con nombres de ejemplo. Se reemplaza en los textos; los ids (`s_ypf`, `p_ypf_…`) van en
 * minúscula y no se tocan, así los QR impresos y los enlaces siguen andando.
 */
const MARCAS_DE_EJEMPLO: [RegExp, string][] = [
  [/YPF Full/g, ESTACION_DE_EJEMPLO],
  [/YPF/g, ESTACION_DE_EJEMPLO],
  [/Coca-Cola/g, 'Bebidas Serranas'],
  [/McDonald's/g, 'Burger Plaza'],
  [/Starbucks/g, 'Café Andino'],
  [/Adidas/g, 'Deportiva Centro'],
  [/Grido/g, 'Helados del Parque'],
]

function conMarcasDeEjemplo<T>(datos: T): T {
  let json = JSON.stringify(datos)
  for (const [real, ejemplo] of MARCAS_DE_EJEMPLO) json = json.replace(real, ejemplo)
  return JSON.parse(json) as T
}
/** Los mismos puntos, con el nombre corto que usan las métricas del panel. */
const METRICAS_EN_CORDOBA: Record<string, string> = {
  'Libertador 5800': 'Av. Colón 1500',
  'Cabildo 2200': 'Av. Vélez Sarsfield 2100',
  'Panamericana KM 30': 'Circunvalación',
}
/**
 * El historial de la demo general es de mayo. El aporte del club es del 4/10: los demás se corren
 * a septiembre, para que el hincha no aparezca sin reciclar desde hace cinco meses.
 */
const DIAS_HASTA_SEPTIEMBRE = 133
const ID_CLUB = 's_club'
const ID_PRODUCTO = 'pr_banco_club'
/** Verde de ReciclaXP: los colores y el escudo del club no se usan sin su permiso escrito. */
const COLOR_CLUB = '#059669'

/**
 * Escenario del caso club para la reunión del piloto: «el club» reemplaza al club de ejemplo,
 * con dos Punto R, un producto con meta (el banco de suplentes), la trazabilidad tal como
 * funcionaría en el piloto (el club pesa el lote de cada partido), sus recompensas y el ranking
 * de la hinchada. Todos los números son de ejemplo y la app lo rotula en cada pantalla.
 */
export function datosDelClub(base: DatosDemo, club: DatosDelClub): DatosDemo {
  const sponsor: Sponsor = {
    id: ID_CLUB,
    name: club.nombre,
    slug: 'club',
    category: 'club',
    brandColor: COLOR_CLUB,
    tagline: 'Reciclá con tu club',
    greenScore: 64,
    kgRecovered: 180,
  }

  const puntos: RecyclePoint[] = [
    {
      id: 'p_club_estadio',
      name: `Punto R · ${club.estadio}`,
      sponsorId: ID_CLUB,
      type: 'deposito',
      address: 'Ingreso principal, en días de partido',
      city: 'Córdoba',
      x: 48,
      y: 26,
      acceptedMaterials: ['tapitas', 'plastico'],
      openNow: true,
    },
    {
      id: 'p_club_sede',
      name: `Punto R · ${club.sede}`,
      sponsorId: ID_CLUB,
      type: 'deposito',
      address: 'Hall de entrada',
      city: 'Córdoba',
      x: 58,
      y: 40,
      acceptedMaterials: ['tapitas', 'plastico'],
      openNow: true,
    },
  ]

  const producto: ImpactProject = {
    id: ID_PRODUCTO,
    title: 'Banco de suplentes con el plástico de la hinchada',
    sponsorId: ID_CLUB,
    sponsorName: club.nombre,
    description: `Cada tapita que la hinchada deja en los Punto R de ${club.nombre} se vuelve plástico para un banco de suplentes nuevo. Cuando lleguemos a la meta, se fabrica y se instala.`,
    material: 'tapitas',
    unitLabel: 'tapitas',
    goalUnits: 300000,
    // Igual a lo que el panel calcula para 180 kg (src/lib/metrics.ts): que no se contradigan.
    collectedUnits: 42840,
    myContributionUnits: 640,
    estimatedDate: '2027-03-31',
    illustration: 'bench',
    milestones: [
      { label: 'Recolección', done: false },
      { label: 'Pesaje y retiro', done: false },
      { label: 'Fabricación', done: false },
      { label: 'Instalación', done: false },
    ],
    topContributors: [
      { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
      { name: 'Lu M.', units: 1190, avatarColor: '#7c3aed' },
      { name: 'Nico P.', units: 860, avatarColor: '#b45309' },
      { name: 'Camila R.', units: 640, avatarColor: '#059669' },
      { name: 'Agus T.', units: 540, avatarColor: '#db2777' },
    ],
  }

  const traza: TraceEvent[] = [
    {
      stage: 'aporte',
      title: 'Tu aporte',
      detail: `640 tapitas dejadas en el Punto R · ${club.estadio}.`,
      date: '2026-10-04',
      done: true,
    },
    {
      stage: 'validacion',
      title: 'Pesaje del lote',
      detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.',
      date: null,
      done: false,
      operator: club.nombre,
    },
    {
      stage: 'lote',
      title: 'Lote del partido',
      detail: 'Los aportes del partido quedan agrupados en un lote con su peso.',
      date: null,
      done: false,
    },
    {
      stage: 'retiro',
      title: 'Retiro',
      detail: 'El reciclador retira el material del estadio.',
      date: null,
      done: false,
    },
    {
      stage: 'clasificacion',
      title: 'Clasificación y limpieza',
      detail: 'Separación por color y tipo de plástico.',
      date: null,
      done: false,
    },
    {
      stage: 'transformacion',
      title: 'Fabricación del banco',
      detail: 'Con el material recuperado se fabrican las piezas del banco.',
      date: null,
      done: false,
    },
    {
      stage: 'producto',
      title: 'Instalación',
      detail: `El banco se instala en el ${club.estadio}.`,
      date: null,
      done: false,
    },
  ]

  const recompensas: Benefit[] = [
    {
      id: 'b_club_entrada',
      title: 'Entrada para un partido de local',
      sponsorId: ID_CLUB,
      sponsorName: club.nombre,
      category: 'entrada',
      costXp: 8000,
      premiumCostXp: 6800,
      city: 'Córdoba',
      description: `Una entrada para el próximo partido de local en el ${club.estadio}.`,
      stock: 10,
      emoji: '🎟️',
    },
    {
      id: 'b_club_camiseta',
      title: 'Camiseta oficial',
      sponsorId: ID_CLUB,
      sponsorName: club.nombre,
      category: 'merch',
      costXp: 9000,
      premiumCostXp: 7800,
      city: 'Córdoba',
      description: 'La camiseta oficial del club.',
      stock: 15,
      emoji: '👕',
    },
    {
      id: 'b_club_entrenamiento',
      title: 'Ver un entrenamiento del plantel',
      sponsorId: ID_CLUB,
      sponsorName: club.nombre,
      category: 'experiencia',
      costXp: 6000,
      city: 'Córdoba',
      description: 'Un cupo para presenciar un entrenamiento abierto del plantel.',
      stock: 20,
      emoji: '⚽',
    },
    {
      id: 'b_club_visita',
      title: 'Visita guiada al estadio',
      sponsorId: ID_CLUB,
      sponsorName: club.nombre,
      category: 'experiencia',
      costXp: 1500,
      city: 'Córdoba',
      description: `Recorrido guiado por el ${club.estadio}.`,
      stock: 40,
      emoji: '🏟️',
    },
  ]

  const aporte: Contribution = {
    id: 'c_club_1',
    userId: base.currentUser.id,
    pointId: 'p_club_estadio',
    pointName: `Punto R · ${club.estadio}`,
    sponsorId: ID_CLUB,
    sponsorName: club.nombre,
    material: 'tapitas',
    units: 640,
    xpEarned: 1280,
    projectId: ID_PRODUCTO,
    status: 'pendiente',
    createdAt: '2026-10-04T19:30:00-03:00',
  }

  const hinchada: RankingEntry[] = [
    { position: 1, userId: 'u_facu', name: 'Facu R.', avatarColor: '#0ea5e9', xpThisMonth: 6240 },
    { position: 2, userId: 'u_lu', name: 'Lu M.', avatarColor: '#7c3aed', xpThisMonth: 2380 },
    { position: 3, userId: 'u_nico', name: 'Nico P.', avatarColor: '#b45309', xpThisMonth: 1720 },
    {
      position: 4,
      userId: base.currentUser.id,
      name: 'Camila R. (vos)',
      avatarColor: '#059669',
      xpThisMonth: 1280,
      isCurrentUser: true,
    },
    { position: 5, userId: 'u_agus', name: 'Agus T.', avatarColor: '#db2777', xpThisMonth: 1080 },
  ]

  const premioDelClub: MonthlyPrize = {
    sponsorId: ID_CLUB,
    sponsorName: club.nombre,
    title: 'Experiencia banco de suplentes',
    description: 'Quien más aporte al banco de suplentes este mes vive un partido de local desde el banco.',
    emoji: '🏟️',
  }

  const sinLosQueNoVan = <T extends { sponsorId: string }>(lista: T[]) =>
    lista.filter((x) => !NO_VAN.has(x.sponsorId))

  const puntosDeLaRed: RecyclePoint[] = sinLosQueNoVan(base.points).map((p) => ({
    ...p,
    ...PUNTOS_EN_CORDOBA[p.id],
    city: 'Córdoba',
  }))
  const historial: Contribution[] = sinLosQueNoVan(base.contributions).map((c) => ({
    ...c,
    pointName: PUNTOS_EN_CORDOBA[c.pointId]?.name ?? c.pointName,
    createdAt: new Date(Date.parse(c.createdAt) + DIAS_HASTA_SEPTIEMBRE * 86_400_000).toISOString(),
  }))
  const beneficiosDeLaRed: Benefit[] = sinLosQueNoVan(base.benefits).map((b) =>
    b.city === 'Red' ? b : { ...b, city: 'Córdoba' },
  )

  const metricas: DatosDemo['sponsorMetrics'] = {}
  for (const [id, m] of Object.entries(base.sponsorMetrics)) {
    if (NO_VAN.has(id)) continue
    metricas[id] = {
      ...m,
      byPoint: m.byPoint.map((p) => ({ ...p, point: METRICAS_EN_CORDOBA[p.point] ?? p.point })),
    }
  }

  return conMarcasDeEjemplo({
    currentUser: { ...base.currentUser, city: 'Córdoba' },
    sponsors: [sponsor, ...base.sponsors.filter((s) => !NO_VAN.has(s.id))],
    points: [...puntos, ...puntosDeLaRed],
    projects: [producto, ...sinLosQueNoVan(base.projects)],
    traceByProject: { [ID_PRODUCTO]: traza },
    benefits: [...recompensas, ...beneficiosDeLaRed],
    contributions: [aporte, ...historial],
    rankings: { global: base.rankings.global, club: hinchada, ypf: base.rankings.ypf },
    prizes: {
      // El premio global es de ReciclaXP: no se ata a ningún sponsor.
      global: { ...base.prizes.global, sponsorId: 'reciclaxp' },
      club: premioDelClub,
      ypf: base.prizes.ypf,
    },
    sponsorMetrics: metricas,
    causes: base.causes,
  })
}
