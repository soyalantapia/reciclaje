import type { Contribution, ImpactProject } from '@/types'

/**
 * ¿Este aporte se festeja en el banco de la hinchada? Sólo si el proyecto existe y se dibuja como
 * banco, el aporte es de ese mismo proyecto y de su mismo material (las tapitas no suman a una
 * meta en plástico) y trae unidades: sin unidades no hay nada que sumar al banco.
 */
export function sumaAlBanco(contribution: Contribution, proyecto: ImpactProject | undefined): boolean {
  return (
    !!proyecto &&
    proyecto.illustration === 'bench' &&
    contribution.projectId === proyecto.id &&
    contribution.material === proyecto.material &&
    (contribution.units ?? 0) > 0
  )
}
