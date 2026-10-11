import { describe, expect, it } from 'vitest'
import type { ActivityItem, Contribution, ImpactProject } from '@/types'
import { ultimosAportesDeLaHinchada } from './ultimosAportes'

const proyecto = {
  id: 'pr_banco_club',
  title: 'Banco',
  sponsorId: 's_club',
  sponsorName: 'Talleres',
  description: '',
  material: 'tapitas',
  unitLabel: 'tapitas',
  goalUnits: 300000,
  collectedUnits: 42840,
  myContributionUnits: 640,
  estimatedDate: '2027-03-31',
  illustration: 'bench',
  milestones: [],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '#000' },
    { name: 'Lu M.', units: 1190, avatarColor: '#000' },
    { name: 'Nico P.', units: 860, avatarColor: '#000' },
    { name: 'Camila R.', units: 640, avatarColor: '#000' },
    { name: 'Agus T.', units: 540, avatarColor: '#000' },
  ],
} as ImpactProject

const aporte = (c: Partial<Contribution> = {}): Contribution => ({
  id: 'c_s1',
  userId: 'u_me',
  pointId: 'p_club_estadio',
  pointName: 'Punto R · Estadio',
  sponsorId: 's_club',
  sponsorName: 'Talleres',
  material: 'tapitas',
  units: 50,
  xpEarned: 100,
  projectId: 'pr_banco_club',
  status: 'pendiente',
  createdAt: '2026-10-13T14:00:00-03:00',
  ...c,
})

describe('ultimosAportesDeLaHinchada', () => {
  it('sin nada en la sesión, muestra el acumulado de los que más aportan, sin horarios inventados', () => {
    const r = ultimosAportesDeLaHinchada(proyecto, [], 'Camila Ríos')
    expect(r.map((a) => `${a.nombre} ${a.texto}`)).toEqual([
      'Facu R. lleva 3.120 tapitas',
      'Lu M. lleva 1.190 tapitas',
      'Nico P. lleva 860 tapitas',
      'Camila R. lleva 640 tapitas',
      'Agus T. lleva 540 tapitas',
    ])
    expect(r.every((a) => a.cuando === undefined)).toBe(true)
    expect(r.filter((a) => a.esTuyo).map((a) => a.nombre)).toEqual(['Camila R.'])
  })

  it('lo de esta sesión va primero, con su hora real, y respeta el tope', () => {
    const r = ultimosAportesDeLaHinchada(proyecto, [aporte()], 'Camila Ríos')
    expect(r).toHaveLength(5)
    expect(r[0]).toEqual({ id: 'c_s1', nombre: 'Camila R.', texto: 'dejó 50 tapitas', esTuyo: true, cuando: '2026-10-13T14:00:00-03:00' })
  })

  it('no mezcla aportes de otro proyecto ni de otro material', () => {
    const r = ultimosAportesDeLaHinchada(proyecto, [aporte({ projectId: 'otro' }), aporte({ material: 'plastico' })], 'Camila Ríos')
    expect(r[0].texto).toBe('lleva 3.120 tapitas')
  })

  it('sin nombre de la persona, su aporte figura como «Un hincha» y no se marca como tuyo', () => {
    const r = ultimosAportesDeLaHinchada(proyecto, [aporte()] as ActivityItem[])
    expect(r[0]).toMatchObject({ nombre: 'Un hincha', esTuyo: false })
  })

  it('de esta sesión muestra a lo sumo 2 filas, las más nuevas, y sigue con el acumulado', () => {
    const sesion = [
      aporte({ id: 'c_s4', units: 40 }),
      aporte({ id: 'c_s3', units: 30 }),
      aporte({ id: 'c_s2', units: 20 }),
      aporte({ id: 'c_s1', units: 10 }),
    ]
    const r = ultimosAportesDeLaHinchada(proyecto, sesion, 'Camila Ríos')
    expect(r).toHaveLength(5)
    expect(r.filter((a) => a.texto.startsWith('dejó')).map((a) => a.id)).toEqual(['c_s4', 'c_s3'])
    expect(r.slice(2).map((a) => `${a.nombre} ${a.texto}`)).toEqual([
      'Facu R. lleva 3.120 tapitas',
      'Lu M. lleva 1.190 tapitas',
      'Nico P. lleva 860 tapitas',
    ])
  })

  it('un nombre de sólo espacios cuenta como sin nombre: «Un hincha» y no es tuyo', () => {
    const r = ultimosAportesDeLaHinchada(proyecto, [aporte()], '   ')
    expect(r[0]).toMatchObject({ nombre: 'Un hincha', esTuyo: false })
  })
})
