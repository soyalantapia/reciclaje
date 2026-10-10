import { describe, expect, it } from 'vitest'
import type { ActivityItem, Contribution, ImpactProject, RankingEntry, TraceEvent } from '@/types'
import { conAporteDeLaSesionEnLaTraza, conAportesDeLaSesion, nombreCorto, rankingConXpDeLaSesion } from './aportesDeLaSesion'

const proyecto: ImpactProject = {
  id: 'pr_banco_club',
  title: 'Banco de suplentes',
  sponsorId: 's_club',
  sponsorName: 'Tu club',
  description: '',
  material: 'tapitas',
  unitLabel: 'tapitas',
  goalUnits: 300000,
  collectedUnits: 42840,
  myContributionUnits: 640,
  estimatedDate: '2027-03-31',
  illustration: 'banco' as ImpactProject['illustration'],
  milestones: [],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '#000' },
    { name: 'Lu M.', units: 1190, avatarColor: '#000' },
    { name: 'Nico P.', units: 860, avatarColor: '#000' },
    { name: 'Camila R.', units: 640, avatarColor: '#000' },
    { name: 'Agus T.', units: 540, avatarColor: '#000' },
  ],
}

const aporte = (cambios: Partial<Contribution>): Contribution => ({
  id: 'c_1',
  userId: 'u_me',
  pointId: 'p_club_estadio',
  pointName: 'Punto R · Estadio',
  sponsorId: 's_club',
  sponsorName: 'Tu club',
  material: 'tapitas',
  units: 50,
  xpEarned: 100,
  projectId: 'pr_banco_club',
  status: 'validado',
  createdAt: '2026-10-10T20:00:00.000Z',
  ...cambios,
})

describe('nombreCorto', () => {
  it('deja el nombre y la inicial del apellido, como en los rankings', () => {
    expect(nombreCorto('Camila Ríos')).toBe('Camila R.')
    expect(nombreCorto('  Camila   Ríos  ')).toBe('Camila R.')
    expect(nombreCorto('Camila')).toBe('Camila')
  })
})

describe('conAportesDeLaSesion', () => {
  it('suma los aportes de la sesión al total del proyecto y al aporte propio', () => {
    const r = conAportesDeLaSesion(proyecto, [aporte({}), aporte({ id: 'c_2', units: 25 })], 'Camila Ríos')
    expect(r.collectedUnits).toBe(42915)
    expect(r.myContributionUnits).toBe(715)
  })

  it('no suma aportes de otro proyecto, de otro material ni compras', () => {
    const compra: ActivityItem = { id: 'k1', kind: 'compra', sponsorId: 's_club', sponsorName: 'Tu club', amountArs: 5000, xpEarned: 50, createdAt: '2026-10-10T20:00:00.000Z' }
    const r = conAportesDeLaSesion(
      proyecto,
      [aporte({ projectId: 'otro' }), aporte({ material: 'plastico' }), aporte({ projectId: undefined }), compra],
      'Camila Ríos',
    )
    expect(r).toEqual(proyecto)
  })

  it('actualiza la fila de la persona entre los que más aportan y la reordena', () => {
    const r = conAportesDeLaSesion(proyecto, [aporte({ units: 400 })], 'Camila Ríos')
    expect(r.topContributors.map((c) => `${c.name} ${c.units}`)).toEqual([
      'Facu R. 3120',
      'Lu M. 1190',
      'Camila R. 1040',
      'Nico P. 860',
      'Agus T. 540',
    ])
  })

  it('sin aportes en la sesión devuelve el proyecto tal cual', () => {
    expect(conAportesDeLaSesion(proyecto, [], 'Camila Ríos')).toBe(proyecto)
  })
})

describe('rankingConXpDeLaSesion', () => {
  const hoy = new Date('2026-10-10T20:30:00.000Z')
  const ranking: RankingEntry[] = [
    { position: 1, userId: 'u1', name: 'Facu R.', avatarColor: '#000', xpThisMonth: 4820 },
    { position: 2, userId: 'u2', name: 'Lu M.', avatarColor: '#000', xpThisMonth: 1500 },
    { position: 3, userId: 'u_me', name: 'Camila R. (vos)', avatarColor: '#000', xpThisMonth: 1280, isCurrentUser: true },
    { position: 4, userId: 'u4', name: 'Nico P.', avatarColor: '#000', xpThisMonth: 900 },
  ]
  const compraEnYpf: ActivityItem = { id: 'k1', kind: 'compra', sponsorId: 's_ypf', sponsorName: 'YPF', amountArs: 5000, xpEarned: 150, createdAt: '2026-10-10T20:00:00.000Z' }

  it('en el global suma todo el XP de la sesión a la persona y reordena las posiciones', () => {
    const r = rankingConXpDeLaSesion(ranking, [aporte({ xpEarned: 100 }), compraEnYpf], undefined, hoy)
    // 1.280 + 100 del aporte + 150 de la compra = 1.530: pasa a Lu (1.500) y queda 2ª.
    expect(r.map((e) => `${e.position} ${e.userId} ${e.xpThisMonth}`)).toEqual([
      '1 u1 4820',
      '2 u_me 1530',
      '3 u2 1500',
      '4 u4 900',
    ])
    // 1.280 + 100 = 1.380: suma, pero no alcanza para pasar a nadie.
    const r2 = rankingConXpDeLaSesion(ranking, [aporte({ xpEarned: 100 })], undefined, hoy)
    expect(r2.map((e) => `${e.position} ${e.userId} ${e.xpThisMonth}`)).toEqual([
      '1 u1 4820',
      '2 u2 1500',
      '3 u_me 1380',
      '4 u4 900',
    ])
  })

  it('en el ranking de una sede cuenta sólo el XP ganado en esa sede', () => {
    const r = rankingConXpDeLaSesion(ranking, [aporte({ xpEarned: 100 }), compraEnYpf], 's_club', hoy)
    expect(r.find((e) => e.isCurrentUser)?.xpThisMonth).toBe(1380)
  })

  it('no cuenta lo de otro mes: es el ranking del mes', () => {
    const r = rankingConXpDeLaSesion(ranking, [aporte({ xpEarned: 100, createdAt: '2026-09-20T12:00:00.000Z' })], undefined, hoy)
    expect(r).toBe(ranking)
  })

  it('sin XP en la sesión devuelve el ranking tal cual', () => {
    expect(rankingConXpDeLaSesion(ranking, [], undefined, hoy)).toBe(ranking)
  })
})

describe('trazaConAporteDeLaSesion', () => {
  const traza: TraceEvent[] = [
    { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas dejadas en el Punto R · Estadio.', date: '2026-10-04', done: true },
    { stage: 'validacion', title: 'Pesaje del lote', detail: 'Al cierre de cada partido…', date: null, done: false },
  ]

  it('el hito «Tu aporte» muestra el último aporte de la sesión a ese proyecto', () => {
    const r = conAporteDeLaSesionEnLaTraza(traza, proyecto, [
      aporte({ id: 'c_viejo', units: 25, createdAt: '2026-10-10T13:00:00.000Z' }),
      aporte({ id: 'c_nuevo', units: 50, createdAt: '2026-10-10T15:00:00.000Z' }),
    ])
    expect(r[0]).toMatchObject({ stage: 'aporte', detail: '50 tapitas en Punto R · Estadio.', date: '2026-10-10', done: true })
    expect(r[1]).toBe(traza[1])
  })

  it('sin aportes de la sesión a ese proyecto y material, la traza queda igual', () => {
    expect(conAporteDeLaSesionEnLaTraza(traza, proyecto, [])).toBe(traza)
    expect(conAporteDeLaSesionEnLaTraza(traza, proyecto, [aporte({ projectId: 'otro' }), aporte({ material: 'plastico' })])).toBe(traza)
  })
})
