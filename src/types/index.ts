// ─── Dominio ReciclaXP ────────────────────────────────────────────────
// Modelos compartidos entre UI, store y la capa mock (MSW). Pensados para
// que enchufar un backend real sea reemplazar handlers, no tocar tipos.

export type MaterialType =
  | 'tapitas'
  | 'plastico'
  | 'vidrio'
  | 'papel'
  | 'aluminio'

export type UserRole = 'user' | 'sponsor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  city: string
  role: UserRole
  avatarColor: string
  level: number
  levelName: string
  streakDays: number
  isPremium: boolean
  joinedAt: string
  /** Mérito histórico para ranking/estatus. NO se gasta (doc §9). */
  reputationXp: number
  /** Saldo canjeable por beneficios. */
  spendableXp: number
}

export type SponsorCategory =
  | 'estacion'
  | 'club'
  | 'estadio'
  | 'complejo'
  | 'comercio'
  | 'municipio'

export interface Sponsor {
  id: string
  name: string
  slug: string
  category: SponsorCategory
  /** Color de marca para chips/acentos. */
  brandColor: string
  tagline: string
}

export type PointType = 'deposito' | 'maquina' | 'totem'

export interface RecyclePoint {
  id: string
  name: string
  sponsorId: string
  type: PointType
  address: string
  city: string
  /** Coordenadas normalizadas 0..100 sobre el mapa esquemático. */
  x: number
  y: number
  acceptedMaterials: MaterialType[]
  openNow: boolean
}

export type ContributionStatus = 'validado' | 'pendiente'

export interface Contribution {
  id: string
  userId: string
  pointId: string
  pointName: string
  sponsorId: string
  sponsorName: string
  material: MaterialType
  units?: number
  weightKg?: number
  xpEarned: number
  projectId?: string
  status: ContributionStatus
  createdAt: string
  lotId?: string
}

export type TraceStage =
  | 'aporte'
  | 'validacion'
  | 'lote'
  | 'retiro'
  | 'clasificacion'
  | 'transformacion'
  | 'producto'

export interface TraceEvent {
  stage: TraceStage
  title: string
  detail: string
  /** null = hito aún no alcanzado. */
  date: string | null
  done: boolean
  operator?: string
}

export type ProjectIllustration = 'bench' | 'totem'

export interface ProjectMilestone {
  label: string
  done: boolean
}

export interface ProjectContributor {
  name: string
  units: number
  avatarColor: string
}

export interface ImpactProject {
  id: string
  title: string
  sponsorId: string
  sponsorName: string
  description: string
  material: MaterialType
  unitLabel: string
  goalUnits: number
  collectedUnits: number
  myContributionUnits: number
  estimatedDate: string
  illustration: ProjectIllustration
  milestones: ProjectMilestone[]
  topContributors: ProjectContributor[]
}

export type BenefitCategory =
  | 'combustible'
  | 'descuento'
  | 'experiencia'
  | 'producto'
  | 'merch'
  | 'entrada'

export interface Benefit {
  id: string
  title: string
  sponsorId: string
  sponsorName: string
  category: BenefitCategory
  costXp: number
  /** Costo preferencial premium (mismo beneficio, menos XP). */
  premiumCostXp?: number
  city: string
  description: string
  stock: number
  emoji: string
}

export interface Coupon {
  id: string
  benefitId: string
  benefitTitle: string
  sponsorName: string
  code: string
  qrPayload: string
  expiresAt: string
}

export interface RankingEntry {
  position: number
  userId: string
  name: string
  avatarColor: string
  xpThisMonth: number
  isCurrentUser?: boolean
}

export interface MonthlyPrize {
  sponsorId: string
  sponsorName: string
  title: string
  description: string
  emoji: string
}

export interface RankingResult {
  scope: string
  entries: RankingEntry[]
  prize: MonthlyPrize
}

export interface SeriesPoint {
  label: string
  value: number
}

export interface SponsorMetrics {
  sponsorId: string
  sponsorName: string
  activeUsers: number
  contributions: number
  xpEmitted: number
  benefitsRedeemed: number
  kgRecovered: number
  capsRecovered: number
  monthlySeries: SeriesPoint[]
  byPoint: { point: string; contributions: number }[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ScanPayload {
  pointId: string
  material: MaterialType
  units: number
}

export interface ScanResult {
  contribution: Contribution
  xpEarned: number
  project?: ImpactProject
}

export const XP_PER_UNIT: Record<MaterialType, number> = {
  tapitas: 2,
  plastico: 3,
  vidrio: 1,
  papel: 1,
  aluminio: 4,
}
