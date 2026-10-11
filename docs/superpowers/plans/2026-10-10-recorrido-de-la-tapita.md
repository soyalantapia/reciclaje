# El recorrido de tu tapita · plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la trazabilidad de los proyectos «banco» como «el recorrido de tu tapita»: una línea de cal vertical sobre césped, con tu tapita en ámbar en la etapa actual, la siguiente destacada y el banco como destino.

**Architecture:**
- La lógica va en un módulo puro con pruebas (`src/lib/recorridoDeLaTapita.ts`).
- La pantalla es un componente nuevo (`RecorridoDeLaTapita`) que compone `Cancha` y `BancoDeTapitas`, que ya existen.
- La página elige entre ese componente (banco) y `TraceabilityTimeline` (lo demás).

**Tech Stack:** React 19, TypeScript, Tailwind 4, framer-motion 12, Vitest con jsdom y Testing Library.

**Diseño:** `docs/superpowers/specs/2026-10-10-recorrido-de-la-tapita-design.md`

## Global Constraints

- **Ningún número nuevo:**
  - las etapas salen de `api.getProjectTrace` con `conAporteDeLaSesionEnLaTraza`;
  - el proyecto, de `api.getProject` con `conAportesDeLaSesion`;
  - el punto, de los aportes de la sesión o del historial.
- **Prohibido:** «en vivo», «tiempo real», fechas inventadas para etapas pendientes, colores o escudo del club, marcas reales.
- **Movimiento:** con `useReducedMotion()` no se anima nada.
- **HTML:** la línea de cal NO va como hija directa de un `<ol>`. Va en un `<div className="relative">` que envuelve al `<ol>`.
- **Textos:** en español rioplatense.
- **Sin pipes al leer resultados:** `npx vitest run > $SP/x.txt 2>&1; echo $?`, con `SP=/private/tmp/claude-501/-Users-alannaimtapia-dev-speed-sonar-fix/19e2e349-5746-4871-ab4c-f9c155649458/scratchpad`.
- **Lugar de trabajo:** `~/.reunion/worktrees/reciclaxp-tareas/recorrido`, rama `feat/recorrido-de-la-tapita`. No se pushea.

---

### Task 1: La lógica del recorrido

**Files:**
- Create:
  - `src/lib/recorridoDeLaTapita.ts`
  - `src/lib/recorridoDeLaTapita.test.ts`
- Modify: `src/lib/aportesDeLaSesion.ts:9`. Exportar `esAporte`: cambiar `const esAporte =` por `export const esAporte =`.

**Interfaces:**
- Produces:
  - `interface EstadoDelRecorrido { actual: number; siguiente: number | null; total: number }`
  - `estadoDelRecorrido(eventos: TraceEvent[]): EstadoDelRecorrido`
  - `puntoDeTuTapita(proyecto: ImpactProject, actividad: ActivityItem[], historial: Contribution[]): string | undefined`

- [ ] **Step 1: Write the failing test** (`src/lib/recorridoDeLaTapita.test.ts`)

```ts
import { describe, expect, it } from 'vitest'
import type { Contribution, ImpactProject, TraceEvent } from '@/types'
import { estadoDelRecorrido, puntoDeTuTapita } from './recorridoDeLaTapita'

const etapa = (stage: TraceEvent['stage'], done: boolean): TraceEvent => ({ stage, title: stage, detail: '', date: done ? '2026-10-04' : null, done })
const siete = (hechas: boolean[]) =>
  (['aporte', 'validacion', 'lote', 'retiro', 'clasificacion', 'transformacion', 'producto'] as const).map((s, i) => etapa(s, hechas[i] ?? false))

describe('estadoDelRecorrido', () => {
  it('con sólo el aporte hecho, tu tapita está en la etapa 1 y lo que sigue es la 2', () => {
    expect(estadoDelRecorrido(siete([true]))).toEqual({ actual: 0, siguiente: 1, total: 7 })
  })
  it('con todo hecho no hay etapa siguiente', () => {
    expect(estadoDelRecorrido(siete([true, true, true, true, true, true, true]))).toEqual({ actual: 6, siguiente: null, total: 7 })
  })
  it('sin nada hecho, tu tapita no entró y lo que sigue es la primera', () => {
    expect(estadoDelRecorrido(siete([]))).toEqual({ actual: -1, siguiente: 0, total: 7 })
  })
  it('la actual es la última hecha, aunque haya un hueco antes', () => {
    expect(estadoDelRecorrido(siete([true, false, true]))).toEqual({ actual: 2, siguiente: 3, total: 7 })
  })
})

const proyecto = { id: 'pr_banco_club', material: 'tapitas' } as ImpactProject
const aporte = (c: Partial<Contribution>): Contribution => ({
  id: 'c', userId: 'u_me', pointId: 'p', pointName: 'Punto R · Estadio', sponsorId: 's_club', sponsorName: 'Club',
  material: 'tapitas', units: 50, xpEarned: 100, projectId: 'pr_banco_club', status: 'pendiente',
  createdAt: '2026-10-04T19:30:00-03:00', ...c,
})

describe('puntoDeTuTapita', () => {
  it('usa el aporte más reciente de la sesión a ese proyecto', () => {
    const sesion = [aporte({ id: 'a', pointName: 'Punto R · Sede social', createdAt: '2026-10-13T10:00:00-03:00' }), aporte({ id: 'b', pointName: 'Punto R · Estadio', createdAt: '2026-10-13T12:00:00-03:00' })]
    expect(puntoDeTuTapita(proyecto, sesion, [])).toBe('Punto R · Estadio')
  })
  it('sin sesión, usa el historial', () => {
    expect(puntoDeTuTapita(proyecto, [], [aporte({ pointName: 'Punto R · Sede social' })])).toBe('Punto R · Sede social')
  })
  it('ignora otros proyectos y otros materiales, y sin nada no nombra un punto', () => {
    expect(puntoDeTuTapita(proyecto, [aporte({ projectId: 'otro' }), aporte({ material: 'plastico' })], [])).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/recorridoDeLaTapita.test.ts > $SP/r1.txt 2>&1; echo $?`
Expected: exit 1, porque no existe `./recorridoDeLaTapita`.

- [ ] **Step 3: Implement** (`src/lib/recorridoDeLaTapita.ts`)

```ts
import type { ActivityItem, Contribution, ImpactProject, TraceEvent } from '@/types'
import { esAporte } from './aportesDeLaSesion'

/** Dónde está tu tapita en el recorrido: la última etapa hecha, la que sigue y cuántas hay. */
export interface EstadoDelRecorrido {
  /** Índice de la última etapa hecha; -1 si todavía no entró al recorrido. */
  actual: number
  /** Índice de la primera etapa no hecha después de `actual`; `null` si ya llegó al final. */
  siguiente: number | null
  total: number
}

export function estadoDelRecorrido(eventos: TraceEvent[]): EstadoDelRecorrido {
  let actual = -1
  eventos.forEach((e, i) => {
    if (e.done) actual = i
  })
  const siguiente = eventos.findIndex((e, i) => i > actual && !e.done)
  return { actual, siguiente: siguiente === -1 ? null : siguiente, total: eventos.length }
}

/**
 * El punto donde la persona dejó su tapita: el aporte más reciente de esta sesión a ese proyecto
 * (y su material); si no hay, el de su historial. Sin ninguno, no se nombra un punto.
 */
export function puntoDeTuTapita(
  proyecto: ImpactProject,
  actividad: ActivityItem[],
  historial: Contribution[],
): string | undefined {
  const delProyecto = (c: Contribution) => c.projectId === proyecto.id && c.material === proyecto.material
  const masReciente = (lista: Contribution[]) =>
    [...lista].filter(delProyecto).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  return (masReciente(actividad.filter(esAporte)) ?? masReciente(historial))?.pointName
}
```

En `src/lib/aportesDeLaSesion.ts`, cambiar `const esAporte = (item: ActivityItem): item is Contribution => !('kind' in item)` por `export const esAporte = (item: ActivityItem): item is Contribution => !('kind' in item)`.

- [ ] **Step 4: Run tests** — el archivo nuevo (7 passed) y la suite completa una vez: `npx vitest run > $SP/r1-full.txt 2>&1; echo $?`. Después, `npx tsc -b`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/recorridoDeLaTapita.ts src/lib/recorridoDeLaTapita.test.ts src/lib/aportesDeLaSesion.ts
git commit -m "feat(recorrido): dónde está tu tapita y qué etapa sigue"
```

---

### Task 2: El componente «El recorrido de tu tapita»

**Files:**
- Create:
  - `src/components/features/iconosDeEtapa.ts`
  - `src/components/features/RecorridoDeLaTapita.tsx`
  - `src/components/features/RecorridoDeLaTapita.test.tsx`
- Modify: `src/components/features/TraceabilityTimeline.tsx`. Usar `ICONO_DE_ETAPA` del archivo nuevo en lugar de su `STAGE_ICON` local, y sacar los imports de íconos que dejen de usarse.

**Interfaces:**
- Consumes:
  - `estadoDelRecorrido` (Task 1);
  - `Cancha({ children, className?, conLinea? })`;
  - `BancoDeTapitas({ progreso, propias, animarTuyas?, className? })`;
  - `formatNumber`, `formatDate`, `pct`, `cn` de `@/lib/utils`.
- Produces: `RecorridoDeLaTapita({ eventos: TraceEvent[]; proyecto: ImpactProject; punto?: string; propias: number })`. Cada `<li>` lleva `data-actual` y `data-siguiente`, y la actual, `aria-current="step"`.

- [ ] **Step 1: Write the failing test** (`src/components/features/RecorridoDeLaTapita.test.tsx`)

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject, TraceEvent } from '@/types'
import { RecorridoDeLaTapita } from './RecorridoDeLaTapita'

const proyecto = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club', sponsorName: 'Club',
  description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42840,
  myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

const eventos: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas dejadas en el Punto R · Estadio.', date: '2026-10-04', done: true },
  { stage: 'validacion', title: 'Pesaje del lote', detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.', date: null, done: false, operator: 'Club' },
  { stage: 'lote', title: 'Lote del partido', detail: 'Los aportes del partido quedan agrupados en un lote.', date: null, done: false },
  { stage: 'producto', title: 'Instalación', detail: 'El banco se instala en el Estadio.', date: null, done: false },
]

describe('RecorridoDeLaTapita', () => {
  it('dice dónde está tu tapita, qué sigue y quién lo hace', () => {
    const { container } = render(<RecorridoDeLaTapita eventos={eventos} proyecto={proyecto} punto="Punto R · Estadio" propias={640 / 42840} />)
    const t = container.textContent ?? ''
    expect(t).toContain('El recorrido de tu tapita')
    expect(t).toContain('Tu tapita está en el Punto R · Estadio')
    expect(t).toContain('Lo que sigue: pesaje del lote, a cargo de Club')
    expect(t).toContain('Etapa 1 de 4')
    expect(container.querySelector('li[aria-current="step"]')?.textContent).toContain('Tu aporte')
    expect(container.querySelector('li[data-siguiente="true"]')?.textContent).toContain('lo que sigue')
  })

  it('las etapas pendientes no tienen fecha inventada, y el destino muestra el mismo avance', () => {
    const { container } = render(<RecorridoDeLaTapita eventos={eventos} proyecto={proyecto} propias={0} />)
    const t = container.textContent ?? ''
    expect(container.querySelectorAll('li').length).toBe(4)
    expect(t.match(/pendiente/g)?.length).toBe(3)
    expect(t).toContain('42.840 de 300.000 tapitas · 14%')
    expect(t).toContain('Tu tapita ya está en el recorrido')
    expect(t).not.toMatch(/en vivo|tiempo real/i)
  })

  it('la línea de cal no es hija directa de la lista', () => {
    const { container } = render(<RecorridoDeLaTapita eventos={eventos} proyecto={proyecto} propias={0} />)
    expect(container.querySelector('ol > span')).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/features/RecorridoDeLaTapita.test.tsx > $SP/r2.txt 2>&1; echo $?`
Expected: exit 1, porque no existe `./RecorridoDeLaTapita`.

- [ ] **Step 3: Implement**

`src/components/features/iconosDeEtapa.ts`:

```ts
import { Boxes, CheckCircle2, Factory, MapPin, PackageCheck, Recycle, Truck, type LucideIcon } from 'lucide-react'
import type { TraceStage } from '@/types'

/** El ícono de cada etapa del recorrido del material. */
export const ICONO_DE_ETAPA: Record<TraceStage, LucideIcon> = {
  aporte: MapPin,
  validacion: CheckCircle2,
  lote: Boxes,
  retiro: Truck,
  clasificacion: Recycle,
  transformacion: Factory,
  producto: PackageCheck,
}
```

En `TraceabilityTimeline.tsx`:
- borrar `const STAGE_ICON …` y el import de los siete íconos;
- importar `import { ICONO_DE_ETAPA } from './iconosDeEtapa'`;
- usar `const Icon = ICONO_DE_ETAPA[ev.stage]`.

`src/components/features/RecorridoDeLaTapita.tsx`:

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ImpactProject, TraceEvent } from '@/types'
import { estadoDelRecorrido } from '@/lib/recorridoDeLaTapita'
import { cn, formatDate, formatNumber, pct } from '@/lib/utils'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { ICONO_DE_ETAPA } from './iconosDeEtapa'

/**
 * La trazabilidad de un banco contada como el recorrido de tu tapita: una línea de cal sobre
 * césped, tu tapita en ámbar en la etapa donde está hoy, la que sigue destacada (con quién la
 * hace) y el banco como destino, con el mismo avance que el inicio. Las etapas que faltan dicen
 * «pendiente», sin fechas inventadas. Con movimiento reducido no se anima nada.
 */
export function RecorridoDeLaTapita({
  eventos,
  proyecto,
  punto,
  propias,
}: {
  eventos: TraceEvent[]
  proyecto: ImpactProject
  punto?: string
  propias: number
}) {
  const reduce = useReducedMotion()
  const { actual, siguiente, total } = estadoDelRecorrido(eventos)
  const proximo = siguiente === null ? undefined : eventos[siguiente]
  const avance = proyecto.goalUnits > 0 ? proyecto.collectedUnits / proyecto.goalUnits : 0

  return (
    <Cancha conLinea className="p-4 pt-6 sm:p-5 sm:pt-7">
      <p className="text-xs font-bold text-eco-800 dark:text-eco-200">Trazabilidad · {proyecto.sponsorName}</p>
      <h1 className="text-2xl font-extrabold leading-tight text-eco-950 dark:text-eco-50">El recorrido de tu tapita</h1>

      <div className="mt-3 space-y-1 rounded-xl bg-card/90 p-3 text-sm">
        <p className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 shrink-0 rounded-full bg-xp-400 ring-1 ring-xp-600" />
          {punto ? (
            <span>
              Tu tapita está en el <b className="font-bold">{punto}</b>
            </span>
          ) : (
            <span>Tu tapita ya está en el recorrido</span>
          )}
        </p>
        {proximo && (
          <p>
            Lo que sigue: <b className="font-bold">{proximo.title.toLowerCase()}</b>
            {proximo.operator ? `, a cargo de ${proximo.operator}` : ''}
          </p>
        )}
        {actual >= 0 && (
          <p className="text-xs text-muted-foreground">
            Etapa {actual + 1} de {total}
          </p>
        )}
      </div>

      {/* La línea de cal va en el contenedor, no dentro de la lista */}
      <div className="relative mt-5">
        <span aria-hidden className="absolute bottom-3 left-[15px] top-2 w-[3px] rounded-full bg-cal" />
        <ol className="space-y-3 pl-10">
          {eventos.map((ev, i) => {
            const esActual = i === actual
            const esSiguiente = i === siguiente
            const Icono = ICONO_DE_ETAPA[ev.stage]
            return (
              <li
                key={ev.stage}
                data-actual={esActual}
                data-siguiente={esSiguiente}
                aria-current={esActual ? 'step' : undefined}
                className={cn('relative', esSiguiente && 'rounded-xl bg-card px-3 py-2 ring-2 ring-xp-400')}
              >
                {esActual ? (
                  <motion.span
                    aria-hidden
                    className="absolute -left-[37px] top-0 h-7 w-7 rounded-full bg-xp-400 ring-2 ring-xp-600"
                    initial={reduce ? false : { y: -48, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border-2',
                      ev.done
                        ? 'border-eco-600 bg-eco-600 text-white'
                        : 'border-eco-300 bg-card dark:border-eco-700',
                    )}
                  >
                    {ev.done && <Check size={12} strokeWidth={3} />}
                  </span>
                )}
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-eco-950 dark:text-eco-50">
                  <Icono size={15} aria-hidden className="text-eco-700 dark:text-eco-300" />
                  {ev.title}
                  {esSiguiente && (
                    <span className="rounded-full bg-xp-100 px-2 py-0.5 text-[11px] font-bold text-xp-700">lo que sigue</span>
                  )}
                </p>
                {(ev.done || esSiguiente) && (
                  <p className="text-xs text-eco-800 dark:text-eco-200">{ev.detail}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {ev.date ? formatDate(ev.date) : 'pendiente'}
                  {ev.operator ? ` · ${ev.operator}` : ''}
                </p>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-5 rounded-xl bg-card/90 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-eco-800 dark:text-eco-200">El destino</p>
        <p className="text-sm font-bold">{proyecto.title}</p>
        <BancoDeTapitas className="mt-2 max-w-xs" progreso={avance} propias={propias} />
        <p className="mt-1 text-xs text-muted-foreground">
          {formatNumber(proyecto.collectedUnits)} de {formatNumber(proyecto.goalUnits)} {proyecto.unitLabel} ·{' '}
          {pct(proyecto.collectedUnits, proyecto.goalUnits)}%
        </p>
      </div>
    </Cancha>
  )
}
```

- [ ] **Step 4: Run tests** — el archivo nuevo (3 passed), la suite completa una vez, `npx tsc -b` y `npx eslint` sobre los archivos tocados.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/iconosDeEtapa.ts src/components/features/RecorridoDeLaTapita.tsx src/components/features/RecorridoDeLaTapita.test.tsx src/components/features/TraceabilityTimeline.tsx
git commit -m "feat(recorrido): la línea de cal con tu tapita, lo que sigue y el banco como destino"
```

---

### Task 3: La página de trazabilidad usa el recorrido para los bancos

**Files:**
- Modify: `src/pages/Traceability.tsx`
- Test: `src/pages/Traceability.test.tsx`

**Interfaces:**
- Consumes:
  - `RecorridoDeLaTapita` (Task 2);
  - `puntoDeTuTapita` (Task 1);
  - `conAportesDeLaSesion(project, actividad, nombre?)`;
  - `useSessionStore`;
  - `api.getContributions()`.

- [ ] **Step 1: Write the failing test** (`src/pages/Traceability.test.tsx`)

Usar el mismo patrón que `src/pages/commerce/CommerceResumen.test.tsx`:
- un `localStorage` en memoria instalado con `vi.hoisted`;
- `vi.mock('@/services/api', async (orig) => ({ ...(await orig()), api: { … } }))`, con `getProject`, `getProjectTrace` y `getContributions` resolviendo fixtures;
- `getContributions` devuelve un aporte del usuario al banco en «Punto R · Estadio».

Renderizar con:

```tsx
<MemoryRouter initialEntries={['/trazabilidad/pr_banco_club']}>
  <Routes><Route path="/trazabilidad/:projectId" element={<Traceability />} /></Routes>
</MemoryRouter>
```

Casos:
1. **Proyecto banco:**
   - `findByText('El recorrido de tu tapita')`;
   - el texto contiene «Tu tapita está en el Punto R · Estadio» y «lo que sigue»;
   - sigue el enlace «Volver al proyecto».
2. **Proyecto que no es banco** (`illustration: 'totem'`):
   - aparece el encabezado «Trazabilidad» de hoy;
   - no aparece «El recorrido de tu tapita».

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/pages/Traceability.test.tsx > $SP/r3.txt 2>&1; echo $?`
Expected: exit 1, porque el caso banco no encuentra «El recorrido de tu tapita».

- [ ] **Step 3: Implement** — en `src/pages/Traceability.tsx`:

1. Imports nuevos:

```tsx
import { RecorridoDeLaTapita } from '@/components/features/RecorridoDeLaTapita'
import { puntoDeTuTapita } from '@/lib/recorridoDeLaTapita'
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { useSessionStore } from '@/store/session'
```

`conAporteDeLaSesionEnLaTraza` ya se importa de `@/lib/aportesDeLaSesion`: se suma ahí.

2. Después de `const eventos = …`:

```tsx
  const nombre = useSessionStore((s) => s.user?.name)
  const { data: historial } = useApi(() => api.getContributions(), [])
  // El proyecto con los aportes de la sesión: el destino muestra los mismos números que el inicio.
  const proyecto = project && conAportesDeLaSesion(project, actividad, nombre)
  const esBanco = proyecto?.illustration === 'bench'
```

3. Antes del `return` actual, agregar:

```tsx
  if (esBanco && proyecto && eventos && eventos.length > 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <RecorridoDeLaTapita
          eventos={eventos}
          proyecto={proyecto}
          punto={puntoDeTuTapita(proyecto, actividad, historial ?? [])}
          propias={proyecto.collectedUnits > 0 ? proyecto.myContributionUnits / proyecto.collectedUnits : 0}
        />
        <Link to={`/proyecto/${projectId}`} className="block text-center text-sm font-semibold text-eco-700">
          ← Volver al proyecto
        </Link>
      </div>
    )
  }
```

El resto de la página (carga, error, vacío y la línea de tiempo de hoy) queda igual para los proyectos que no son banco, y mientras carga.

- [ ] **Step 4: Run tests** — el archivo nuevo (2 passed), la suite completa una vez, `npx tsc -b` y `npx eslint` sobre los archivos tocados.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Traceability.tsx src/pages/Traceability.test.tsx
git commit -m "feat(recorrido): la trazabilidad de un banco es el recorrido de tu tapita"
```
