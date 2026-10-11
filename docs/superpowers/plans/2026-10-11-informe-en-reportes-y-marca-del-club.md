# Reportes con el informe y la marca del club · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** para un club, Reportes abre el informe con «Descargar PDF» y «Descargar CSV». Además, el club carga su escudo y su color en el panel, y todo su panel y su informe los usan, sin que nada de eso vaya al código.

**Architecture:**
- `CommerceReports` elige: el informe (`CommerceInforme`) para una institución, el reporte de impacto para un comercio.
- La paleta `eco-*` pasa por variables CSS, así el contenedor del panel la puede pisar con la de la marca.
- La marca vive en un store `persist` por institución. La lógica de color es pura (`src/lib/marca.ts`), y lo que usa el canvas está aislado (`src/lib/escudo.ts`).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind 4 (`@theme inline`), zustand `persist`, Vitest 4 y Testing Library (jsdom).

Diseño: `docs/superpowers/specs/2026-10-11-informe-en-reportes-y-marca-del-club-design.md`.

## Global Constraints

- **Idioma:** textos de pantalla y comentarios en español rioplatense, con voseo («Subí», «Elegí»). Nada de «en vivo» ni «tiempo real».
- **Imports:** van con el alias `@/`, como el resto del repo.
- **Nada del club real en el repo:** ni escudo, ni archivo, ni colores oficiales. En las pruebas, el escudo es una data URL falsa (`data:image/png;base64,ESCUDO`) y los colores son valores de prueba.
- **La paleta `eco-*` conserva sus valores de hoy:** #ecfdf5, #d1fae5, #a7f3d0, #6ee7b7, #34d399, #10b981, #059669, #047857, #065f46, #064e3b y #022c22. Sólo cambia el mecanismo: se pasa por una variable.
- **Sin dependencias nuevas.**
- **Pruebas:**
  - Vitest y Testing Library con `fireEvent`: no hay `user-event`.
  - No agregues stubs de `localStorage`: `src/test/setup.ts` ya lo resuelve.
  - jsdom no tiene canvas ni `URL.createObjectURL`.
- **Comandos:**
  - Desde la raíz del worktree `~/.reunion/worktrees/reciclaxp-tareas/marca`.
  - Las pruebas, con `npx vitest run <archivos>`.
  - Los tipos, con `npx tsc -p tsconfig.app.json`. **Nunca `tsc -b`.**
  - El lint, con `npx eslint .`, sin errores; los warnings que ya existen no cuentan.
  - El exit se lee directo: `npx vitest run x > /tmp/salida.txt 2>&1; echo "exit=$?"`. **Nunca a través de un pipe.**
  - En zsh, las rutas de las pruebas van escritas literales, no en variables.
- **Commits:**
  - Con `git add <archivos>`, nunca `-A`.
  - El mensaje en español, con el tipo y el alcance (`feat(marca): …`), y al final `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- **No hagas:** `push`, deploy, ni tocar otros worktrees (`T3` tiene el `node_modules` compartido).

---

### Task 1: Reportes es el informe del club, con «Descargar PDF» y «Descargar CSV»

**Files:**
- Modify: `src/pages/commerce/CommerceReports.tsx` (archivo entero, abajo)
- Modify: `src/pages/commerce/CommerceInforme.tsx:2-4` (imports) y `:145-160` (la barra de arriba)
- Modify: `src/routes.tsx:65` y `:127`
- Modify: `src/components/features/CommerceLayout.tsx:13-14`
- Test: `src/pages/commerce/CommerceReports.test.tsx`, `src/pages/commerce/CommerceInforme.test.tsx` y `src/components/features/avisoAlImprimir.test.tsx`

**Interfaces:**
- Consumes: `CommerceInforme` (default export de `src/pages/commerce/CommerceInforme.tsx`) y `esInstitucion(categoria?: string): boolean` (`src/lib/vocabulario.ts`).
- Produces: `/comercio/reportes` muestra el informe a una institución. `/comercio/informe` redirige a `/comercio/reportes`. Los botones del informe son «Descargar PDF» (llama `window.print()`) y «Descargar CSV».

- [ ] **Step 1: Las pruebas que fallan**

En `src/pages/commerce/CommerceReports.test.tsx` reemplazá el mock de la API, agregá el `beforeAll` y reemplazá el `describe`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { useSessionStore } from '@/store/session'
import CommerceReports from './CommerceReports'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([]),
    getSponsors: () => Promise.resolve([]),
    getProjects: () => Promise.resolve([]),
    getProjectTrace: () => Promise.resolve([]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

beforeAll(() => {
  // jsdom no trae IntersectionObserver: las animaciones al entrar en pantalla lo usan.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

function verReportes(sponsor: Sponsor) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceReports />
    </MemoryRouter>,
  )
}

describe('Reportes', () => {
  it('a un club le muestra el informe para la Comisión Directiva, con «Descargar PDF» y «Descargar CSV»', async () => {
    verReportes(club)
    expect(await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Descargar PDF$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Descargar CSV$/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: 'Reportes' })).not.toBeInTheDocument()
  })

  it('a un comercio, el reporte de impacto', async () => {
    verReportes({ ...club, id: 's_cafe', category: 'comercio' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Reportes' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Informe para la Comisión Directiva' })).not.toBeInTheDocument()
  })
})
```

En `src/pages/commerce/CommerceInforme.test.tsx`:

1. Reemplazá la prueba «Imprimir o guardar PDF» (hoy en la línea 254) por esta:

```tsx
  it('«Descargar PDF» abre la ventana del navegador para guardarlo, y sus botones no se imprimen', async () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
    verElInforme()
    const boton = await screen.findByRole('button', { name: /^Descargar PDF$/ })
    expect(boton.closest('[data-no-imprimir]')).not.toBeNull()
    fireEvent.click(boton)
    expect(imprimir).toHaveBeenCalledOnce()
  })

  it('«Descargar CSV» baja el reporte con el aviso de datos de ejemplo', async () => {
    descargar.mockClear()
    verElInforme()
    const boton = await screen.findByRole('button', { name: /^Descargar CSV$/ })
    expect(boton.closest('[data-no-imprimir]')).not.toBeNull()
    fireEvent.click(boton)
    expect(descargar).toHaveBeenCalledOnce()
    const [nombre, contenido, tipo] = descargar.mock.calls[0]
    expect(nombre).toBe('informe-club.csv')
    expect(contenido).toContain(AVISO_DE_EJEMPLO)
    expect(tipo).toBe('text/csv;charset=utf-8')
  })

  it('ya no tiene el link «Reportes»: el informe es la pantalla de Reportes', async () => {
    verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    expect(screen.queryByRole('link', { name: /Reportes/ })).not.toBeInTheDocument()
  })
```

2. Reemplazá `src/components/features/avisoAlImprimir.test.tsx` desde la función `verElPanelEn` hasta el final:

```tsx
/** Espera el título de la pantalla: si la prueba termina antes de que cargue, la carga diferida queda colgada. */
async function verElPanelEn(ruta: string, titulo: string, sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  const r = createMemoryRouter(router.routes, { initialEntries: [ruta] })
  render(<RouterProvider router={r} />)
  await screen.findByRole('heading', { level: 1, name: titulo })
  return { aviso: screen.getByRole('note'), r }
}

describe('el aviso de la demo al imprimir', () => {
  it('en los Reportes de un comercio se imprime', async () => {
    const { aviso } = await verElPanelEn('/comercio/reportes', 'Reportes', { ...club, id: 's_cafe', category: 'comercio' })
    expect(aviso).toHaveTextContent('Demo · los números son de ejemplo')
    expect(aviso.closest('[data-no-imprimir]')).toBeNull()
  })

  it('en los Reportes del club, que son el informe, no: el informe lleva el suyo', async () => {
    const { aviso } = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(aviso.closest('[data-no-imprimir]')).not.toBeNull()
  })

  it('la dirección vieja del informe lleva a Reportes', async () => {
    const { r } = await verElPanelEn('/comercio/informe', 'Informe para la Comisión Directiva')
    expect(r.state.location.pathname).toBe('/comercio/reportes')
  })
})
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `npx vitest run src/pages/commerce/CommerceReports.test.tsx src/pages/commerce/CommerceInforme.test.tsx src/components/features/avisoAlImprimir.test.tsx > /tmp/t1-rojo.txt 2>&1; echo "exit=$?"`

Expected: `exit=1`. Fallan las pruebas nuevas: el club ve «Reportes» y no el informe, no hay «Descargar PDF», el link «Reportes» sigue y `/comercio/informe` no redirige.

- [ ] **Step 3: `CommerceReports` elige el informe para una institución**

Reemplazá `src/pages/commerce/CommerceReports.tsx` entero por esto. `printReport` y el reporte de impacto quedan igual; sólo se va la tarjeta del informe, que ya no hace falta:

```tsx
import { toast } from 'sonner'
import { Download, FileText, Printer } from 'lucide-react'
import type { SponsorMetrics } from '@/types'
import { useSessionStore } from '@/store/session'
import { useMetricasDelPanel } from '@/hooks/useMetricasDelPanel'
import { downloadBlob, formatNumber } from '@/lib/utils'
import { AVISO_DE_EJEMPLO, csvDelReporte, filasDelReporte } from '@/lib/reporte'
import { esInstitucion } from '@/lib/vocabulario'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CommerceInforme from './CommerceInforme'

function printReport(m: SponsorMetrics, name: string) {
  const w = window.open('', '_blank', 'width=760,height=900')
  if (!w) return
  const rows = filasDelReporte(m)
    .map(
      (r) =>
        `<tr><td style="padding:9px 14px;border-bottom:1px solid #eee">${r.metrica}</td>` +
        `<td style="padding:9px 14px;border-bottom:1px solid #eee;text-align:right;font-weight:700">${formatNumber(r.valor)}</td></tr>`,
    )
    .join('')
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Reporte ${name}</title></head>` +
      `<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;color:#0c1f1a;padding:40px">` +
      `<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #059669;padding-bottom:12px">` +
      `<h1 style="margin:0;font-size:22px">Reporte de impacto · ${name}</h1>` +
      `<span style="color:#059669;font-weight:800">ReciclaXP</span></div>` +
      `<p style="color:#555">Resumen de impacto ambiental y comunidad. ${AVISO_DE_EJEMPLO}</p>` +
      `<table style="width:100%;border-collapse:collapse;margin-top:8px">${rows}</table>` +
      `<p style="margin-top:24px;color:#888;font-size:12px">Generado con ReciclaXP · demo con datos de ejemplo.</p>` +
      `</body></html>`,
  )
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 350)
}

/**
 * Reportes. Para un club o un estadio es el informe para su Comisión Directiva, con «Descargar PDF»
 * y «Descargar CSV» arriba; para un comercio, el reporte de impacto.
 */
export default function CommerceReports() {
  const commerce = useSessionStore((s) => s.commerce)
  if (!commerce) return null
  return esInstitucion(commerce.category) ? <CommerceInforme /> : <ReporteDeImpacto />
}

function ReporteDeImpacto() {
  const commerce = useSessionStore((s) => s.commerce)
  // Las métricas con lo que la comunidad hizo en esta sesión (mismo navegador): aportes, XP y canjes.
  const { m, loading, error, reload } = useMetricasDelPanel()

  if (!commerce) return null
  if (error && !m) return <ErrorState message={error} onRetry={reload} />
  if (loading || !m) return <Skeleton className="h-64 w-full" />

  function downloadCsv() {
    downloadBlob(`reporte-${commerce!.slug}.csv`, csvDelReporte(m!), 'text/csv;charset=utf-8')
    toast.success('Reporte CSV descargado 📄')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          Así se va a ver tu reporte de impacto. En la demo, los datos son de ejemplo.
        </p>
      </div>

      {/* Preview de lo que incluye */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-eco-600" />
          <p className="font-bold">Reporte de impacto · {commerce.name}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {filasDelReporte(m)
            .slice(0, 7)
            .map((r) => (
              <div key={r.metrica} className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">{r.metrica}</span>
                <span className="font-bold">{formatNumber(r.valor)}</span>
              </div>
            ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          + detalle por mes y por punto. En la demo, datos de ejemplo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={downloadCsv}>
          <Download size={18} /> Descargar CSV
        </Button>
        <Button size="lg" variant="secondary" onClick={() => printReport(m, commerce.name)}>
          <Printer size={18} /> Imprimir / PDF
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Los botones del informe**

En `src/pages/commerce/CommerceInforme.tsx`:
- **Los imports:** `import { Link, Navigate } from 'react-router-dom'` pasa a `import { Navigate } from 'react-router-dom'`, y `import { ChevronLeft, Download, Printer } from 'lucide-react'` pasa a `import { Download } from 'lucide-react'`.
- **La barra de arriba:** reemplazá el bloque que empieza en `<div data-no-imprimir className="flex flex-wrap items-center justify-between gap-2">` (link «Reportes» y los dos botones) por:

```tsx
      {/* El informe es la pantalla de Reportes de una institución: arriba, sus dos descargas */}
      <div data-no-imprimir className="flex flex-wrap items-center justify-end gap-2">
        {/* El PDF sale de la ventana del navegador («Guardar como PDF»): las hojas A4, con texto nítido */}
        <Button size="sm" onClick={() => window.print()}>
          <Download size={15} /> Descargar PDF
        </Button>
        <Button size="sm" variant="secondary" onClick={descargarCsv}>
          <Download size={15} /> Descargar CSV
        </Button>
      </div>
```

- [ ] **Step 5: La ruta vieja y el aviso al imprimir**

En `src/routes.tsx`:
- **Borrá** la línea `const CommerceInforme = lazyWithRetry(() => import('@/pages/commerce/CommerceInforme'))`.
- **Reemplazá** `{ path: 'informe', element: withSuspense(<CommerceInforme />) },` por:

```tsx
            // El informe de un club es su pantalla de Reportes: la dirección vieja lleva ahí.
            { path: 'informe', element: <Navigate to="/comercio/reportes" replace /> },
```

En `src/components/features/CommerceLayout.tsx`, sumá el import `import { esInstitucion } from '@/lib/vocabulario'`. Después reemplazá:

```tsx
  // El informe lleva su propio aviso, arriba y al pie: sólo ahí el de la demo no se imprime.
  const enElInforme = useMatch('/comercio/informe')
```

por:

```tsx
  // El informe lleva su propio aviso, arriba y al pie: sólo ahí el de la demo no se imprime. El
  // informe de una institución es su pantalla de Reportes.
  const enReportes = useMatch('/comercio/reportes')
```

Y, después de `if (!commerce) return null`, agregá:

```tsx
  const enElInforme = Boolean(enReportes) && esInstitucion(commerce.category)
```

- [ ] **Step 6: Correr las pruebas y ver el verde**

Run: `npx vitest run src/pages/commerce/CommerceReports.test.tsx src/pages/commerce/CommerceInforme.test.tsx src/components/features/avisoAlImprimir.test.tsx > /tmp/t1-verde.txt 2>&1; echo "exit=$?"`
Expected: `exit=0`.

Después, la suite entera, los tipos y el lint:

```bash
npx vitest run > /tmp/t1-suite.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t1-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t1-lint.txt 2>&1; echo "exit=$?"
```

Expected: los tres con `exit=0`. Si alguna otra prueba buscaba «Imprimir o guardar PDF» o el link al informe, actualizala al comportamiento nuevo.

- [ ] **Step 7: Commit**

```bash
git add src/pages/commerce/CommerceReports.tsx src/pages/commerce/CommerceReports.test.tsx src/pages/commerce/CommerceInforme.tsx src/pages/commerce/CommerceInforme.test.tsx src/routes.tsx src/components/features/CommerceLayout.tsx src/components/features/avisoAlImprimir.test.tsx
git commit -m "feat(informe): para un club, Reportes abre el informe con «Descargar PDF» y «Descargar CSV»" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: La base de la marca (la paleta por variables, la lógica de color, el store y el hook)

**Files:**
- Modify: `src/index.css:24-35` (los tokens `eco-*`)
- Create: `src/lib/marca.ts`, `src/store/marcaDelClub.ts` y `src/hooks/useMarcaDelPanel.ts`
- Test: `src/lib/marca.test.ts`, `src/store/marcaDelClub.test.ts` y `src/hooks/useMarcaDelPanel.test.tsx`

**Interfaces:**
- Consumes: `claveDeAlmacenamiento(nombre)` (`src/lib/escenario.ts`), `conVersionDeLosDatos<S>()` y `VERSION_DE_LOS_DATOS` (`src/store/versionDeDatos.ts`), `useSessionStore` (`src/store/session.ts`) y `esInstitucion` (`src/lib/vocabulario.ts`).
- Produces:
  - `TONOS`: `readonly ['50','100','200','300','400','500','600','700','800','900','950']`; `type Tono`.
  - `colorLegible(hex: string): string`.
  - `contrasteConBlanco(hex: string): number`.
  - `paletaDeMarca(color: string): Record<Tono, string>`.
  - `estiloDeMarca(color: string): Record<\`--eco-${Tono}\`, string>`.
  - `colorDominante(pixeles: ArrayLike<number>): string | null`.
  - `interface MarcaDelClub { color: string; escudo?: string }`.
  - `useMarcaDelClubStore`, con el estado `{ marcas: Record<string, MarcaDelClub>; guardar(sponsorId, marca); quitar(sponsorId) }`.
  - `useMarcaDelPanel(): { escudo?: string; color: string; estilo: CSSProperties } | null`.

- [ ] **Step 1: Las pruebas que fallan**

`src/lib/marca.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TONOS, colorDominante, colorLegible, contrasteConBlanco, estiloDeMarca, paletaDeMarca } from './marca'

/** Una imagen de mentira: tramos de `n` píxeles RGBA iguales. */
const pixeles = (...tramos: [n: number, r: number, g: number, b: number, a: number][]) =>
  new Uint8ClampedArray(tramos.flatMap(([n, r, g, b, a]) => Array.from({ length: n }, () => [r, g, b, a]).flat()))

describe('paletaDeMarca', () => {
  it('trae los 11 tonos, con el color de la marca en el 600', () => {
    const p = paletaDeMarca('#0b2d6b')
    expect(Object.keys(p)).toEqual([...TONOS])
    expect(p['600']).toBe('#0b2d6b')
    expect(p['50']).toBe('color-mix(in oklab, #0b2d6b 8%, white)')
    expect(p['950']).toBe('color-mix(in oklab, #0b2d6b 40%, black)')
  })

  it('un color tan claro que el texto blanco no se lee encima se oscurece hasta que se lea', () => {
    expect(contrasteConBlanco('#ffe14d')).toBeLessThan(4.5)
    const c = colorLegible('#ffe14d')
    expect(c).not.toBe('#ffe14d')
    expect(contrasteConBlanco(c)).toBeGreaterThanOrEqual(4.5)
    expect(paletaDeMarca('#ffe14d')['600']).toBe(c)
  })

  it('un color oscuro queda como está, en minúsculas', () => {
    expect(colorLegible('#0B2D6B')).toBe('#0b2d6b')
  })

  it('un color roto vuelve al de ReciclaXP', () => {
    expect(paletaDeMarca('rojo')['600']).toBe('#059669')
  })
})

describe('estiloDeMarca', () => {
  it('devuelve las 11 variables que pisan la paleta eco', () => {
    const e = estiloDeMarca('#0b2d6b')
    expect(Object.keys(e)).toEqual(TONOS.map((t) => `--eco-${t}`))
    expect(e['--eco-600']).toBe('#0b2d6b')
  })
})

describe('colorDominante', () => {
  it('encuentra el azul de un escudo azul y blanco, sin contar el borde negro ni lo transparente', () => {
    const escudo = pixeles([300, 255, 255, 255, 255], [200, 11, 45, 107, 255], [80, 0, 0, 0, 255], [400, 0, 0, 0, 0])
    expect(colorDominante(escudo)).toBe('#0b2d6b')
  })

  it('entre dos colores gana el que más se usa', () => {
    expect(colorDominante(pixeles([100, 200, 30, 30, 255], [150, 11, 45, 107, 255]))).toBe('#0b2d6b')
  })

  it('en una imagen blanca, gris o transparente no hay color', () => {
    expect(colorDominante(pixeles([50, 255, 255, 255, 255], [50, 128, 128, 128, 255], [50, 11, 45, 107, 0]))).toBeNull()
  })
})

describe('la paleta eco pasa por variables (src/index.css)', () => {
  // Sin esto, el panel no puede tomar la marca: Tailwind pegaría el valor fijo en cada clase.
  const css = readFileSync('src/index.css', 'utf8')
  const VALORES = ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22']

  it.each(TONOS.map((t, i) => [t, VALORES[i]]))('eco-%s apunta a su variable, que vale %s', (tono, valor) => {
    expect(css).toContain(`--color-eco-${tono}: var(--eco-${tono});`)
    expect(css).toContain(`--eco-${tono}: ${valor};`)
  })
})
```

`src/store/marcaDelClub.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { useMarcaDelClubStore } from './marcaDelClub'
import { VERSION_DE_LOS_DATOS } from './versionDeDatos'

const clave = claveDeAlmacenamiento('marca-del-club')
// Un escudo de mentira: no es el de ningún club.
const ESCUDO = 'data:image/png;base64,ESCUDO'

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
  localStorage.clear()
})

describe('la marca de cada institución', () => {
  it('se guarda y se borra por institución, sin tocar las otras', () => {
    const { guardar, quitar } = useMarcaDelClubStore.getState()
    guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    guardar('s_otro', { color: '#aa0000' })
    quitar('s_club')
    expect(useMarcaDelClubStore.getState().marcas).toEqual({ s_otro: { color: '#aa0000' } })
  })

  it('queda en el navegador, con su clave y la versión de los datos', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    expect(JSON.parse(localStorage.getItem(clave)!)).toMatchObject({
      state: { marcas: { s_club: { color: '#0b2d6b' } } },
      version: VERSION_DE_LOS_DATOS,
    })
  })

  it('toma lo que otra pestaña escribió', async () => {
    localStorage.setItem(clave, JSON.stringify({ state: { marcas: { s_club: { color: '#0b2d6b' } } }, version: VERSION_DE_LOS_DATOS }))
    window.dispatchEvent(new StorageEvent('storage', { key: clave }))
    await new Promise((r) => setTimeout(r, 20))
    expect(useMarcaDelClubStore.getState().marcas).toEqual({ s_club: { color: '#0b2d6b' } })
  })
})
```

`src/hooks/useMarcaDelPanel.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Sponsor } from '@/types'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'
import { useMarcaDelPanel } from './useMarcaDelPanel'

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
const ESCUDO = 'data:image/png;base64,ESCUDO'

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
  useSessionStore.setState({ commerce: club })
})

describe('useMarcaDelPanel', () => {
  it('devuelve la marca de la institución que entró, con las variables de su paleta', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    const { result } = renderHook(() => useMarcaDelPanel())
    expect(result.current).toMatchObject({ escudo: ESCUDO, color: '#0b2d6b' })
    expect(result.current?.estilo).toMatchObject({ '--eco-600': '#0b2d6b' })
  })

  it('sin marca guardada, no hay marca', () => {
    expect(renderHook(() => useMarcaDelPanel()).result.current).toBeNull()
  })

  it('un comercio no toma marca de club, aunque haya algo guardado con su id', () => {
    useSessionStore.setState({ commerce: { ...club, id: 's_cafe', category: 'comercio' } })
    useMarcaDelClubStore.getState().guardar('s_cafe', { color: '#0b2d6b' })
    expect(renderHook(() => useMarcaDelPanel()).result.current).toBeNull()
  })
})
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `npx vitest run src/lib/marca.test.ts src/store/marcaDelClub.test.ts src/hooks/useMarcaDelPanel.test.tsx > /tmp/t2-rojo.txt 2>&1; echo "exit=$?"`
Expected: `exit=1`, porque no existen los módulos.

- [ ] **Step 3: La paleta `eco-*` por variables**

En `src/index.css`, dentro de `@theme inline`, reemplazá el bloque `/* Brand — Eco green (primario) */` (las 11 líneas `--color-eco-*`) por:

```css
  /* Brand — Eco green (primario). Pasa por variables (:root, abajo): el panel de una institución
     con marca las pisa con la suya (src/lib/marca.ts). Los valores siguen siendo los de siempre. */
  --color-eco-50: var(--eco-50);
  --color-eco-100: var(--eco-100);
  --color-eco-200: var(--eco-200);
  --color-eco-300: var(--eco-300);
  --color-eco-400: var(--eco-400);
  --color-eco-500: var(--eco-500);
  --color-eco-600: var(--eco-600);
  --color-eco-700: var(--eco-700);
  --color-eco-800: var(--eco-800);
  --color-eco-900: var(--eco-900);
  --color-eco-950: var(--eco-950);
```

Y, después del bloque `@theme inline { … }` (antes del `:root` que ya existe), agregá:

```css
/* La paleta eco de ReciclaXP. Un contenedor la pisa con la marca de una institución (src/lib/marca.ts). */
:root {
  --eco-50: #ecfdf5;
  --eco-100: #d1fae5;
  --eco-200: #a7f3d0;
  --eco-300: #6ee7b7;
  --eco-400: #34d399;
  --eco-500: #10b981;
  --eco-600: #059669;
  --eco-700: #047857;
  --eco-800: #065f46;
  --eco-900: #064e3b;
  --eco-950: #022c22;
}
```

- [ ] **Step 4: `src/lib/marca.ts`**

```ts
/**
 * La marca de una institución en su panel: un color y, si lo subió, su escudo. Nada de esto está en
 * el código: lo carga quien usa el panel y queda en su navegador (src/store/marcaDelClub.ts), porque
 * el repo y la demo son públicos. Acá está la lógica pura: la paleta que pisa los tokens eco-* y el
 * color que se toma del escudo.
 */

export const TONOS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
export type Tono = (typeof TONOS)[number]

/** El color de ReciclaXP: el que queda si llega un color roto. */
const COLOR_DE_RECICLAXP = '#059669'

type Rgb = [number, number, number]

function hexARgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbAHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

/** La luminancia relativa de WCAG 2. */
function luminancia([r, g, b]: Rgb): number {
  const lineal = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
}

/** El contraste del texto blanco sobre ese color (de 1 a 21; 4,5 es el mínimo para leer). */
export function contrasteConBlanco(hex: string): number {
  const rgb = hexARgb(hex) ?? hexARgb(COLOR_DE_RECICLAXP)!
  return 1.05 / (luminancia(rgb) + 0.05)
}

/**
 * El color que va en los botones (el 600): el de la marca, oscurecido de a poco si el texto blanco
 * no se lee encima. Un color roto vuelve al de ReciclaXP.
 */
export function colorLegible(hex: string): string {
  const rgb = hexARgb(hex) ?? hexARgb(COLOR_DE_RECICLAXP)!
  for (let paso = 0; paso <= 20; paso++) {
    const c = rgbAHex(rgb.map((v) => v * (1 - paso * 0.05)) as Rgb)
    if (contrasteConBlanco(c) >= 4.5) return c
  }
  return '#000000'
}

/** Los 11 tonos de la marca: los claros mezclan el color con blanco; los oscuros, con negro. */
export function paletaDeMarca(color: string): Record<Tono, string> {
  const c = colorLegible(color)
  const conBlanco = (p: number) => `color-mix(in oklab, ${c} ${p}%, white)`
  const conNegro = (p: number) => `color-mix(in oklab, ${c} ${p}%, black)`
  return {
    '50': conBlanco(8),
    '100': conBlanco(16),
    '200': conBlanco(30),
    '300': conBlanco(48),
    '400': conBlanco(68),
    '500': conBlanco(85),
    '600': c,
    '700': conNegro(85),
    '800': conNegro(70),
    '900': conNegro(55),
    '950': conNegro(40),
  }
}

/** Las variables que pisan la paleta eco en un contenedor: `style={estiloDeMarca(color)}`. */
export function estiloDeMarca(color: string): Record<`--eco-${Tono}`, string> {
  const paleta = paletaDeMarca(color)
  return Object.fromEntries(TONOS.map((t) => [`--eco-${t}`, paleta[t]])) as Record<`--eco-${Tono}`, string>
}

/**
 * El color de un escudo: el más usado entre los que tienen color. No cuenta lo transparente, lo
 * blanco, lo negro ni lo gris. Recibe los bytes RGBA de la imagen (`ImageData.data`). Sin ningún
 * color, devuelve null.
 */
export function colorDominante(pixeles: ArrayLike<number>): string | null {
  const cubetas = new Map<number, { n: number; r: number; g: number; b: number }>()
  for (let i = 0; i + 3 < pixeles.length; i += 4) {
    const r = pixeles[i]
    const g = pixeles[i + 1]
    const b = pixeles[i + 2]
    const a = pixeles[i + 3]
    if (a < 128) continue // transparente
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max < 40) continue // negro
    if (min > 215) continue // blanco
    if (max - min < 40) continue // gris: sin saturación
    // Los parecidos caen en la misma cubeta (16 niveles por canal): los bordes suavizados no compiten.
    const clave = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const c = cubetas.get(clave) ?? { n: 0, r: 0, g: 0, b: 0 }
    c.n++
    c.r += r
    c.g += g
    c.b += b
    cubetas.set(clave, c)
  }
  let mejor: { n: number; r: number; g: number; b: number } | undefined
  for (const c of cubetas.values()) if (!mejor || c.n > mejor.n) mejor = c
  return mejor ? rgbAHex([mejor.r / mejor.n, mejor.g / mejor.n, mejor.b / mejor.n]) : null
}
```

- [ ] **Step 5: `src/store/marcaDelClub.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

const CLAVE = claveDeAlmacenamiento('marca-del-club')

/** La marca que una institución cargó en su panel: su color y, si lo subió, su escudo (data URL PNG). */
export interface MarcaDelClub {
  color: string
  escudo?: string
}

interface MarcaDelClubState {
  /** Por id de la institución. Queda sólo en este navegador: no va al código ni se publica. */
  marcas: Record<string, MarcaDelClub>
  guardar: (sponsorId: string, marca: MarcaDelClub) => void
  quitar: (sponsorId: string) => void
}

export const useMarcaDelClubStore = create<MarcaDelClubState>()(
  persist(
    (set) => ({
      marcas: {},
      guardar: (sponsorId, marca) => set((s) => ({ marcas: { ...s.marcas, [sponsorId]: marca } })),
      quitar: (sponsorId) =>
        set((s) => ({ marcas: Object.fromEntries(Object.entries(s.marcas).filter(([id]) => id !== sponsorId)) })),
    }),
    { name: CLAVE, ...conVersionDeLosDatos<MarcaDelClubState>() },
  ),
)

// El panel suele estar abierto en más de una pestaña: lo que carga una, la otra lo toma sin recargar.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) void useMarcaDelClubStore.persist.rehydrate()
  })
}
```

- [ ] **Step 6: `src/hooks/useMarcaDelPanel.ts`**

```ts
import type { CSSProperties } from 'react'
import { useSessionStore } from '@/store/session'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { estiloDeMarca } from '@/lib/marca'

/**
 * La marca de la institución que entró al panel, si la cargó en «Marca»: su escudo, su color y las
 * variables que pisan la paleta eco. Un comercio no tiene marca de club: devuelve null.
 */
export function useMarcaDelPanel(): { escudo?: string; color: string; estilo: CSSProperties } | null {
  const commerce = useSessionStore((s) => s.commerce)
  const marca = useMarcaDelClubStore((s) => (commerce ? s.marcas[commerce.id] : undefined))
  if (!commerce || !esInstitucion(commerce.category) || !marca) return null
  return { escudo: marca.escudo, color: marca.color, estilo: estiloDeMarca(marca.color) as CSSProperties }
}
```

- [ ] **Step 7: Correr las pruebas y ver el verde**

Run: `npx vitest run src/lib/marca.test.ts src/store/marcaDelClub.test.ts src/hooks/useMarcaDelPanel.test.tsx > /tmp/t2-verde.txt 2>&1; echo "exit=$?"`
Expected: `exit=0`.

Después, la suite entera (que nada del diseño cambió por la paleta), los tipos y el lint:

```bash
npx vitest run > /tmp/t2-suite.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t2-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t2-lint.txt 2>&1; echo "exit=$?"
```

Expected: los tres con `exit=0`.

- [ ] **Step 8: Commit**

```bash
git add src/index.css src/lib/marca.ts src/lib/marca.test.ts src/store/marcaDelClub.ts src/store/marcaDelClub.test.ts src/hooks/useMarcaDelPanel.ts src/hooks/useMarcaDelPanel.test.tsx
git commit -m "feat(marca): la paleta del panel se puede pisar con la marca de una institución, guardada en el navegador" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: La pantalla «Marca» (subir el escudo y elegir el color)

**Files:**
- Create: `src/lib/escudo.ts` y `src/pages/commerce/CommerceMarca.tsx`
- Modify: `src/components/features/CommerceSideNav.tsx:1-40` (el menú) y `src/routes.tsx` (la ruta)
- Test: `src/lib/escudo.test.ts` y `src/pages/commerce/CommerceMarca.test.tsx`

**Interfaces:**
- Consumes (de la tarea 2): `useMarcaDelClubStore` (`marcas`, `guardar(sponsorId, { color, escudo? })`, `quitar(sponsorId)`), `colorLegible(hex)` y `colorDominante(pixeles)`.
- Produces:
  - `prepararEscudo(archivo: File): Promise<{ escudo: string; color: string | null }>`;
  - `class EscudoInvalido extends Error`;
  - `ESCUDO_TOPE_BYTES = 2 * 1024 * 1024`;
  - la ruta `/comercio/marca`;
  - el ítem «Marca» del menú, sólo para las instituciones.

- [ ] **Step 1: Las pruebas que fallan**

`src/lib/escudo.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ESCUDO_TOPE_BYTES, EscudoInvalido, prepararEscudo } from './escudo'

// Lo que usa el canvas no corre en jsdom: acá se prueba lo que se rechaza antes de abrir la imagen.
describe('prepararEscudo', () => {
  it('rechaza lo que no es una imagen', async () => {
    await expect(prepararEscudo(new File(['hola'], 'escudo.txt', { type: 'text/plain' }))).rejects.toThrow(EscudoInvalido)
  })

  it('rechaza un escudo de más de 2 MB', async () => {
    const pesado = new File([new Uint8Array(ESCUDO_TOPE_BYTES + 1)], 'escudo.png', { type: 'image/png' })
    await expect(prepararEscudo(pesado)).rejects.toThrow(/2 MB/)
  })
})
```

`src/pages/commerce/CommerceMarca.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { EscudoInvalido } from '@/lib/escudo'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'
import CommerceMarca from './CommerceMarca'

// jsdom no tiene canvas: leer la imagen se reemplaza; lo que se guarda y se muestra se prueba de verdad.
const preparar = vi.hoisted(() => vi.fn())
vi.mock('@/lib/escudo', async (original) => ({
  ...(await original<typeof import('@/lib/escudo')>()),
  prepararEscudo: preparar,
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
// Un escudo de mentira: no es el de ningún club.
const ESCUDO = 'data:image/png;base64,ESCUDO'
const archivo = () => new File(['x'], 'escudo.png', { type: 'image/png' })

function verMarca(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter initialEntries={['/comercio/marca']}>
      <Routes>
        <Route path="/comercio/marca" element={<CommerceMarca />} />
        <Route path="/comercio" element={<p>Resumen del panel</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
  preparar.mockReset()
})

describe('la marca del club', () => {
  it('subir el escudo lo guarda con el color que sale de él, y se ve', async () => {
    preparar.mockResolvedValue({ escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    expect(await screen.findByRole('img', { name: 'Escudo de Talleres' })).toHaveAttribute('src', ESCUDO)
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#0b2d6b' })
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#0b2d6b')
  })

  it('si del escudo no sale un color, queda el que había', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#aa0000' })
    preparar.mockResolvedValue({ escudo: ESCUDO, color: null })
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    await screen.findByRole('img', { name: 'Escudo de Talleres' })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#aa0000' })
  })

  it('un archivo que no sirve dice por qué, y no guarda nada', async () => {
    preparar.mockRejectedValue(new EscudoInvalido('El escudo pesa más de 2 MB: probá con uno más liviano.'))
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    expect(await screen.findByRole('alert')).toHaveTextContent('pesa más de 2 MB')
    expect(useMarcaDelClubStore.getState().marcas).toEqual({})
  })

  it('el selector cambia el color', () => {
    verMarca()
    fireEvent.change(screen.getByLabelText('Color de la marca'), { target: { value: '#123456' } })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ color: '#123456' })
  })

  it('«Volver a los colores de ReciclaXP» borra la marca', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    fireEvent.click(screen.getByRole('button', { name: /Volver a los colores de ReciclaXP/ }))
    expect(useMarcaDelClubStore.getState().marcas).toEqual({})
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it('avisa que queda sólo en este navegador y que la marca es del club', () => {
    verMarca()
    expect(screen.getByText(/Se guarda sólo en este navegador: no se publica/)).toBeInTheDocument()
    expect(screen.getByText(/usalos con su permiso/)).toBeInTheDocument()
  })

  it('un comercio no tiene marca de club: lo manda al resumen', async () => {
    verMarca({ ...club, id: 's_cafe', category: 'comercio' })
    expect(await screen.findByText('Resumen del panel')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `npx vitest run src/lib/escudo.test.ts src/pages/commerce/CommerceMarca.test.tsx > /tmp/t3-rojo.txt 2>&1; echo "exit=$?"`
Expected: `exit=1`, porque no existen los módulos.

- [ ] **Step 3: `src/lib/escudo.ts`**

```ts
import { colorDominante } from './marca'

/** El escudo más pesado que se acepta. */
export const ESCUDO_TOPE_BYTES = 2 * 1024 * 1024
/** El lado más largo del escudo guardado: alcanza para el menú, el encabezado y el PDF. */
const LADO = 256
const TIPOS = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

/** Un escudo que no se puede usar, con un mensaje para quien lo subió. */
export class EscudoInvalido extends Error {}

/**
 * Lee el escudo que sube el club, lo achica a 256 px de lado (un SVG se dibuja a ese tamaño) y toma
 * su color. Devuelve el escudo como data URL PNG, para guardarlo en el navegador. Sólo corre en el
 * navegador: usa canvas.
 */
export async function prepararEscudo(archivo: File): Promise<{ escudo: string; color: string | null }> {
  if (!TIPOS.includes(archivo.type)) throw new EscudoInvalido('El escudo tiene que ser una imagen PNG, JPG, SVG o WebP.')
  if (archivo.size > ESCUDO_TOPE_BYTES) throw new EscudoInvalido('El escudo pesa más de 2 MB: probá con uno más liviano.')
  const url = URL.createObjectURL(archivo)
  try {
    const img = await cargarImagen(url)
    const ancho = img.naturalWidth || LADO
    const alto = img.naturalHeight || LADO
    // Una imagen de píxeles no se agranda (se vería borrosa); un SVG sí, porque no pierde.
    const escala = archivo.type === 'image/svg+xml' ? LADO / Math.max(ancho, alto) : Math.min(1, LADO / Math.max(ancho, alto))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(ancho * escala))
    canvas.height = Math.max(1, Math.round(alto * escala))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new EscudoInvalido('Este navegador no pudo leer la imagen.')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const color = colorDominante(ctx.getImageData(0, 0, canvas.width, canvas.height).data)
    return { escudo: canvas.toDataURL('image/png'), color }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new EscudoInvalido('No se pudo abrir la imagen del escudo.'))
    img.src = src
  })
}
```

- [ ] **Step 4: `src/pages/commerce/CommerceMarca.tsx`**

```tsx
import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ImageUp, RotateCcw } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { colorLegible } from '@/lib/marca'
import { EscudoInvalido, prepararEscudo } from '@/lib/escudo'
import { Button } from '@/components/ui/button'

/** El color de ReciclaXP: el de una institución que todavía no eligió el suyo. */
const COLOR_DE_RECICLAXP = '#059669'

/**
 * La marca del club: sube su escudo y elige su color, y todo su panel y su informe los usan. Queda
 * sólo en este navegador, como los beneficios y los productos de la demo: no va al código ni a la
 * dirección publicada, que son públicos.
 */
export default function CommerceMarca() {
  const commerce = useSessionStore((s) => s.commerce)
  const marca = useMarcaDelClubStore((s) => (commerce ? s.marcas[commerce.id] : undefined))
  const guardar = useMarcaDelClubStore((s) => s.guardar)
  const quitar = useMarcaDelClubStore((s) => s.quitar)
  const [leyendo, setLeyendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio" replace />

  const id = commerce.id
  const color = marca?.color ?? COLOR_DE_RECICLAXP

  async function subir(archivo: File | undefined) {
    if (!archivo) return
    setError(null)
    setLeyendo(true)
    try {
      const leido = await prepararEscudo(archivo)
      guardar(id, { escudo: leido.escudo, color: leido.color ?? color })
      toast.success(leido.color ? 'Listo: el panel ya usa tu escudo y su color' : 'Listo: subimos el escudo. Elegí el color abajo.')
    } catch (e) {
      setError(e instanceof EscudoInvalido ? e.message : 'No se pudo leer el escudo. Probá con otra imagen.')
    } finally {
      setLeyendo(false)
      if (entrada.current) entrada.current.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">La marca de {commerce.name}</h1>
        <p className="text-sm text-muted-foreground">Tu escudo y tus colores, en todo el panel y en el informe.</p>
      </div>

      <section aria-labelledby="marca-escudo" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="marca-escudo" className="font-bold">
          Escudo
        </h2>
        <div className="mt-3 flex items-center gap-4">
          {marca?.escudo ? (
            <img src={marca.escudo} alt={`Escudo de ${commerce.name}`} className="h-20 w-20 shrink-0 object-contain" />
          ) : (
            <span
              aria-hidden
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-eco-600 text-3xl font-extrabold text-white"
            >
              {commerce.name[0]}
            </span>
          )}
          <div className="space-y-2">
            <input
              ref={entrada}
              type="file"
              aria-label="Archivo del escudo"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="sr-only"
              onChange={(e) => void subir(e.target.files?.[0])}
            />
            <Button type="button" onClick={() => entrada.current?.click()} disabled={leyendo}>
              <ImageUp size={18} /> {marca?.escudo ? 'Cambiar el escudo' : 'Subir el escudo'}
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG o WebP, hasta 2 MB.</p>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </section>

      <section aria-labelledby="marca-color" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="marca-color" className="font-bold">
          Color
        </h2>
        <p className="text-sm text-muted-foreground">Sale del escudo. Si querés otro, elegilo acá.</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="color"
            aria-label="Color de la marca"
            value={color}
            onChange={(e) => guardar(id, { ...marca, color: e.target.value })}
            className="h-11 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
          />
          <span className="font-mono text-sm">{color}</span>
        </div>
        {colorLegible(color) !== color.toLowerCase() && (
          <p className="mt-2 text-xs text-muted-foreground">
            En los botones va un poco más oscuro, para que el texto blanco se lea.
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Se guarda sólo en este navegador: no se publica. El escudo y los colores son del club; usalos con su permiso.
        </p>
        {marca && (
          <Button type="button" variant="secondary" onClick={() => quitar(id)}>
            <RotateCcw size={16} /> Volver a los colores de ReciclaXP
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: El menú y la ruta**

En `src/components/features/CommerceSideNav.tsx`:
- **El import:** sumá `Palette` a los íconos de `lucide-react`.
- **`COMMERCE_NAV`:** entre «Reportes» y «Plan», agregá `{ to: '/comercio/marca', label: 'Marca', icon: Palette },`.
- **`navDelPanel`:** reemplazá su comentario y su cuerpo por:

```tsx
/** Lo que es sólo de un club o un estadio: lo que construye la hinchada y la marca del club. */
const SOLO_INSTITUCIONES = new Set(['/comercio/productos', '/comercio/marca'])

/**
 * El menú del panel: el del escritorio y el del celular salen de acá, para que no difieran.
 * En la demo del club no está «Plan» (ver `muestraPrecios`), y «Productos» y «Marca» son sólo de
 * las instituciones: un comercio no tiene hinchada ni escudo de club.
 */
export function navDelPanel(escenario: Escenario = ESCENARIO, categoria?: string) {
  return COMMERCE_NAV.filter(
    (i) =>
      (i.to !== '/comercio/plan' || muestraPrecios(escenario)) &&
      (!SOLO_INSTITUCIONES.has(i.to) || esInstitucion(categoria)),
  )
}
```

En `src/routes.tsx`:
- **La carga diferida:** junto a las otras pantallas del panel, agregá `const CommerceMarca = lazyWithRetry(() => import('@/pages/commerce/CommerceMarca'))`.
- **La ruta:** en los hijos de `CommerceLayout`, después de `reportes`, agregá `{ path: 'marca', element: withSuspense(<CommerceMarca />) },`.

- [ ] **Step 6: Correr las pruebas y ver el verde**

Run: `npx vitest run src/lib/escudo.test.ts src/pages/commerce/CommerceMarca.test.tsx src/components/features/menuDelPanel.test.tsx > /tmp/t3-verde.txt 2>&1; echo "exit=$?"`
Expected: `exit=0`.

Después, la suite entera, los tipos y el lint (los tres con `exit=0`):

```bash
npx vitest run > /tmp/t3-suite.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t3-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t3-lint.txt 2>&1; echo "exit=$?"
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/escudo.ts src/lib/escudo.test.ts src/pages/commerce/CommerceMarca.tsx src/pages/commerce/CommerceMarca.test.tsx src/components/features/CommerceSideNav.tsx src/routes.tsx
git commit -m "feat(marca): «Marca» en el panel del club: sube su escudo y elige su color, guardados en el navegador" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: La marca en todo el panel y en el informe

**Files:**
- Create: `src/components/features/EscudoDelPanel.tsx`
- Modify:
  - `src/components/features/CommerceLayout.tsx`: el contenedor y el encabezado del celular;
  - `src/components/features/CommerceSideNav.tsx`: el avatar;
  - `src/pages/commerce/CommerceInforme.tsx`: el encabezado del informe.
- Test: `src/components/features/marcaDelPanel.test.tsx`

**Interfaces:**
- Consumes (de la tarea 2): `useMarcaDelPanel(): { escudo?: string; color: string; estilo: CSSProperties } | null`.
- Produces: `EscudoDelPanel({ className }: { className?: string })`.
  - Con un escudo cargado, muestra `<img alt="Escudo de <nombre>">`.
  - Si no, la inicial en un cuadrado del color de la marca, o del `brandColor` sin marca.

- [ ] **Step 1: La prueba que falla**

`src/components/features/marcaDelPanel.test.tsx`:

```tsx
// La marca que el club carga en «Marca» se ve en todo su panel: los colores, en el contenedor; el
// escudo, en la barra lateral, en el encabezado del celular y en el informe. Sin marca, como siempre.
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { router } from '@/routes'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([]),
    getSponsors: () => Promise.resolve([]),
    getProjects: () => Promise.resolve([]),
    getProjectTrace: () => Promise.resolve([]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
// Un escudo de mentira: no es el de ningún club.
const ESCUDO = 'data:image/png;base64,ESCUDO'

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
})

/** Espera el título: si la prueba termina antes de que cargue, la carga diferida queda colgada. */
async function verElPanelEn(ruta: string, titulo: string, sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  const { container } = render(<RouterProvider router={createMemoryRouter(router.routes, { initialEntries: [ruta] })} />)
  await screen.findByRole('heading', { level: 1, name: titulo })
  return container
}

/** El contenedor que lleva la paleta de la marca, si la hay. */
const conMarca = (c: HTMLElement) => c.querySelector<HTMLElement>('[style*="--eco-600"]')

describe('la marca del club en su panel', () => {
  it('con marca, el panel toma su color y muestra el escudo en los dos menús y en el informe', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)?.style.getPropertyValue('--eco-600')).toBe('#0b2d6b')
    // La barra lateral, el encabezado del celular y el encabezado del informe.
    expect(screen.getAllByRole('img', { name: 'Escudo de Talleres' })).toHaveLength(3)
  })

  it('con color y sin escudo, toma el color y deja la inicial', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).not.toBeNull()
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it('sin marca, todo como siempre: sin variables y sin escudo', async () => {
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).toBeNull()
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it('un comercio no toma una marca de club', async () => {
    useMarcaDelClubStore.getState().guardar('s_cafe', { color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Reportes', { ...club, id: 's_cafe', name: 'Café', category: 'comercio' })
    expect(conMarca(c)).toBeNull()
  })

  it('la ruta real /comercio/marca existe y cuelga del panel', async () => {
    await verElPanelEn('/comercio/marca', 'La marca de Talleres')
  })
})
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/components/features/marcaDelPanel.test.tsx > /tmp/t4-rojo.txt 2>&1; echo "exit=$?"`

Expected: `exit=1`. Fallan las pruebas «con marca…» y «con color y sin escudo…»: el panel todavía no toma la marca. La de la ruta ya pasa, por la tarea 3.

- [ ] **Step 3: `src/components/features/EscudoDelPanel.tsx`**

```tsx
import { useSessionStore } from '@/store/session'
import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'
import { cn } from '@/lib/utils'

/**
 * El escudo de la institución en el panel, si lo subió en «Marca»; si no, su inicial en un cuadrado
 * de su color. Lo usan la barra lateral y el encabezado del celular.
 */
export function EscudoDelPanel({ className }: { className?: string }) {
  const commerce = useSessionStore((s) => s.commerce)
  const marca = useMarcaDelPanel()
  if (!commerce) return null
  if (marca?.escudo) {
    return <img src={marca.escudo} alt={`Escudo de ${commerce.name}`} className={cn('shrink-0 object-contain', className)} />
  }
  return (
    <span
      aria-hidden
      // Con marca, el cuadrado toma su 600 (ya legible con texto blanco); sin marca, el color de siempre.
      className={cn('grid shrink-0 place-items-center rounded-xl font-extrabold text-white', marca && 'bg-eco-600', className)}
      style={marca ? undefined : { backgroundColor: commerce.brandColor }}
    >
      {commerce.name[0]}
    </span>
  )
}
```

- [ ] **Step 4: El panel toma la marca**

En `src/components/features/CommerceLayout.tsx`:
- **Los imports:** sumá `import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'` e `import { EscudoDelPanel } from './EscudoDelPanel'`.
- **El hook:** antes de `if (!commerce) return null`, agregá `const marca = useMarcaDelPanel()`.
- **El contenedor:** `<div className="min-h-dvh bg-background lg:flex">` pasa a `<div className="min-h-dvh bg-background lg:flex" style={marca?.estilo}>`.
- **El encabezado del celular:** reemplazá el `<span className="grid h-9 w-9 …" style={{ backgroundColor: commerce.brandColor }}>{commerce.name[0]}</span>` por `<EscudoDelPanel className="h-9 w-9 text-base" />`.

En `src/components/features/CommerceSideNav.tsx`, el `<span className="grid h-10 w-10 …" style={{ backgroundColor: commerce.brandColor }}>{commerce.name[0]}</span>` pasa a ser `<EscudoDelPanel className="h-10 w-10 text-base" />`, con su import (`import { EscudoDelPanel } from './EscudoDelPanel'`).

En `src/pages/commerce/CommerceInforme.tsx`:
- **El import:** sumá `import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'`.
- **El hook:** junto a los otros, antes de los `return` tempranos, agregá `const marca = useMarcaDelPanel()`.
- **El encabezado:** en el `<header>` del informe, reemplazá el `<div className="min-w-0">` que tiene el nombre, el título y la fecha por:

```tsx
            <div className="flex min-w-0 items-start gap-3">
              {/* El escudo que el club subió en «Marca»: sale también en el PDF */}
              {marca?.escudo && (
                <img
                  src={marca.escudo}
                  alt={`Escudo de ${commerce.name}`}
                  className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                  {commerce.name} · reciclaje con la hinchada
                </p>
                <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">Informe para la Comisión Directiva</h1>
                <p className="mt-1 text-sm text-muted-foreground">Emitido el {emitido}</p>
              </div>
            </div>
```

- [ ] **Step 5: Correr las pruebas y ver el verde**

Run: `npx vitest run src/components/features/marcaDelPanel.test.tsx src/pages/commerce/CommerceInforme.test.tsx src/components/features/menuDelPanel.test.tsx > /tmp/t4-verde.txt 2>&1; echo "exit=$?"`
Expected: `exit=0`.

Después, la suite entera, el escenario del club, los tipos y el lint (los cuatro con `exit=0`):

```bash
npx vitest run > /tmp/t4-suite.txt 2>&1; echo "exit=$?"
VITE_ESCENARIO=club npx vitest run src/components/features/marcaDelPanel.test.tsx src/pages/commerce/CommerceMarca.test.tsx src/store/marcaDelClub.test.ts src/pages/commerce/CommerceReports.test.tsx > /tmp/t4-club.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t4-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t4-lint.txt 2>&1; echo "exit=$?"
```

- [ ] **Step 6: Commit**

```bash
git add src/components/features/EscudoDelPanel.tsx src/components/features/CommerceLayout.tsx src/components/features/CommerceSideNav.tsx src/pages/commerce/CommerceInforme.tsx src/components/features/marcaDelPanel.test.tsx
git commit -m "feat(marca): el panel del club y su informe usan su escudo y sus colores" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5 (la hace el controlador): docs, guion y verificación

- **`work-agent/11-HISTORIAL.md`:** el bullet de la rama.
- **`work-agent/03-DESIGN-SYSTEM.md`:** la paleta `eco-*` pasa por variables, y una institución la pisa con su marca.
- **`docs/producto/prometido-vs-demo.md`:** la fila «Panel de institución (club)», con la marca propia cargada en el navegador.
- **El guion privado:** el paso de Reportes, y «Marca» antes de la reunión o en vivo.
- **En el navegador:** las capturas a 390 y 1280 px, en oscuro y el PDF, con un escudo de prueba, no el del club.
