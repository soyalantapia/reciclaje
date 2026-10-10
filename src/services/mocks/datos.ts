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
import { CLUB, ESCENARIO, type DatosDelClub } from '@/lib/escenario'
import * as base from './data'
import { conElCasoDelClub, datosDelClub, IDS_DE_TALLERES } from './escenarioClub'

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

/** Talleres en la demo general: el mismo caso que en la del club (decidido el 10/10/2026). */
const TALLERES: DatosDelClub = { nombre: 'Talleres', estadio: 'Estadio', sede: 'Sede social' }

/** La red de ejemplo de `data.ts`. */
const datosDeLaRed: DatosDemo = {
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

/**
 * Los datos de la demo publicada en la dirección corta. Talleres es el caso del club, idéntico al
 * de /club: si alguien del club entra acá, ve el mismo banco, los mismos Punto R y la misma traza.
 */
export const datosGenerales: DatosDemo = conElCasoDelClub(datosDeLaRed, TALLERES, IDS_DE_TALLERES, 'talleres')

/** Los datos del escenario elegido al compilar (ver src/lib/escenario.ts). */
export const datos: DatosDemo = ESCENARIO === 'club' ? datosDelClub(datosGenerales, CLUB) : datosGenerales
