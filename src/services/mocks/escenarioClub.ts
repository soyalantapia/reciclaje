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
/**
 * Sponsors de la demo general que no van en la del club. El club de ejemplo, porque el club de esta
 * demo ya entra por `casoDelClub` con sus propios ids (`s_club`, `p_club_…`): si el de ejemplo se
 * quedara, el club aparecería dos veces, con sus Punto R y su banco. El municipio de ejemplo, porque
 * la demo del club no muestra a un municipio como aliado de ReciclaXP frente al club.
 */
const NO_VAN = new Set([CLUB_DE_EJEMPLO, 's_muni'])

/**
 * La red de ejemplo está en Córdoba capital en las dos demos: los puntos, los beneficios y el
 * historial salen de `data.ts`, con lugares reales de Nueva Córdoba y el Centro, y la demo del
 * club no los mueve de ahí. Lo que sí cambia son los nombres de las marcas.
 *
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

/**
 * El historial de la demo general es de mayo. El aporte del club es del 4/10: los demás se corren
 * a septiembre, para que el hincha no aparezca sin reciclar desde hace cinco meses.
 */
const DIAS_HASTA_SEPTIEMBRE = 133
const ID_CLUB = 's_club'
const ID_PRODUCTO = 'pr_banco_club'
/** Verde de ReciclaXP: los colores y el escudo del club no se usan sin su permiso escrito. */
const COLOR_CLUB = '#059669'

/** Los ids con que el caso del club entra en una demo. */
export interface IdsDelCaso {
  sponsor: string
  slug: string
  /** Prefijo de los ids de los puntos y las recompensas: `p_<prefijo>_estadio`, `b_<prefijo>_entrada`. */
  prefijo: string
  producto: string
}

const IDS_DEMO_DEL_CLUB: IdsDelCaso = { sponsor: ID_CLUB, slug: 'club', prefijo: 'club', producto: ID_PRODUCTO }

/** Talleres en la demo general: el mismo caso, con sus ids de siempre (el QR del estadio es `p_talleres_estadio`). */
export const IDS_DE_TALLERES: IdsDelCaso = {
  sponsor: CLUB_DE_EJEMPLO,
  slug: 'talleres',
  prefijo: 'talleres',
  producto: 'pr_banco_talleres',
}

/**
 * El caso del club: el club con sus dos Punto R, el banco de suplentes con meta, la traza tal como
 * funcionaría en el piloto (el club pesa el lote de cada partido), las recompensas, el aporte de la
 * persona, el ranking de la hinchada y su premio. Es el mismo en las dos demos: antes la general
 * tenía otro Talleres, con máquinas en el estadio, sensores y el banco al 62 %.
 */
export function casoDelClub(base: DatosDemo, club: DatosDelClub, ids: IdsDelCaso) {
  const sponsor: Sponsor = {
    id: ids.sponsor,
    name: club.nombre,
    slug: ids.slug,
    category: 'club',
    brandColor: COLOR_CLUB,
    tagline: 'Reciclá con tu club',
    greenScore: 64,
    kgRecovered: 180,
  }

  // Lugares de Talleres (el Kempes, donde juega de local, y su sede), de fuentes públicas: a confirmar con el club. Con otro club (VITE_CLUB_NOMBRE) cambia el nombre, no los pines.
  const puntos: RecyclePoint[] = [
    {
      id: `p_${ids.prefijo}_estadio`,
      name: `Punto R · ${club.estadio}`,
      sponsorId: ids.sponsor,
      type: 'deposito',
      address: 'Estadio Mario Alberto Kempes, ingreso principal en días de partido',
      city: 'Córdoba',
      lat: -31.368847,
      lng: -64.246145,
      acceptedMaterials: ['tapitas', 'plastico'],
      openNow: true,
    },
    {
      id: `p_${ids.prefijo}_sede`,
      name: `Punto R · ${club.sede}`,
      sponsorId: ids.sponsor,
      type: 'deposito',
      address: 'Rosario de Santa Fe 15, frente a la Plaza San Martín',
      city: 'Córdoba',
      lat: -31.415995,
      lng: -64.183657,
      acceptedMaterials: ['tapitas', 'plastico'],
      openNow: true,
    },
  ]

  const producto: ImpactProject = {
    id: ids.producto,
    title: 'Banco de suplentes con el plástico de la hinchada',
    etiqueta: 'Banco de suplentes',
    sponsorId: ids.sponsor,
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
      id: `b_${ids.prefijo}_entrada`,
      title: 'Entrada para un partido de local',
      sponsorId: ids.sponsor,
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
      id: `b_${ids.prefijo}_camiseta`,
      title: 'Camiseta oficial',
      sponsorId: ids.sponsor,
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
      id: `b_${ids.prefijo}_entrenamiento`,
      title: 'Ver un entrenamiento del plantel',
      sponsorId: ids.sponsor,
      sponsorName: club.nombre,
      category: 'experiencia',
      costXp: 6000,
      city: 'Córdoba',
      description: 'Un cupo para presenciar un entrenamiento abierto del plantel.',
      stock: 20,
      emoji: '⚽',
    },
    {
      id: `b_${ids.prefijo}_visita`,
      title: 'Visita guiada al estadio',
      sponsorId: ids.sponsor,
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
    id: `c_${ids.prefijo}_1`,
    userId: base.currentUser.id,
    pointId: `p_${ids.prefijo}_estadio`,
    pointName: `Punto R · ${club.estadio}`,
    sponsorId: ids.sponsor,
    sponsorName: club.nombre,
    material: 'tapitas',
    units: 640,
    xpEarned: 1280,
    projectId: ids.producto,
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
    sponsorId: ids.sponsor,
    sponsorName: club.nombre,
    title: 'Experiencia banco de suplentes',
    description: 'Quien más aporte al banco de suplentes este mes vive un partido de local desde el banco.',
    emoji: '🏟️',
  }

  return { sponsor, puntos, producto, traza, recompensas, aporte, hinchada, premio: premioDelClub }
}

/**
 * Escenario del caso club para la reunión del piloto: «el club» reemplaza al club de ejemplo,
 * con dos Punto R, un producto con meta (el banco de suplentes), la trazabilidad tal como
 * funcionaría en el piloto (el club pesa el lote de cada partido), sus recompensas y el ranking
 * de la hinchada. Todos los números son de ejemplo y la app lo rotula en cada pantalla.
 */
export function datosDelClub(base: DatosDemo, club: DatosDelClub): DatosDemo {
  const { sponsor, puntos, producto, traza, recompensas, aporte, hinchada, premio: premioDelClub } = casoDelClub(
    base,
    club,
    IDS_DEMO_DEL_CLUB,
  )

  const sinLosQueNoVan = <T extends { sponsorId: string }>(lista: T[]) =>
    lista.filter((x) => !NO_VAN.has(x.sponsorId))

  const puntosDeLaRed: RecyclePoint[] = sinLosQueNoVan(base.points)
  const historial: Contribution[] = sinLosQueNoVan(base.contributions).map((c) => ({
    ...c,
    createdAt: new Date(Date.parse(c.createdAt) + DIAS_HASTA_SEPTIEMBRE * 86_400_000).toISOString(),
  }))
  const beneficiosDeLaRed: Benefit[] = sinLosQueNoVan(base.benefits)

  const metricas: DatosDemo['sponsorMetrics'] = {}
  for (const [id, m] of Object.entries(base.sponsorMetrics)) {
    if (!NO_VAN.has(id)) metricas[id] = m
  }

  return conMarcasDeEjemplo({
    currentUser: base.currentUser,
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

/**
 * Una demo con el caso del club en lugar de lo que tenía ese sponsor: sus puntos, su proyecto y su
 * traza, sus beneficios, el aporte de la persona, la pestaña del ranking y el premio. Las métricas
 * cargadas a mano se van, así el panel calcula igual que en la demo del club.
 */
export function conElCasoDelClub(base: DatosDemo, club: DatosDelClub, ids: IdsDelCaso, pestana: string): DatosDemo {
  const caso = casoDelClub(base, club, ids)
  const sinLoDeAntes = <T extends { sponsorId: string }>(lista: T[]) => lista.filter((x) => x.sponsorId !== ids.sponsor)
  const traceByProject = { ...base.traceByProject }
  for (const p of base.projects) if (p.sponsorId === ids.sponsor) delete traceByProject[p.id]
  const sponsorMetrics = { ...base.sponsorMetrics }
  delete sponsorMetrics[ids.sponsor]
  const yaEstaba = base.sponsors.some((s) => s.id === ids.sponsor)
  return {
    ...base,
    sponsors: yaEstaba ? base.sponsors.map((s) => (s.id === ids.sponsor ? caso.sponsor : s)) : [...base.sponsors, caso.sponsor],
    points: [...caso.puntos, ...sinLoDeAntes(base.points)],
    projects: [caso.producto, ...sinLoDeAntes(base.projects)],
    traceByProject: { ...traceByProject, [ids.producto]: caso.traza },
    benefits: [...caso.recompensas, ...sinLoDeAntes(base.benefits)],
    contributions: [caso.aporte, ...sinLoDeAntes(base.contributions)],
    rankings: { ...base.rankings, [pestana]: caso.hinchada },
    prizes: { ...base.prizes, [pestana]: caso.premio },
    sponsorMetrics,
  }
}
