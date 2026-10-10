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
import type { DatosDelClub } from '@/lib/escenario'
import type { DatosDemo } from './datos'

/** El club de ejemplo de la demo general: en este escenario no aparece. */
const CLUB_DE_EJEMPLO = 's_river'
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

  const sinElClubDeEjemplo = <T extends { sponsorId: string }>(lista: T[]) =>
    lista.filter((x) => x.sponsorId !== CLUB_DE_EJEMPLO)

  const metricas = { ...base.sponsorMetrics }
  delete metricas[CLUB_DE_EJEMPLO]

  return {
    currentUser: { ...base.currentUser, city: 'Córdoba' },
    sponsors: [sponsor, ...base.sponsors.filter((s) => s.id !== CLUB_DE_EJEMPLO)],
    points: [...puntos, ...sinElClubDeEjemplo(base.points)],
    projects: [producto, ...sinElClubDeEjemplo(base.projects)],
    traceByProject: { [ID_PRODUCTO]: traza },
    benefits: [...recompensas, ...sinElClubDeEjemplo(base.benefits)],
    contributions: [aporte, ...sinElClubDeEjemplo(base.contributions)],
    rankings: { global: base.rankings.global, club: hinchada, ypf: base.rankings.ypf },
    prizes: {
      // El premio global es de ReciclaXP: no se ata a ningún sponsor.
      global: { ...base.prizes.global, sponsorId: 'reciclaxp' },
      club: premioDelClub,
      ypf: base.prizes.ypf,
    },
    sponsorMetrics: metricas,
    causes: base.causes,
  }
}
