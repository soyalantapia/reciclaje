import type {
  Benefit,
  Cause,
  Contribution,
  ImpactProject,
  MonthlyPrize,
  RankingEntry,
  RecyclePoint,
  Sponsor,
  SponsorMetrics,
  TraceEvent,
  User,
} from '@/types'
import { CLUB, ESCENARIO } from '@/lib/escenario'
import * as base from './data'
import { datosDelClub } from './escenarioClub'

/** Todo lo que sirven los handlers de la demo. Un escenario es un juego completo de esto. */
export interface DatosDemo {
  currentUser: User
  sponsors: Sponsor[]
  points: RecyclePoint[]
  projects: ImpactProject[]
  traceByProject: Record<string, TraceEvent[]>
  benefits: Benefit[]
  contributions: Contribution[]
  rankings: Record<string, RankingEntry[]>
  prizes: Record<string, MonthlyPrize>
  sponsorMetrics: Record<string, SponsorMetrics>
  causes: Cause[]
}

/** Los datos de la demo publicada, tal cual. */
export const datosGenerales: DatosDemo = {
  currentUser: base.currentUser,
  sponsors: base.sponsors,
  points: base.points,
  projects: base.projects,
  traceByProject: base.traceByProject,
  benefits: base.benefits,
  contributions: base.contributions,
  rankings: base.rankings,
  prizes: base.prizes,
  sponsorMetrics: base.sponsorMetrics,
  causes: base.causes,
}

/** Los datos del escenario elegido al compilar (ver src/lib/escenario.ts). */
export const datos: DatosDemo = ESCENARIO === 'club' ? datosDelClub(datosGenerales, CLUB) : datosGenerales
