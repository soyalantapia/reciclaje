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
  | 'marca'

export interface Sponsor {
  id: string
  name: string
  slug: string
  category: SponsorCategory
  /** Color de marca para chips/acentos. */
  brandColor: string
  tagline: string
  /** Huella Verde: puntaje 0-100 de reputación ambiental/RSE del aliado. */
  greenScore: number
  /** Kg de material recuperado a través de la red. */
  kgRecovered: number
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
  greenScore: number
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

// ─── Causas / instituciones beneficiarias ─────────────────────────────
export type CauseType = 'hospital' | 'ong' | 'escuela' | 'comedor'

export interface CauseNeed {
  id: string
  label: string
  emoji: string
  costPoints: number
  fundedPoints: number
}

export interface Cause {
  id: string
  name: string
  slug: string
  type: CauseType
  brandColor: string
  city: string
  summary: string
  story: string
  material: MaterialType
  unitLabel: string
  kgGoal: number
  kgCollected: number
  /** Puntos que la causa acumuló por el material reciclado, para canjear insumos. */
  pointsBalance: number
  supporters: number
  needs: CauseNeed[]
}

// ─── Ganar XP comprando (segunda vía además de reciclar) ──────────────
export interface PurchasePayload {
  sponsorId: string
  amount: number
}

export interface Purchase {
  id: string
  kind: 'compra'
  sponsorId: string
  sponsorName: string
  amountArs: number
  xpEarned: number
  createdAt: string
}

export interface PurchaseResult {
  purchase: Purchase
  xpEarned: number
}

/** XP que otorga consumir en comercios de la red (1 XP cada $50). */
export const XP_PER_PESO = 1 / 50

/** Item de actividad: aporte reciclado o compra. Discriminar con 'material' in item. */
export type ActivityItem = Contribution | Purchase

// ─── Campañas del comercio (B2B) ──────────────────────────────────────
export type CampaignKind = 'premio' | 'multiplicador' | 'desafio'

export interface Campaign {
  id: string
  sponsorId: string
  kind: CampaignKind
  title: string
  detail: string
  reward: string
  active: boolean
  createdAt: string
}
