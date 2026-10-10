/**
 * Versión de los datos de la demo guardados en el navegador. Se sube cuando cambian los datos de
 * ejemplo de una forma que deja viejo lo guardado: lo guardado con otra versión se descarta y la
 * demo arranca limpia (a lo sumo, pide entrar de nuevo).
 *
 * 2 · 10/10/2026: River pasó a ser Talleres. Sin esto, quien ya había usado la demo seguía viendo
 * «Máquinas Estadio Monumental» en su actividad, porque cada aporte guarda el nombre del punto.
 */
export const VERSION_DE_LOS_DATOS = 2

/** Opciones de `persist` para un store con datos de la demo: versión actual y descarte de lo viejo. */
export function conVersionDeLosDatos<S>() {
  return { version: VERSION_DE_LOS_DATOS, migrate: () => ({}) as S }
}
