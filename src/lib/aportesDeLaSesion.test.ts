import { describe, expect, it } from 'vitest'
import type { ActivityItem, Contribution, ImpactProject } from '@/types'
import { conAportesDeLaSesion, nombreCorto } from './aportesDeLaSesion'

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
