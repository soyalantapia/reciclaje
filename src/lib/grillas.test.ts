import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Una grilla con columnas sólo desde un ancho (`sm:grid-cols-2`) y ninguna de base es, en el
 * celular, una columna `auto`: se ensancha hasta el texto más largo que no se corta (un título con
 * `truncate`) y la página se corre de costado. Pasó en el mapa y en Beneficios y Campañas del
 * panel. Con `grid-cols-1` de base, la columna no pasa el ancho de la pantalla.
 */
function grillasSinColumnasDeBase(): string[] {
  const raiz = join(process.cwd(), 'src')
  const archivos = (readdirSync(raiz, { recursive: true }) as string[]).filter(
    (f) => f.endsWith('.tsx') && !f.includes('.test.'),
  )
  const faltan: string[] = []
  for (const archivo of archivos) {
    readFileSync(join(raiz, archivo), 'utf8')
      .split('\n')
      .forEach((linea, i) => {
        for (const [, clases] of linea.matchAll(/className=["{`]([^"`}]*)/g)) {
          const t = clases.split(/\s+/)
          const conColumnasPorAncho = t.some((c) => /^(sm|md|lg|xl):grid-cols-/.test(c))
          if (t.includes('grid') && conColumnasPorAncho && !t.some((c) => c.startsWith('grid-cols-'))) {
            faltan.push(`${archivo}:${i + 1}`)
          }
        }
      })
  }
  return faltan
}

describe('grillas', () => {
  it('ninguna grilla se ensancha más que la pantalla del celular', () => {
    expect(grillasSinColumnasDeBase()).toEqual([])
  })
})
