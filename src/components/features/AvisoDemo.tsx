import { Info } from 'lucide-react'

/**
 * Aviso de que los números son de ejemplo. Regla de honestidad del proyecto
 * (work-agent/09-DECISIONES.md): ninguna pantalla muestra métricas, kilos o usuarios como si
 * fueran reales mientras la app corra con datos simulados.
 */
export function AvisoDemo() {
  return (
    <p
      role="note"
      className="mb-3 flex items-center justify-center gap-1.5 rounded-full border border-xp-200 bg-xp-50 px-3 py-1 text-center text-[11px] font-semibold text-xp-700 dark:border-xp-700/40 dark:bg-xp-700/10 dark:text-xp-300"
    >
      <Info size={12} className="shrink-0" /> Demo · los números son de ejemplo
    </p>
  )
}
