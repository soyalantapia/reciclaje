import { describe, expect, it } from 'vitest'
import type { Contribution, ImpactProject } from '@/types'
import { sumaAlBanco } from './festejo'

const banco = {
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
  topContributors: [],
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

describe('sumaAlBanco', () => {
  it('festeja un aporte de tapitas con unidades al proyecto que se dibuja como banco', () => {
    expect(sumaAlBanco(aporte(), banco)).toBe(true)
  })

  it('no festeja si el aporte no vino con proyecto', () => {
    expect(sumaAlBanco(aporte(), undefined)).toBe(false)
  })

  it('no festeja si el proyecto no se dibuja como banco', () => {
    expect(sumaAlBanco(aporte(), { ...banco, illustration: 'totem' } as ImpactProject)).toBe(false)
  })

  it('no festeja si el aporte es de otro proyecto', () => {
    expect(sumaAlBanco(aporte({ projectId: 'otro' }), banco)).toBe(false)
  })

  it('no festeja si el material no es el del proyecto', () => {
    expect(sumaAlBanco(aporte({ material: 'plastico' }), banco)).toBe(false)
  })

  it('no festeja un aporte sin unidades', () => {
    expect(sumaAlBanco(aporte({ units: 0 }), banco)).toBe(false)
    expect(sumaAlBanco(aporte({ units: undefined }), banco)).toBe(false)
  })
})
