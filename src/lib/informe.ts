import type { ImpactProject, ProjectContributor } from '@/types'

/** Las cuatro etapas del piloto de 90 días, como las cuenta `docs/producto/desglose-piloto.md`. */
export const ETAPAS_DEL_PILOTO: { numero: number; nombre: string; dias: string; detalle: string }[] = [
  {
    numero: 1,
    nombre: 'Preparación',
    dias: 'Días 1 a 20',
    detalle: 'El club deja listos sus Punto R, su producto con meta y la carga de pesajes.',
  },
  {
    numero: 2,
    nombre: 'Lanzamiento controlado',
    dias: 'Días 21 a 35',
    detalle: 'Material para los Punto R, ranking y premio de la hinchada, y el primer partido acompañado.',
  },
  {
    numero: 3,
    nombre: 'Operación en partidos',
    dias: 'Días 36 a 75',
    detalle: 'Cada partido se pesa y el panel muestra los kilos por partido y por punto.',
  },
  {
    numero: 4,
    nombre: 'Evaluación y decisión',
    dias: 'Días 76 a 90',
    detalle: 'Constancia por producto e informe del piloto, para decidir cómo sigue.',
  },
]

/** Lo que dice «Partido por partido» mientras no haya pesajes: la tabla va, los números no. */
export const SIN_PESAJES = 'Se completa con el pesaje de cada partido, desde la etapa 1 del piloto.'

/** Los que más aportan entre todos los productos del club: cada nombre una vez, con lo de todos sumado. */
export function topDeLaHinchada(productos: ImpactProject[], tope = 5): ProjectContributor[] {
  const porNombre = new Map<string, ProjectContributor>()
  for (const p of productos) {
    for (const c of p.topContributors) {
      const previo = porNombre.get(c.name)
      porNombre.set(c.name, previo ? { ...previo, units: previo.units + c.units } : c)
    }
  }
  return [...porNombre.values()].sort((a, b) => b.units - a.units).slice(0, tope)
}
