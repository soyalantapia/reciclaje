# Productos del club (E1.3) e informe para la Comisión Directiva (E4.2) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que el club publique desde su panel lo que construye su hinchada (forma, meta en kilos, Punto R) y que tenga un informe imprimible para su Comisión Directiva, todo con los datos de ejemplo que ya existen.

**Architecture:** los productos publicados viven en un store persistido del navegador (como los beneficios que crea el panel) y el simulador MSW los sirve junto a los del seed; la lógica es pura y está en `src/lib/productosDelClub.ts`. El dibujo de tapitas suma una prop `forma`. El informe es una página del panel que reusa las métricas del panel a través de un hook nuevo, `useMetricasDelPanel`, y se imprime con `window.print()`.

**Tech Stack:** React 19 + TypeScript + Vite, Tailwind 4, framer-motion 12, zustand 5 (persist), MSW 2.14, Vitest 4 + Testing Library (jsdom).

Spec: `docs/superpowers/specs/2026-10-10-productos-e-informe-design.md`.

## Global Constraints

- Todo texto visible va en castellano rioplatense. Ninguno dice «en vivo» ni «tiempo real», y ninguna fecha se inventa: un producto nuevo dice «A definir».
- No aparecen números nuevos. Las tapitas por kilo son `TAPITAS_POR_KILO = 238`, exportada desde `src/lib/metrics.ts`; no se vuelve a escribir 238 en otro lado.
- No se usan los colores ni el escudo del club: sólo los tokens de la app (`eco-*`, `xp-*`).
- Los imports van con el alias `@/…`, como en el resto del repo.
- Una grilla con columnas por breakpoint lleva `grid-cols-1` de base (`grid grid-cols-1 sm:grid-cols-2`).
- Con movimiento reducido (`useReducedMotion`), nada se anima.
- Las pruebas no copian un `localStorage` en memoria. Desde la Task 1, `src/test/setup.ts` instala uno cuando el del entorno no sirve. Node 25 trae un `localStorage` sin `setItem` que le gana al de jsdom.
- El resultado de una prueba se lee del comando directo, nunca a través de un pipe: `npx vitest run <archivo>; echo "exit=$?"`.
- El tipado se revisa con `npx tsc -p tsconfig.app.json; echo "exit=$?"`. No uses `tsc -b`: `node_modules` es un enlace compartido con otro worktree y su caché de compilación también.
- El lint se revisa con `npx eslint <archivos tocados>; echo "exit=$?"`. Tiene que dar 0 errores. Los 9 avisos que ya tiene el repo no cuentan.
- Los commits son scoped: `git add <archivos>` y nunca `git add -A`. El mensaje va en castellano, y su última línea es `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- No se tocan otros archivos que los que lista la tarea.

---

### Task 1: La lógica de los productos del club

**Files:**
- Modify: `src/types/index.ts` (después de `ProjectIllustration`, línea 109; e `ImpactProject`, líneas 122-137)
- Modify: `src/lib/metrics.ts`
- Modify: `src/lib/aportesDeLaSesion.ts` (líneas 98-99)
- Modify: `src/services/mocks/escenarioClub.ts` (el `producto` de `casoDelClub`, línea ~132)
- Create: `src/lib/productosDelClub.ts`
- Test: `src/lib/productosDelClub.test.ts`
- Modify: `src/test/setup.ts` (el `localStorage` de las pruebas)

**Interfaces:**
- Consumes: nada de otras tareas.
- Produces:
  - **Tipos** (`@/types`):
    - `type FormaDelProducto = 'banco' | 'butacas' | 'arco' | 'libre'`;
    - campos opcionales en `ImpactProject`: `etiqueta?: string`, `forma?: FormaDelProducto`, `puntoId?: string` y `creadoEn?: string`.
  - **Constante** (`@/lib/metrics`): `TAPITAS_POR_KILO = 238`.
  - **Funciones y constantes** de `@/lib/productosDelClub`:
    - `FORMAS: { forma: FormaDelProducto; nombre: string; nombrePorDefecto: string }[]`
    - `interface NuevoProducto { id; forma; nombre; metaKg; punto: RecyclePoint; club: { id; nombre }; creadoEn }`
    - `crearProducto(n: NuevoProducto): ImpactProject`
    - `kilosDeLaMeta(p: ImpactProject): number`
    - `nombreDelProducto(p: ImpactProject): string`
    - `esDelPanel(p: ImpactProject): boolean`
    - `proyectoDelPunto(punto: RecyclePoint, sembrados: ImpactProject[], creados: ImpactProject[]): ImpactProject | undefined`
    - `puntosDelProducto(p: ImpactProject, puntos: RecyclePoint[], creados: ImpactProject[]): RecyclePoint[]`
    - `trazaDeUnProducto(p: ImpactProject, punto: string): TraceEvent[]`
    - `destinoDelProducto(p: ImpactProject): { rotulo: string; frase: string }`
    - `tituloDeLaHinchada(p: ImpactProject): string`
  - **Entorno de pruebas:** desde esta tarea, `localStorage` y `sessionStorage` andan en todas las pruebas. Las de las tareas siguientes dependen de eso.

- [ ] **Step 1: Escribí la prueba que falla**

Creá `src/lib/productosDelClub.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { ImpactProject, RecyclePoint } from '@/types'
import { TAPITAS_POR_KILO } from './metrics'
import {
  FORMAS,
  crearProducto,
  destinoDelProducto,
  esDelPanel,
  kilosDeLaMeta,
  nombreDelProducto,
  proyectoDelPunto,
  puntosDelProducto,
  tituloDeLaHinchada,
  trazaDeUnProducto,
  type NuevoProducto,
} from './productosDelClub'

const punto = (id: string, name: string, sponsorId = 's_club'): RecyclePoint => ({
  id, name, sponsorId, type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
const estadio = punto('p_club_estadio', 'Punto R · Estadio')
const sede = punto('p_club_sede', 'Punto R · Sede social')

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', etiqueta: 'Banco de suplentes',
  sponsorId: 's_club', sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas',
  goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31',
  illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

const nuevo = (cambios: Partial<NuevoProducto> = {}) =>
  crearProducto({
    id: 'pr_nuevo_1', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
    club: { id: 's_club', nombre: 'Talleres' }, creadoEn: '2026-10-10T12:00:00.000Z', ...cambios,
  })

describe('crearProducto', () => {
  it('arranca en cero, con la meta en tapitas a 238 por kilo y sin fecha inventada', () => {
    const p = nuevo()
    expect(TAPITAS_POR_KILO).toBe(238)
    expect(p.goalUnits).toBe(119000)
    expect(p.collectedUnits).toBe(0)
    expect(p.myContributionUnits).toBe(0)
    expect(p.estimatedDate).toBe('')
    expect(p.topContributors).toEqual([])
    expect(p.milestones.map((h) => h.label)).toEqual(['Recolección', 'Pesaje y retiro', 'Fabricación', 'Instalación'])
    expect(p.milestones.every((h) => !h.done)).toBe(true)
  })

  it('se dibuja como banco, con su forma, su Punto R y el club', () => {
    const p = nuevo({ forma: 'arco', nombre: '  Arco para las inferiores  ' })
    expect(p.title).toBe('Arco para las inferiores')
    expect(p.illustration).toBe('bench')
    expect(p.forma).toBe('arco')
    expect(p.puntoId).toBe('p_club_sede')
    expect(p.creadoEn).toBe('2026-10-10T12:00:00.000Z')
    expect(p.sponsorId).toBe('s_club')
    expect(p.sponsorName).toBe('Talleres')
    expect(p.material).toBe('tapitas')
    expect(p.unitLabel).toBe('tapitas')
    expect(p.description).toBe(
      'Las tapitas que la hinchada deje en el Punto R · Sede social van a «Arco para las inferiores». Con la meta cumplida, se fabrica y se instala.',
    )
  })
})

describe('FORMAS', () => {
  it('son las cuatro que se eligen en el panel, con su nombre propuesto', () => {
    expect(FORMAS.map((f) => f.forma)).toEqual(['banco', 'butacas', 'arco', 'libre'])
    expect(FORMAS.map((f) => f.nombre)).toEqual(['Banco de suplentes', 'Butacas', 'Arco para las inferiores', 'Otro'])
    expect(FORMAS.map((f) => f.nombrePorDefecto)).toEqual([
      'Banco de suplentes visitante',
      'Butacas para la platea',
      'Arco para las inferiores',
      '',
    ])
  })
})

describe('kilosDeLaMeta y nombreDelProducto', () => {
  it('la meta en kilos sale con la misma cuenta del panel', () => {
    expect(kilosDeLaMeta(nuevo())).toBe(500)
    expect(kilosDeLaMeta(banco)).toBe(1261)
  })

  it('el nombre corto es la etiqueta, si la hay; si no, el título', () => {
    expect(nombreDelProducto(banco)).toBe('Banco de suplentes')
    expect(nombreDelProducto(nuevo())).toBe('Butacas para la platea')
  })
})

describe('proyectoDelPunto', () => {
  it('sin productos del panel, el aporte va al proyecto del club, como hasta hoy', () => {
    expect(proyectoDelPunto(sede, [banco], [])?.id).toBe('pr_banco_club')
  })

  it('en el Punto R de un producto del panel va a ese producto; en otro punto, al banco', () => {
    const butacas = nuevo()
    expect(proyectoDelPunto(sede, [banco], [butacas])?.id).toBe('pr_nuevo_1')
    expect(proyectoDelPunto(estadio, [banco], [butacas])?.id).toBe('pr_banco_club')
  })

  it('si hubiera dos para el mismo punto, gana el más nuevo', () => {
    const viejo = nuevo({ id: 'pr_viejo', creadoEn: '2026-10-09T12:00:00.000Z' })
    const reciente = nuevo({ id: 'pr_reciente', creadoEn: '2026-10-10T12:00:00.000Z' })
    expect(proyectoDelPunto(sede, [banco], [viejo, reciente])?.id).toBe('pr_reciente')
  })

  it('un punto de otro sponsor no toma los productos del club', () => {
    expect(proyectoDelPunto(punto('p_otro', 'Otro', 's_otro'), [banco], [nuevo()])).toBeUndefined()
  })
})

describe('puntosDelProducto', () => {
  it('un producto del panel junta en su punto; el banco, en los del club que quedan libres', () => {
    const butacas = nuevo()
    expect(puntosDelProducto(butacas, [estadio, sede], [butacas]).map((p) => p.id)).toEqual(['p_club_sede'])
    expect(puntosDelProducto(banco, [estadio, sede], [butacas]).map((p) => p.id)).toEqual(['p_club_estadio'])
    expect(puntosDelProducto(banco, [estadio, sede], []).map((p) => p.id)).toEqual(['p_club_estadio', 'p_club_sede'])
  })
})

describe('trazaDeUnProducto', () => {
  it('son las siete etapas del banco, con el producto y su punto, y ninguna hecha ni fechada', () => {
    const t = trazaDeUnProducto(nuevo(), 'Punto R · Sede social')
    expect(t.map((e) => e.stage)).toEqual([
      'aporte', 'validacion', 'lote', 'retiro', 'clasificacion', 'transformacion', 'producto',
    ])
    expect(t.every((e) => !e.done && e.date === null)).toBe(true)
    expect(t[0].detail).toBe('Las tapitas que dejás en el Punto R · Sede social.')
    expect(t[1].title).toBe('Pesaje del lote')
    expect(t[1].operator).toBe('Talleres')
    expect(t[5].detail).toBe('Con el material recuperado se fabrica «Butacas para la platea».')
    expect(t[6].detail).toBe('«Butacas para la platea» se instala en el club.')
  })
})

describe('destinoDelProducto y tituloDeLaHinchada', () => {
  it('el banco del club sigue siendo «el banco de la hinchada»', () => {
    expect(esDelPanel(banco)).toBe(false)
    expect(destinoDelProducto(banco)).toEqual({ rotulo: 'banco de la hinchada', frase: 'al banco de la hinchada' })
    expect(tituloDeLaHinchada(banco)).toBe('La hinchada en el banco')
  })

  it('un producto del panel se nombra por su nombre', () => {
    const p = nuevo()
    expect(esDelPanel(p)).toBe(true)
    expect(destinoDelProducto(p)).toEqual({ rotulo: 'Butacas para la platea', frase: 'a «Butacas para la platea»' })
    expect(tituloDeLaHinchada(p)).toBe('La hinchada que suma')
  })
})
```

- [ ] **Step 2: Corré la prueba y verificá que falla**

Run: `npx vitest run src/lib/productosDelClub.test.ts; echo "exit=$?"`
Expected: FAIL. No existe `./productosDelClub` y `TAPITAS_POR_KILO` no se exporta. Termina con `exit=1`.

- [ ] **Step 3: Agregá los tipos**

En `src/types/index.ts`, justo después de `export type ProjectIllustration = 'bench' | 'totem'`, agregá:

```ts

/** Qué dibujan las tapitas de un producto del club (ver `BancoDeTapitas`). */
export type FormaDelProducto = 'banco' | 'butacas' | 'arco' | 'libre'
```

En la misma `interface ImpactProject`, después de `topContributors: ProjectContributor[]`, agregá:

```ts
  /** Nombre corto, para las pestañas del inicio y el informe: «Banco de suplentes». */
  etiqueta?: string
  /** Sólo en los productos que el club publica desde el panel: qué dibujan sus tapitas. */
  forma?: FormaDelProducto
  /** El Punto R donde junta un producto del panel: lo que la hinchada deja ahí, suma a él. */
  puntoId?: string
  /** Cuándo se publicó desde el panel (ISO). */
  creadoEn?: string
```

- [ ] **Step 4: Exportá las tapitas por kilo desde las métricas**

En `src/lib/metrics.ts`, después de la línea `const MESES = [...]`, agregá:

```ts

/** Tapitas por kilo: la cuenta de toda la demo (el panel, el informe y la meta de cada producto del club). */
export const TAPITAS_POR_KILO = 238
```

y cambiá `capsRecovered: Math.round(kg * 238),` por:

```ts
    capsRecovered: Math.round(kg * TAPITAS_POR_KILO),
```

En `src/lib/aportesDeLaSesion.ts`, borrá estas dos líneas (98-99):

```ts
/** Tapitas por kilo: la misma cuenta que usa `metricsFor` (`capsRecovered = kg × 238`). */
const TAPITAS_POR_KILO = 238
```

y agregá el import debajo del import de tipos de la línea 1:

```ts
import { TAPITAS_POR_KILO } from './metrics'
```

- [ ] **Step 5: Ponele etiqueta al banco del club**

En `src/services/mocks/escenarioClub.ts`, dentro de `casoDelClub`, en `const producto: ImpactProject = {`, agregá después de la línea `title: 'Banco de suplentes con el plástico de la hinchada',`:

```ts
    etiqueta: 'Banco de suplentes',
```

- [ ] **Step 6: Escribí la lógica**

Creá `src/lib/productosDelClub.ts`:

```ts
import type { FormaDelProducto, ImpactProject, RecyclePoint, TraceEvent } from '@/types'
import { TAPITAS_POR_KILO } from './metrics'

/**
 * Los productos que el club publica desde su panel (E1.3 del piloto): lo que construye su
 * hinchada, con una meta en kilos y el Punto R donde se junta. En la demo viven en el navegador
 * (`src/store/commerceProducts.ts`) y el simulador los sirve junto a los del seed.
 */

/** Las formas que se eligen en «Nuevo producto», con el nombre que se propone para cada una. */
export const FORMAS: { forma: FormaDelProducto; nombre: string; nombrePorDefecto: string }[] = [
  { forma: 'banco', nombre: 'Banco de suplentes', nombrePorDefecto: 'Banco de suplentes visitante' },
  { forma: 'butacas', nombre: 'Butacas', nombrePorDefecto: 'Butacas para la platea' },
  { forma: 'arco', nombre: 'Arco para las inferiores', nombrePorDefecto: 'Arco para las inferiores' },
  { forma: 'libre', nombre: 'Otro', nombrePorDefecto: '' },
]

/** Los hitos de un producto nuevo: los mismos cuatro del banco, ninguno hecho. */
const HITOS = ['Recolección', 'Pesaje y retiro', 'Fabricación', 'Instalación']

export interface NuevoProducto {
  id: string
  forma: FormaDelProducto
  nombre: string
  metaKg: number
  punto: RecyclePoint
  club: { id: string; nombre: string }
  /** ISO. */
  creadoEn: string
}

/**
 * Un producto publicado desde el panel. Arranca en cero, con la meta en kilos contada en tapitas
 * con la cuenta del panel, y sin fecha estimada: se pone cuando se sepa cuándo se fabrica. Se
 * dibuja como banco (`illustration: 'bench'`) para usar el festejo, el recorrido y el banco de la
 * hinchada; `forma` decide qué dibujan las tapitas.
 */
export function crearProducto(n: NuevoProducto): ImpactProject {
  const nombre = n.nombre.trim()
  return {
    id: n.id,
    title: nombre,
    sponsorId: n.club.id,
    sponsorName: n.club.nombre,
    description: `Las tapitas que la hinchada deje en el ${n.punto.name} van a «${nombre}». Con la meta cumplida, se fabrica y se instala.`,
    material: 'tapitas',
    unitLabel: 'tapitas',
    goalUnits: Math.round(n.metaKg * TAPITAS_POR_KILO),
    collectedUnits: 0,
    myContributionUnits: 0,
    estimatedDate: '',
    illustration: 'bench',
    milestones: HITOS.map((label) => ({ label, done: false })),
    topContributors: [],
    forma: n.forma,
    puntoId: n.punto.id,
    creadoEn: n.creadoEn,
  }
}

/** Los kilos de la meta, con la misma cuenta: las 300.000 tapitas del banco son 1.261 kg. */
export function kilosDeLaMeta(p: ImpactProject): number {
  return Math.round(p.goalUnits / TAPITAS_POR_KILO)
}

/** El nombre corto de un producto, para las pestañas del inicio y el informe. */
export function nombreDelProducto(p: ImpactProject): string {
  return p.etiqueta ?? p.title
}

/** ¿Lo publicó el club desde el panel? Los del seed no tienen forma. */
export function esDelPanel(p: ImpactProject): boolean {
  return p.forma !== undefined
}

/**
 * El producto al que va un aporte hecho en un punto: el más nuevo que el club publicó para ese
 * Punto R; si no hay, el del club, como hasta hoy. Un producto abierto por punto.
 */
export function proyectoDelPunto(
  punto: RecyclePoint,
  sembrados: ImpactProject[],
  creados: ImpactProject[],
): ImpactProject | undefined {
  const delPunto = creados
    .filter((p) => p.puntoId === punto.id)
    .sort((a, b) => (b.creadoEn ?? '').localeCompare(a.creadoEn ?? ''))[0]
  return delPunto ?? sembrados.find((p) => p.sponsorId === punto.sponsorId)
}

/** Los Punto R donde junta un producto: el suyo, o los del club que no tomó un producto del panel. */
export function puntosDelProducto(p: ImpactProject, puntos: RecyclePoint[], creados: ImpactProject[]): RecyclePoint[] {
  if (p.puntoId) return puntos.filter((pt) => pt.id === p.puntoId)
  const tomados = new Set(creados.map((c) => c.puntoId))
  return puntos.filter((pt) => pt.sponsorId === p.sponsorId && !tomados.has(pt.id))
}

/**
 * El recorrido de un producto del panel: las mismas siete etapas del banco, ninguna hecha ni
 * fechada. El primer aporte de la hinchada marca «Tu aporte» (ver `conAporteDeLaSesionEnLaTraza`).
 */
export function trazaDeUnProducto(p: ImpactProject, punto: string): TraceEvent[] {
  return [
    { stage: 'aporte', title: 'Tu aporte', detail: `Las tapitas que dejás en el ${punto}.`, date: null, done: false },
    {
      stage: 'validacion',
      title: 'Pesaje del lote',
      detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.',
      date: null,
      done: false,
      operator: p.sponsorName,
    },
    {
      stage: 'lote',
      title: 'Lote del partido',
      detail: 'Los aportes del partido quedan agrupados en un lote con su peso.',
      date: null,
      done: false,
    },
    { stage: 'retiro', title: 'Retiro', detail: 'El reciclador retira el material del club.', date: null, done: false },
    {
      stage: 'clasificacion',
      title: 'Clasificación y limpieza',
      detail: 'Separación por color y tipo de plástico.',
      date: null,
      done: false,
    },
    {
      stage: 'transformacion',
      title: 'Fabricación',
      detail: `Con el material recuperado se fabrica «${p.title}».`,
      date: null,
      done: false,
    },
    { stage: 'producto', title: 'Instalación', detail: `«${p.title}» se instala en el club.`, date: null, done: false },
  ]
}

/**
 * Cómo nombra el festejo el destino de un aporte: el banco del club es «el banco de la hinchada»;
 * un producto del panel, por su nombre.
 */
export function destinoDelProducto(p: ImpactProject): { rotulo: string; frase: string } {
  return esDelPanel(p)
    ? { rotulo: p.title, frase: `a «${p.title}»` }
    : { rotulo: 'banco de la hinchada', frase: 'al banco de la hinchada' }
}

/** El título de la lista del banco de la hinchada: sólo el banco tiene a la hinchada «en el banco». */
export function tituloDeLaHinchada(p: ImpactProject): string {
  return esDelPanel(p) ? 'La hinchada que suma' : 'La hinchada en el banco'
}
```

- [ ] **Step 7: Corré la prueba y verificá que pasa**

Run: `npx vitest run src/lib/productosDelClub.test.ts; echo "exit=$?"`
Expected: PASS, 13 pruebas y `exit=0`.

- [ ] **Step 8: Que las pruebas tengan un `localStorage` que ande**

Node 25 trae un `localStorage` propio que, sin `--localstorage-file`, no tiene `setItem`, y le gana al
de jsdom. Los stores con persist no podían guardar, y dos pruebas lo parchaban a mano. Reemplazá
`src/test/setup.ts` entero por:

```ts
import '@testing-library/jest-dom/vitest'

/**
 * Node 25 trae un `localStorage` propio que, sin `--localstorage-file`, no tiene `setItem`, y le
 * gana al de jsdom: los stores con persist no podían guardar. Si el almacenamiento del entorno no
 * anda, uno en memoria, nuevo para cada archivo de prueba, como un navegador recién abierto.
 */
function almacenEnMemoria(): Storage {
  const memoria = new Map<string, string>()
  return {
    getItem: (k: string) => memoria.get(k) ?? null,
    setItem: (k: string, v: string) => void memoria.set(k, String(v)),
    removeItem: (k: string) => void memoria.delete(k),
    clear: () => memoria.clear(),
    key: (i: number) => [...memoria.keys()][i] ?? null,
    get length() {
      return memoria.size
    },
  } as Storage
}

for (const nombre of ['localStorage', 'sessionStorage'] as const) {
  try {
    globalThis[nombre].setItem('__prueba__', '1')
    globalThis[nombre].removeItem('__prueba__')
  } catch {
    globalThis[nombre] = almacenEnMemoria()
  }
}
```

No toques las dos pruebas que ya lo parchan (`src/pages/Traceability.test.tsx` y
`src/pages/commerce/CommerceResumen.test.tsx`). Su parche corre después de este y no rompe nada.

- [ ] **Step 9: Corré la suite, el tipado y el lint**

Run, cada uno por separado:
- `npx vitest run; echo "exit=$?"`. Tiene que pasar entera, con `exit=0`. `metrics.test.ts`, `aportesDeLaSesion.test.ts` y `escenarioClub.test.ts` siguen verdes.
- `npx tsc -p tsconfig.app.json; echo "exit=$?"`, con `exit=0`.
- `npx eslint src/lib/productosDelClub.ts src/lib/productosDelClub.test.ts src/lib/metrics.ts src/lib/aportesDeLaSesion.ts src/types/index.ts src/services/mocks/escenarioClub.ts src/test/setup.ts; echo "exit=$?"`, sin errores.

- [ ] **Step 10: Commit**

```bash
git add src/types/index.ts src/lib/metrics.ts src/lib/aportesDeLaSesion.ts src/services/mocks/escenarioClub.ts src/lib/productosDelClub.ts src/lib/productosDelClub.test.ts src/test/setup.ts
git commit -m "feat(productos): la lógica de los productos que publica el club, con meta en kilos y su Punto R

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: El store de los productos y el simulador

**Files:**
- Create: `src/store/commerceProducts.ts`
- Modify: `src/services/mocks/handlers.ts` (imports; `GET /projects`, `GET /projects/:id`, `GET /projects/:id/trace` y `POST /contributions`)
- Test: `src/services/mocks/handlers.test.ts`

**Interfaces:**
- Consumes (Task 1):
  - `proyectoDelPunto(punto, sembrados, creados)`;
  - `trazaDeUnProducto(p, punto)`;
  - `crearProducto(n)`, sólo en la prueba.
- Produces:
  - `useCommerceProductsStore`, un store de zustand persistido con:
    - `creados: ImpactProject[]`, el más nuevo primero;
    - `agregar(p: ImpactProject): void`;
    - `quitar(id: string): void`.
  - Su clave de almacenamiento es `claveDeAlmacenamiento('commerce-products')`.
  - El simulador queda así:
    - `GET /projects` devuelve `[...seed, ...creados]`;
    - `GET /projects/:id` también encuentra los creados;
    - el recorrido de un creado sale de `trazaDeUnProducto`;
    - `POST /contributions` asigna el aporte con `proyectoDelPunto`.

- [ ] **Step 1: Escribí la prueba que falla**

Creá `src/services/mocks/handlers.test.ts`:

```ts
import { getResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ImpactProject, ScanResult, TraceEvent } from '@/types'
import { crearProducto } from '@/lib/productosDelClub'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { datos } from './datos'
import { handlers } from './handlers'

/** Le pide al simulador lo mismo que la app, sin red: `getResponse` corre los handlers directo. */
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const respuesta = await getResponse(handlers, new Request(new URL(`${base}/api${ruta}`, location.origin), init))
  if (!respuesta) throw new Error(`El simulador no atendió ${ruta}`)
  return (await respuesta.json()) as T
}

const { points, projects } = datos
// En la demo general, el primer proyecto es el banco de Talleres, con sus dos Punto R.
const banco = projects[0]
const estadio = points.find((p) => p.sponsorId === banco.sponsorId && p.id.endsWith('_estadio'))!
const sede = points.find((p) => p.sponsorId === banco.sponsorId && p.id.endsWith('_sede'))!
const butacas = crearProducto({
  id: 'pr_nuevo_prueba', forma: 'butacas', nombre: 'Butacas para la platea', metaKg: 500, punto: sede,
  club: { id: banco.sponsorId, nombre: banco.sponsorName }, creadoEn: '2026-10-10T12:00:00.000Z',
})

const aportar = (pointId: string) =>
  pedir<ScanResult>('/contributions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointId, material: 'tapitas', units: 50 }),
  })

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
})

describe('simulador: los productos que publica el club', () => {
  it('sin productos del panel, sirve los del seed como siempre', async () => {
    const lista = await pedir<ImpactProject[]>('/projects')
    expect(lista.map((p) => p.id)).toEqual(projects.map((p) => p.id))
  })

  it('los publicados van después de los del seed y se pueden pedir por id', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    const lista = await pedir<ImpactProject[]>('/projects')
    expect(lista[0].id).toBe(banco.id)
    expect(lista.at(-1)?.id).toBe('pr_nuevo_prueba')
    const uno = await pedir<ImpactProject>('/projects/pr_nuevo_prueba')
    expect(uno.title).toBe('Butacas para la platea')
  })

  it('el recorrido de un producto publicado tiene sus siete etapas sin hacer, con su Punto R', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    const traza = await pedir<TraceEvent[]>('/projects/pr_nuevo_prueba/trace')
    expect(traza).toHaveLength(7)
    expect(traza.every((e) => !e.done)).toBe(true)
    expect(traza[0].detail).toBe(`Las tapitas que dejás en el ${sede.name}.`)
  })

  it('un aporte en el Punto R del producto va a ese producto; en el estadio, al banco', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    const enLaSede = await aportar(sede.id)
    expect(enLaSede.contribution.projectId).toBe('pr_nuevo_prueba')
    expect(enLaSede.project?.id).toBe('pr_nuevo_prueba')
    const enElEstadio = await aportar(estadio.id)
    expect(enElEstadio.contribution.projectId).toBe(banco.id)
  })

  it('después de eliminarlo, la sede vuelve a juntar para el banco', async () => {
    useCommerceProductsStore.getState().agregar(butacas)
    useCommerceProductsStore.getState().quitar('pr_nuevo_prueba')
    const enLaSede = await aportar(sede.id)
    expect(enLaSede.contribution.projectId).toBe(banco.id)
  })
})
```

- [ ] **Step 2: Corré la prueba y verificá que falla**

Run: `npx vitest run src/services/mocks/handlers.test.ts; echo "exit=$?"`
Expected: FAIL, porque no existe `@/store/commerceProducts`. Termina con `exit=1`.

- [ ] **Step 3: Escribí el store**

Creá `src/store/commerceProducts.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ImpactProject } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { conVersionDeLosDatos } from './versionDeDatos'

const CLAVE = claveDeAlmacenamiento('commerce-products')

interface CommerceProductsState {
  /** Productos que el club publicó desde el panel (se suman a los del seed). El más nuevo, primero. */
  creados: ImpactProject[]
  agregar: (p: ImpactProject) => void
  quitar: (id: string) => void
}

export const useCommerceProductsStore = create<CommerceProductsState>()(
  persist(
    (set) => ({
      creados: [],
      agregar: (p) => set((s) => ({ creados: [p, ...s.creados] })),
      quitar: (id) => set((s) => ({ creados: s.creados.filter((p) => p.id !== id) })),
    }),
    { name: CLAVE, ...conVersionDeLosDatos<CommerceProductsState>() },
  ),
)

// El panel y la app del hincha suelen estar en dos pestañas del mismo navegador: lo que publica
// una, la otra lo toma sin recargar.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) void useCommerceProductsStore.persist.rehydrate()
  })
}
```

- [ ] **Step 4: Hacé que el simulador sirva los productos y les mande los aportes**

En `src/services/mocks/handlers.ts`:

1. Agregá dos imports, después de `import { useCommerceBenefitsStore } from '@/store/commerceBenefits'`:

```ts
import { proyectoDelPunto, trazaDeUnProducto } from '@/lib/productosDelClub'
import { useCommerceProductsStore } from '@/store/commerceProducts'
```

2. Agregá esto debajo de la línea `const api = (path: string) => \`${BASE}/api${path}\``:

```ts

/** Los productos que el club publicó desde el panel: en la demo viven en el navegador, como sus beneficios. */
const creados = () => useCommerceProductsStore.getState().creados
```

3. Reemplazá los tres handlers de proyectos:

```ts
  http.get(api('/projects'), async () => {
    await delay(200)
    return HttpResponse.json([...projects, ...creados()])
  }),

  http.get(api('/projects/:id'), async ({ params }) => {
    await delay(200)
    const project = [...projects, ...creados()].find((p) => p.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  http.get(api('/projects/:id/trace'), async ({ params }) => {
    await delay(200)
    const id = String(params.id)
    // Un producto del panel tiene su recorrido sin hacer, con su Punto R.
    const creado = creados().find((p) => p.id === id)
    if (creado) {
      const punto = points.find((p) => p.id === creado.puntoId)?.name ?? 'Punto R'
      return HttpResponse.json(trazaDeUnProducto(creado, punto))
    }
    const trace = traceByProject[id] ?? []
    return HttpResponse.json(trace)
  }),
```

4. En `POST /contributions`, reemplazá la línea

```ts
    const project = projects.find((p) => p.sponsorId === point.sponsorId)
```

por:

```ts
    // El producto que el club publicó para este Punto R; si no hay, el del club.
    const project = proyectoDelPunto(point, projects, creados())
```

- [ ] **Step 5: Corré la prueba y verificá que pasa**

Run: `npx vitest run src/services/mocks/handlers.test.ts; echo "exit=$?"`
Expected: PASS, 5 pruebas y `exit=0`. Tarda unos segundos por los `delay` del simulador.
Si `getResponse` devuelve `undefined`, imprimí la URL que se pidió y compará su ruta con la de
`api(...)`. En las pruebas, `BASE_URL` es `/`.

- [ ] **Step 6: Corré la suite, el tipado y el lint**

Run, cada uno por separado:
- `npx vitest run; echo "exit=$?"`, con `exit=0`.
- `npx tsc -p tsconfig.app.json; echo "exit=$?"`, con `exit=0`.
- `npx eslint src/store/commerceProducts.ts src/services/mocks/handlers.ts src/services/mocks/handlers.test.ts; echo "exit=$?"`, sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/store/commerceProducts.ts src/services/mocks/handlers.ts src/services/mocks/handlers.test.ts
git commit -m "feat(productos): el simulador sirve los productos del club y les manda los aportes de su Punto R

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: El dibujo toma la forma del producto, y el festejo y el recorrido lo nombran

**Files:**
- Modify: `src/components/features/BancoDeTapitas.tsx` (reemplazo completo)
- Modify: `src/components/features/BancoDeLaHinchada.tsx`
- Modify: `src/components/features/FestejoDelAporte.tsx`
- Modify: `src/components/features/RecorridoDeLaTapita.tsx`
- Modify: `src/components/features/ImpactProgress.tsx`
- Test: `src/components/features/BancoDeTapitas.test.tsx` (nuevo)
- Test: `src/components/features/BancoDeLaHinchada.test.tsx` (nuevo)
- Test: `src/components/features/FestejoDelAporte.test.tsx`, `src/components/features/RecorridoDeLaTapita.test.tsx` y `src/components/features/ImpactProgress.test.tsx` (se agrega un caso a cada una)

**Interfaces:**
- Consumes (Task 1):
  - `FormaDelProducto`;
  - `ImpactProject.forma`;
  - `destinoDelProducto(p)`;
  - `tituloDeLaHinchada(p)`.
- Produces:
  - `BancoDeTapitas` acepta `forma?: FormaDelProducto`, con `'banco'` por defecto.
  - El `<svg>` lleva:
    - `data-forma={forma}`;
    - `aria-label` = `"<Banco|Butacas|Arco|Producto> de tapitas: N de 80 encendidas"`;
    - `viewBox` según la forma: banco y butacas `0 0 166 90`, arco `0 0 178 72`, libre `0 0 166 66`.

- [ ] **Step 1: Escribí las pruebas que fallan**

Creá `src/components/features/BancoDeTapitas.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FormaDelProducto } from '@/types'
import { BancoDeTapitas } from './BancoDeTapitas'

const FORMAS: FormaDelProducto[] = ['banco', 'butacas', 'arco', 'libre']

describe('BancoDeTapitas: las formas', () => {
  it('sin forma es el banco de siempre', () => {
    const { container } = render(<BancoDeTapitas progreso={0.5} propias={0} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-forma')).toBe('banco')
    expect(svg.getAttribute('viewBox')).toBe('0 0 166 90')
    expect(svg.getAttribute('aria-label')).toBe('Banco de tapitas: 40 de 80 encendidas')
  })

  it('cada forma nombra lo que dibuja', () => {
    const nombres = FORMAS.map((forma) => {
      const { container } = render(<BancoDeTapitas forma={forma} progreso={0.5} propias={0} />)
      return container.querySelector('svg')!.getAttribute('aria-label')
    })
    expect(nombres).toEqual([
      'Banco de tapitas: 40 de 80 encendidas',
      'Butacas de tapitas: 40 de 80 encendidas',
      'Arco de tapitas: 40 de 80 encendidas',
      'Producto de tapitas: 40 de 80 encendidas',
    ])
  })

  it.each(FORMAS)('en «%s» las 80 tapitas entran enteras en el dibujo', (forma) => {
    const { container } = render(<BancoDeTapitas forma={forma} progreso={1} propias={0} />)
    const [, , ancho, alto] = container.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number)
    const tapitas = [...container.querySelectorAll('circle')]
    expect(tapitas).toHaveLength(80)
    for (const c of tapitas) {
      const cx = Number(c.getAttribute('cx'))
      const cy = Number(c.getAttribute('cy'))
      const r = Number(c.getAttribute('r'))
      expect(cx - r).toBeGreaterThanOrEqual(0)
      expect(cy - r).toBeGreaterThanOrEqual(0)
      expect(cx + r).toBeLessThanOrEqual(ancho)
      expect(cy + r).toBeLessThanOrEqual(alto)
    }
  })

  it('en el arco, ninguna tapita pisa los palos ni el travesaño', () => {
    const { container } = render(<BancoDeTapitas forma="arco" progreso={1} propias={0} />)
    for (const c of container.querySelectorAll('circle')) {
      const cx = Number(c.getAttribute('cx'))
      const cy = Number(c.getAttribute('cy'))
      const r = Number(c.getAttribute('r'))
      expect(cx - r).toBeGreaterThan(7)
      expect(cx + r).toBeLessThan(178 - 7)
      expect(cy - r).toBeGreaterThan(7)
    }
  })
})
```

Creá `src/components/features/BancoDeLaHinchada.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { BancoDeLaHinchada } from './BancoDeLaHinchada'

const butacas = {
  id: 'pr_nuevo_1', title: 'Butacas para la platea', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 119000, collectedUnits: 50, myContributionUnits: 50,
  estimatedDate: '', illustration: 'bench', milestones: [], topContributors: [], forma: 'butacas', puntoId: 'p_club_sede',
} as ImpactProject

describe('BancoDeLaHinchada con un producto que publicó el club', () => {
  it('dibuja su forma y titula la lista «La hinchada que suma»', () => {
    const items = [{ id: 'c1', nombre: 'Camila R.', texto: 'dejó 50 tapitas', esTuyo: true, cuando: '2026-10-10T12:00:00.000Z' }]
    const { container } = render(<BancoDeLaHinchada proyecto={butacas} items={items} propias={1} />)
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
    expect(container.textContent).toContain('La hinchada que suma')
    expect(container.textContent).not.toContain('La hinchada en el banco')
  })
})
```

En `src/components/features/FestejoDelAporte.test.tsx`, agregá este caso dentro del `describe('FestejoDelAporte', …)`, después del que ya hay:

```tsx
  it('con un producto que publicó el club, lo nombra y dibuja su forma', () => {
    const butacas = {
      ...proyecto, id: 'pr_nuevo_1', title: 'Butacas para la platea', goalUnits: 119000, collectedUnits: 50,
      myContributionUnits: 50, forma: 'butacas', puntoId: 'p_club_sede',
    } as ImpactProject
    const { container } = render(<FestejoDelAporte proyecto={butacas} unidades={50} xp={100} />)
    expect(container.textContent).toContain('Talleres · Butacas para la platea')
    expect(container.textContent).toContain('Tus 50 tapitas ya suman a «Butacas para la platea»')
    expect(container.textContent).not.toContain('banco de la hinchada')
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
  })
```

En `src/components/features/RecorridoDeLaTapita.test.tsx`, agregá este caso dentro del `describe('RecorridoDeLaTapita', …)`, al final:

```tsx
  it('si tu tapita todavía no entró, lo dice, no cuenta etapas y dibuja la forma del producto', () => {
    const sinHacer = eventos.map((e) => ({ ...e, done: false, date: null }))
    const { container } = render(
      <RecorridoDeLaTapita eventos={sinHacer} proyecto={{ ...proyecto, forma: 'arco' }} propias={0} />,
    )
    const t = container.textContent ?? ''
    expect(t).toContain('Tu tapita todavía no entró a este recorrido')
    expect(t).not.toContain('Tu tapita ya está en el recorrido')
    expect(t).not.toMatch(/Etapa \d+ de/)
    expect(container.querySelector('svg[data-forma="arco"]')).not.toBeNull()
  })
```

En `src/components/features/ImpactProgress.test.tsx`, agregá este caso dentro del `describe('ImpactProgress del banco', …)`, al final:

```tsx
  it('un producto sin fecha estimada dice «A definir», sin inventar una, y dibuja su forma', () => {
    const { container } = render(<ImpactProgress project={{ ...banco, estimatedDate: '', forma: 'butacas' }} />)
    expect(container.textContent).toContain('A definir')
    expect(container.textContent).not.toContain('Invalid Date')
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
  })
```

- [ ] **Step 2: Corré las pruebas y verificá que fallan**

Run: `npx vitest run src/components/features; echo "exit=$?"`
Expected: FAIL. Las pruebas nuevas no encuentran `data-forma`, «La hinchada que suma», «a «Butacas para la platea»», «todavía no entró» ni «A definir». Termina con `exit=1`.

- [ ] **Step 3: Reemplazá `BancoDeTapitas.tsx` entero**

```tsx
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { FormaDelProducto } from '@/types'
import {
  COLUMNAS_DEL_BANCO,
  FILAS_DEL_BANCO,
  TAPITAS_DEL_BANCO,
  estadosDelBanco,
  type EstadoTapita,
} from '@/lib/bancoDeTapitas'
import { cn } from '@/lib/utils'

const PASO = 10
const RADIO = 4.2
const MARGEN = 8
const ANCHO = MARGEN * 2 + (COLUMNAS_DEL_BANCO - 1) * PASO
const ASIENTO = MARGEN + (FILAS_DEL_BANCO - 1) * PASO + 10
/** El arco es más ancho: los palos van por fuera de las tapitas. */
const ANCHO_DEL_ARCO = ANCHO + 12

const CLASE: Record<EstadoTapita, string> = {
  hinchada: 'fill-eco-500 stroke-eco-700',
  tuya: 'fill-xp-400 stroke-xp-600',
  vacia: 'fill-transparent stroke-eco-300 dark:stroke-eco-800',
}

const TRAZO = 'fill-transparent stroke-eco-500 dark:stroke-eco-700'

/** Cómo se dibuja cada forma: su nombre, su tamaño, dónde van las tapitas y el contorno. */
interface Dibujo {
  nombre: string
  ancho: number
  alto: number
  /** Corrimiento de las tapitas dentro del dibujo. */
  dx: number
  dy: number
  contorno: ReactNode
}

const DIBUJO: Record<FormaDelProducto, Dibujo> = {
  // El de siempre: el respaldo de tapitas, el asiento y dos patas.
  banco: {
    nombre: 'Banco',
    ancho: ANCHO,
    alto: ASIENTO + 32,
    dx: 0,
    dy: 0,
    contorno: (
      <>
        <rect x={4} y={ASIENTO - 4} width={ANCHO - 8} height={7} rx={3} strokeWidth={1.2} className={TRAZO} />
        <rect x={16} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO - 21} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
  // Cuatro butacas de cuatro columnas cada una, con su asiento, sobre un larguero con patas.
  butacas: {
    nombre: 'Butacas',
    ancho: ANCHO,
    alto: ASIENTO + 32,
    dx: 0,
    dy: 0,
    contorno: (
      <>
        {[1, 2, 3].map((g) => (
          <line key={g} x1={3 + g * 40} y1={2} x2={3 + g * 40} y2={ASIENTO - 6} strokeWidth={1.2} className={TRAZO} />
        ))}
        {[0, 1, 2, 3].map((g) => (
          <rect key={g} x={4 + g * 40} y={ASIENTO - 4} width={38} height={7} rx={3} strokeWidth={1.2} className={TRAZO} />
        ))}
        <rect x={4} y={ASIENTO + 8} width={ANCHO - 8} height={4} rx={2} strokeWidth={1.2} className={TRAZO} />
        <rect x={16} y={ASIENTO + 12} width={5} height={17} rx={1.5} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO - 21} y={ASIENTO + 12} width={5} height={17} rx={1.5} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
  // Las tapitas son la red: los palos y el travesaño las rodean, sobre la línea del arco.
  arco: {
    nombre: 'Arco',
    ancho: ANCHO_DEL_ARCO,
    alto: 72,
    dx: 6,
    dy: 8,
    contorno: (
      <>
        <path
          d={`M1 67 V1 H${ANCHO_DEL_ARCO - 1} V67 H${ANCHO_DEL_ARCO - 7} V7 H7 V67 Z`}
          strokeWidth={1.2}
          strokeLinejoin="round"
          className={TRAZO}
        />
        <line x1={0} y1={70} x2={ANCHO_DEL_ARCO} y2={70} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
  // Cualquier otra cosa: un marco con su base.
  libre: {
    nombre: 'Producto',
    ancho: ANCHO,
    alto: 66,
    dx: 0,
    dy: 0,
    contorno: (
      <>
        <rect x={1} y={1} width={ANCHO - 2} height={54} rx={8} strokeWidth={1.2} className={TRAZO} />
        <rect x={ANCHO / 2 - 25} y={58} width={50} height={6} rx={3} strokeWidth={1.2} className={TRAZO} />
      </>
    ),
  },
}

/**
 * Lo que construye la hinchada dibujado con tapitas, que se llenan con el avance real del
 * proyecto. Las de la hinchada en verde y las de la persona en ámbar. `forma` cambia el contorno
 * (un banco, butacas, un arco u otra cosa); las 80 tapitas se llenan igual, de abajo hacia arriba.
 * Con `animarTuyas`, las suyas entran cayendo (salvo con movimiento reducido).
 */
export function BancoDeTapitas({
  progreso,
  propias,
  forma = 'banco',
  animarTuyas = false,
  className,
}: {
  progreso: number
  propias: number
  forma?: FormaDelProducto
  animarTuyas?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const dibujo = DIBUJO[forma]
  const estados = estadosDelBanco({ total: TAPITAS_DEL_BANCO, progreso, propias })
  const encendidas = estados.filter((e) => e !== 'vacia').length

  return (
    <svg
      viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`}
      role="img"
      aria-label={`${dibujo.nombre} de tapitas: ${encendidas} de ${TAPITAS_DEL_BANCO} encendidas`}
      data-forma={forma}
      className={cn('block h-auto w-full', className)}
    >
      {estados.map((estado, i) => {
        const cx = dibujo.dx + MARGEN + (i % COLUMNAS_DEL_BANCO) * PASO
        const cy = dibujo.dy + MARGEN + (FILAS_DEL_BANCO - 1 - Math.floor(i / COLUMNAS_DEL_BANCO)) * PASO
        if (estado === 'tuya' && animarTuyas && !reduce) {
          return (
            <motion.circle
              key={i}
              data-estado={estado}
              cx={cx}
              r={RADIO}
              strokeWidth={1}
              className={CLASE[estado]}
              initial={{ cy: cy - 60, opacity: 0 }}
              animate={{ cy, opacity: 1 }}
              transition={{ type: 'spring', damping: 11, delay: 0.6 }}
            />
          )
        }
        return <circle key={i} data-estado={estado} cx={cx} cy={cy} r={RADIO} strokeWidth={1} className={CLASE[estado]} />
      })}
      {dibujo.contorno}
    </svg>
  )
}
```

- [ ] **Step 4: Pasale la forma a cada lugar que dibuja, y nombrá el producto**

En `src/components/features/BancoDeLaHinchada.tsx`:
- Agregá `import { tituloDeLaHinchada } from '@/lib/productosDelClub'` debajo de `import type { AporteDeLaHinchada } from '@/lib/ultimosAportes'`.
- Cambiá `<BancoDeTapitas className="mt-3" progreso={avance} propias={propias} />` por:

```tsx
          <BancoDeTapitas className="mt-3" forma={proyecto.forma} progreso={avance} propias={propias} />
```

- Cambiá el texto fijo `La hinchada en el banco` (dentro del `<p className="mb-2 text-xs font-bold uppercase …">`) por `{tituloDeLaHinchada(proyecto)}`.

En `src/components/features/FestejoDelAporte.tsx`:
- Agregá `import { destinoDelProducto } from '@/lib/productosDelClub'` debajo de `import { formatNumber } from '@/lib/utils'`.
- Dentro de `FestejoDelAporte`, debajo de `const antes = Math.max(0, proyecto.collectedUnits - unidades)`, agregá:

```tsx
  // El banco del club es «el banco de la hinchada»; un producto del panel se nombra por su nombre.
  const destino = destinoDelProducto(proyecto)
```

- Cambiá `{proyecto.sponsorName} · banco de la hinchada` por `{proyecto.sponsorName} · {destino.rotulo}`.
- En el `<BancoDeTapitas` del festejo, agregá la prop `forma={proyecto.forma}`, en la línea anterior a `progreso=`.
- Cambiá `Tus {formatNumber(unidades)} {proyecto.unitLabel} ya suman al banco de la hinchada` por:

```tsx
        Tus {formatNumber(unidades)} {proyecto.unitLabel} ya suman {destino.frase}
```

En `src/components/features/RecorridoDeLaTapita.tsx`:
- Reemplazá el bloque

```tsx
          {punto ? (
            <span>
              Tu tapita está en el <b className="font-bold">{punto}</b>
            </span>
          ) : (
            <span>Tu tapita ya está en el recorrido</span>
          )}
```

por:

```tsx
          {actual < 0 ? (
            <span>Tu tapita todavía no entró a este recorrido</span>
          ) : punto ? (
            <span>
              Tu tapita está en el <b className="font-bold">{punto}</b>
            </span>
          ) : (
            <span>Tu tapita ya está en el recorrido</span>
          )}
```

- Cambiá `<BancoDeTapitas className="mt-2 max-w-xs" progreso={avance} propias={propias} />` por:

```tsx
        <BancoDeTapitas className="mt-2 max-w-xs" forma={proyecto.forma} progreso={avance} propias={propias} />
```

En `src/components/features/ImpactProgress.tsx`:
- En el `<BancoDeTapitas` de la rama `project.illustration === 'bench'`, agregá `forma={project.forma}` antes de `progreso=`.
- Reemplazá

```tsx
            {new Date(project.estimatedDate).toLocaleDateString('es-AR', {
              month: 'short',
              year: 'numeric',
            })}
```

por:

```tsx
            {/* Un producto recién publicado todavía no tiene fecha: no se inventa una. */}
            {project.estimatedDate
              ? new Date(project.estimatedDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
              : 'A definir'}
```

- [ ] **Step 5: Corré las pruebas y verificá que pasan**

Run: `npx vitest run src/components/features; echo "exit=$?"`
Expected: PASS con `exit=0`. Incluye las pruebas que ya existían: `cancha.test.tsx` sigue contando 80 tapitas y «Banco de tapitas…».

- [ ] **Step 6: Corré la suite, el tipado y el lint**

Run, cada uno por separado:
- `npx vitest run; echo "exit=$?"`, con `exit=0`.
- `npx tsc -p tsconfig.app.json; echo "exit=$?"`, con `exit=0`.
- `npx eslint src/components/features; echo "exit=$?"`, sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/components/features/BancoDeTapitas.tsx src/components/features/BancoDeTapitas.test.tsx src/components/features/BancoDeLaHinchada.tsx src/components/features/BancoDeLaHinchada.test.tsx src/components/features/FestejoDelAporte.tsx src/components/features/FestejoDelAporte.test.tsx src/components/features/RecorridoDeLaTapita.tsx src/components/features/RecorridoDeLaTapita.test.tsx src/components/features/ImpactProgress.tsx src/components/features/ImpactProgress.test.tsx
git commit -m "feat(productos): el dibujo de tapitas toma la forma del producto, y el festejo y el recorrido lo nombran

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: La pantalla «Productos» del panel del club

**Files:**
- Modify: `src/components/features/CommerceSideNav.tsx`
- Modify: `src/components/features/CommerceSideNav.test.ts`
- Modify: `src/components/features/CommerceLayout.tsx` (la llamada a `navDelPanel`)
- Create: `src/pages/commerce/CommerceProducts.tsx`
- Test: `src/pages/commerce/CommerceProducts.test.tsx`
- Modify: `src/routes.tsx`

**Interfaces:**
- Consumes:
  - de Task 1: `FORMAS`, `crearProducto`, `kilosDeLaMeta`, `puntosDelProducto` y `TAPITAS_POR_KILO`;
  - de Task 2: `useCommerceProductsStore`, con `creados`, `agregar` y `quitar`;
  - de Task 3: `BancoDeTapitas` con `forma`.
- Produces:
  - `navDelPanel(escenario?: Escenario, categoria?: string)`. «Productos» (`/comercio/productos`) aparece sólo si `esInstitucion(categoria)`, en segundo lugar, después de «Resumen».
  - La ruta `/comercio/productos`.

- [ ] **Step 1: Escribí las pruebas que fallan**

En `src/components/features/CommerceSideNav.test.ts`, agregá estos dos casos dentro de `describe('menú del panel', …)`, al final:

```ts
  it('«Productos» es de las instituciones: un club o un estadio lo ven, un comercio no', () => {
    expect(navDelPanel('club', 'club').map((i) => i.to)).toContain('/comercio/productos')
    expect(navDelPanel('general', 'estadio').map((i) => i.to)).toContain('/comercio/productos')
    expect(navDelPanel('general', 'comercio').map((i) => i.to)).not.toContain('/comercio/productos')
    expect(navDelPanel('general').map((i) => i.to)).not.toContain('/comercio/productos')
  })

  it('para el club, «Productos» va segundo, después del resumen', () => {
    expect(navDelPanel('club', 'club').map((i) => i.label).slice(0, 2)).toEqual(['Resumen', 'Productos'])
  })
```

Creá `src/pages/commerce/CommerceProducts.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor } from '@/types'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useSessionStore } from '@/store/session'
import CommerceProducts from './CommerceProducts'

const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
const puntos = [punto('p_club_estadio', 'Punto R · Estadio'), punto('p_club_sede', 'Punto R · Sede social')]

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', etiqueta: 'Banco de suplentes',
  sponsorId: 's_club', sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas',
  goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31',
  illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve([banco]),
    getPoints: () => Promise.resolve(puntos),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

function verProductos(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceProducts />
    </MemoryRouter>,
  )
}

async function abrirNuevoProducto() {
  await screen.findByText('Banco de suplentes con el plástico de la hinchada')
  fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
  return screen.findByRole('dialog', { name: 'Nuevo producto' })
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

beforeEach(() => {
  useCommerceProductsStore.setState({ creados: [] })
  useActivityStore.setState({ sessionContributions: [] })
  useSessionStore.setState({ user: null })
})

describe('Productos del panel del club', () => {
  it('lista el banco del club con su meta en kilos y dónde junta', async () => {
    verProductos()
    expect(await screen.findByText('Banco de suplentes con el plástico de la hinchada')).toBeInTheDocument()
    expect(screen.getByText('Meta: 1.261 kg · 300.000 tapitas')).toBeInTheDocument()
    expect(await screen.findByText('Punto R · Estadio, Punto R · Sede social')).toBeInTheDocument()
  })

  it('propone butacas de 500 kg en la sede, y al publicar el producto arranca en cero', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    expect(within(dialogo).getByRole('button', { name: 'Butacas' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('Butacas para la platea')
    expect(within(dialogo).getByText('≈ 119.000 tapitas, a 238 por kilo')).toBeInTheDocument()
    expect(within(dialogo).getByLabelText('Punto R')).toHaveValue('p_club_sede')
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))

    const [creado] = useCommerceProductsStore.getState().creados
    expect(creado).toMatchObject({
      title: 'Butacas para la platea', forma: 'butacas', puntoId: 'p_club_sede', goalUnits: 119000,
      collectedUnits: 0, sponsorId: 's_club', sponsorName: 'Talleres',
    })
    expect(await screen.findByText('Butacas para la platea')).toBeInTheDocument()
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('al elegir otra forma propone su nombre, y la meta cuenta las tapitas', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Arco para las inferiores' }))
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('Arco para las inferiores')
    fireEvent.change(within(dialogo).getByLabelText('Meta en kilos'), { target: { value: '250' } })
    expect(within(dialogo).getByText('≈ 59.500 tapitas, a 238 por kilo')).toBeInTheDocument()
  })

  it('sin nombre no publica', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Otro' }))
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('')
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(0)
  })

  it('no publica dos productos en el mismo Punto R', async () => {
    verProductos()
    for (let i = 0; i < 2; i++) {
      const dialogo = await abrirNuevoProducto()
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    }
    expect(useCommerceProductsStore.getState().creados).toHaveLength(1)
  })

  it('un producto publicado se puede eliminar', async () => {
    verProductos()
    const dialogo = await abrirNuevoProducto()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Publicar para la hinchada' }))
    fireEvent.click(await screen.findByRole('button', { name: /Eliminar/ }))
    expect(useCommerceProductsStore.getState().creados).toHaveLength(0)
  })

  it('un comercio no tiene esta pantalla', () => {
    verProductos({ ...club, id: 's_cafe', category: 'comercio' })
    expect(screen.queryByRole('heading', { name: 'Productos' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Corré las pruebas y verificá que fallan**

Run: `npx vitest run src/components/features/CommerceSideNav.test.ts src/pages/commerce/CommerceProducts.test.tsx; echo "exit=$?"`
Expected: FAIL. `navDelPanel` todavía no tiene «Productos» y `./CommerceProducts` no existe. Termina con `exit=1`.

- [ ] **Step 3: Sumá «Productos» al menú, sólo para instituciones**

En `src/components/features/CommerceSideNav.tsx`:
- En el import de `lucide-react`, agregá `Armchair` (orden alfabético: `Armchair, CreditCard, FileText, …`).
- Cambiá `import { vocabularioDelPanel } from '@/lib/vocabulario'` por `import { esInstitucion, vocabularioDelPanel } from '@/lib/vocabulario'`.
- En `COMMERCE_NAV`, agregá como segundo elemento, después de Resumen:

```ts
  { to: '/comercio/productos', label: 'Productos', icon: Armchair },
```

- Reemplazá `navDelPanel` (con su comentario) por:

```ts
/**
 * El menú del panel: el del escritorio y el del celular salen de acá, para que no difieran.
 * En la demo del club no está «Plan» (ver `muestraPrecios`), y «Productos» es sólo de las
 * instituciones: lo que construye la hinchada es de un club o un estadio, no de un comercio.
 */
export function navDelPanel(escenario: Escenario = ESCENARIO, categoria?: string) {
  return COMMERCE_NAV.filter(
    (i) =>
      (i.to !== '/comercio/plan' || muestraPrecios(escenario)) &&
      (i.to !== '/comercio/productos' || esInstitucion(categoria)),
  )
}
```

- En `CommerceSideNav`, cambiá `{navDelPanel().map(` por `{navDelPanel(ESCENARIO, commerce.category).map(`.

En `src/components/features/CommerceLayout.tsx`:
- Agregá `import { ESCENARIO } from '@/lib/escenario'` debajo de `import { cn } from '@/lib/utils'`.
- Cambiá `{navDelPanel().map(` por `{navDelPanel(ESCENARIO, commerce.category).map(`.

- [ ] **Step 4: Escribí la pantalla**

Creá `src/pages/commerce/CommerceProducts.tsx`:

```tsx
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import type { FormaDelProducto } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { TAPITAS_POR_KILO } from '@/lib/metrics'
import { FORMAS, crearProducto, kilosDeLaMeta, puntosDelProducto } from '@/lib/productosDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { cn, formatNumber, pct, shortCode } from '@/lib/utils'
import { BancoDeTapitas } from '@/components/features/BancoDeTapitas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'

/** La forma que se propone al abrir «Nuevo producto»: algo distinto del banco que ya está. */
const FORMA_INICIAL: FormaDelProducto = 'butacas'
const META_INICIAL = '500'
const nombrePropuesto = (forma: FormaDelProducto) => FORMAS.find((f) => f.forma === forma)?.nombrePorDefecto ?? ''

/**
 * Lo que construye la hinchada (E1.3 del piloto): el banco del club y los productos que el club
 * publica, cada uno con su meta en kilos y su Punto R. Sólo para un club o un estadio.
 */
export default function CommerceProducts() {
  const commerce = useSessionStore((s) => s.commerce)
  const nombreDelHincha = useSessionStore((s) => s.user?.name)
  // Lo que la hinchada aportó en esta sesión (mismo navegador) suma al avance de cada producto.
  const actividad = useActivityStore((s) => s.sessionContributions)
  const creados = useCommerceProductsStore((s) => s.creados)
  const agregar = useCommerceProductsStore((s) => s.agregar)
  const quitar = useCommerceProductsStore((s) => s.quitar)
  const { data: proyectos, loading } = useApi(() => api.getProjects(), [])
  const { data: puntos } = useApi(() => api.getPoints(), [])

  const [abierto, setAbierto] = useState(false)
  const [forma, setForma] = useState<FormaDelProducto>(FORMA_INICIAL)
  const [nombre, setNombre] = useState(nombrePropuesto(FORMA_INICIAL))
  const [metaKg, setMetaKg] = useState(META_INICIAL)
  const [puntoId, setPuntoId] = useState('')

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio" replace />

  const mios = creados.filter((p) => p.sponsorId === commerce.id)
  const delClub = (proyectos ?? []).filter(
    (p) => p.sponsorId === commerce.id && p.illustration === 'bench' && !mios.some((m) => m.id === p.id),
  )
  const lista = [...delClub, ...mios].map((p) => conAportesDeLaSesion(p, actividad, nombreDelHincha))
  const puntosDelClub = (puntos ?? []).filter((p) => p.sponsorId === commerce.id)
  // De entrada, el último Punto R del club: el primero (el estadio) junta para el banco.
  const punto = puntosDelClub.find((p) => p.id === puntoId) ?? puntosDelClub.at(-1)
  const kilos = Math.round(Number(metaKg) || 0)

  function elegirForma(f: FormaDelProducto) {
    setForma(f)
    setNombre(nombrePropuesto(f))
  }

  function publicar() {
    if (!nombre.trim()) return toast.error('Poné el nombre del producto')
    if (kilos < 1) return toast.error('La meta va en kilos: poné 1 o más')
    if (!punto) return toast.error('Elegí el Punto R donde se junta')
    // Un producto abierto por punto: si no, no se sabría a cuál va un aporte.
    const ocupado = mios.find((p) => p.puntoId === punto.id)
    if (ocupado) {
      return toast.error(`El ${punto.name} ya junta para «${ocupado.title}». Elegí otro Punto R o eliminá ese producto.`)
    }
    agregar(
      crearProducto({
        id: `pr_nuevo_${shortCode(6)}`,
        forma,
        nombre,
        metaKg: kilos,
        punto,
        club: { id: commerce!.id, nombre: commerce!.name },
        creadoEn: new Date().toISOString(),
      }),
    )
    setAbierto(false)
    setForma(FORMA_INICIAL)
    setNombre(nombrePropuesto(FORMA_INICIAL))
    setMetaKg(META_INICIAL)
    setPuntoId('')
    toast.success('Publicado: la hinchada ya lo ve en su inicio')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">Lo que construye tu hinchada con sus tapitas.</p>
        </div>
        <Button size="sm" onClick={() => setAbierto(true)}>
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      {loading && !proyectos && <Skeleton className="h-48 w-full" />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((p) => {
          const delPanel = mios.some((m) => m.id === p.id)
          const dondeJunta = puntosDelProducto(p, puntos ?? [], mios)
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="rounded-xl bg-cancha p-3">
                <BancoDeTapitas
                  forma={p.forma}
                  progreso={p.goalUnits > 0 ? p.collectedUnits / p.goalUnits : 0}
                  propias={0}
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <p className="font-bold leading-tight">{p.title}</p>
                {delPanel && <Badge variant="xp">Nuevo</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Meta: {formatNumber(kilosDeLaMeta(p))} kg · {formatNumber(p.goalUnits)} tapitas
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0" />
                {dondeJunta.length > 0 ? dondeJunta.map((pt) => pt.name).join(', ') : 'Sin Punto R'}
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-marcador text-2xl font-bold tabular-nums">{formatNumber(p.collectedUnits)}</span>
                <span className="text-sm font-bold text-eco-700 dark:text-eco-300">
                  {pct(p.collectedUnits, p.goalUnits)}%
                </span>
              </div>
              {delPanel && (
                <Button size="sm" variant="ghost" className="mt-1 text-danger" onClick={() => quitar(p.id)}>
                  <Trash2 size={14} /> Eliminar
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Nuevo producto">
        <div className="space-y-4">
          <div>
            <Label>¿Qué construye la hinchada?</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS.map((f) => (
                <button
                  key={f.forma}
                  type="button"
                  aria-pressed={f.forma === forma}
                  onClick={() => elegirForma(f.forma)}
                  className={cn(
                    'rounded-xl border-2 p-2 text-left text-sm font-semibold transition-colors',
                    f.forma === forma
                      ? 'border-eco-600 bg-eco-50 dark:bg-eco-900/30'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  {/* El dibujo es un ícono de la forma: no representa ninguna cantidad. */}
                  <span aria-hidden className="block">
                    <BancoDeTapitas forma={f.forma} progreso={0.4} propias={0} />
                  </span>
                  <span className="mt-1 block">{f.nombre}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="producto-nombre">Nombre</Label>
            <Input
              id="producto-nombre"
              placeholder="Ej.: Cestos para la tribuna"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="producto-meta">Meta en kilos</Label>
            <Input
              id="producto-meta"
              type="number"
              inputMode="numeric"
              min={1}
              value={metaKg}
              onChange={(e) => setMetaKg(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ≈ {formatNumber(kilos * TAPITAS_POR_KILO)} tapitas, a {TAPITAS_POR_KILO} por kilo
            </p>
          </div>
          <div>
            <Label htmlFor="producto-punto">Punto R</Label>
            <select
              id="producto-punto"
              value={punto?.id ?? ''}
              onChange={(e) => setPuntoId(e.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground"
            >
              {puntosDelClub.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Desde que lo publiques, lo que la hinchada deje en este Punto R suma a este producto.
            </p>
          </div>
          <Button block size="lg" onClick={publicar}>
            Publicar para la hinchada
          </Button>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 5: Agregá la ruta**

En `src/routes.tsx`:
- Debajo de `const CommerceResumen = lazyWithRetry(() => import('@/pages/commerce/CommerceResumen'))`, agregá:

```ts
const CommerceProducts = lazyWithRetry(() => import('@/pages/commerce/CommerceProducts'))
```

- En los hijos de `CommerceLayout`, después de `{ index: true, element: withSuspense(<CommerceResumen />) },`, agregá:

```tsx
            { path: 'productos', element: withSuspense(<CommerceProducts />) },
```

- [ ] **Step 6: Corré las pruebas y verificá que pasan**

Run: `npx vitest run src/components/features/CommerceSideNav.test.ts src/pages/commerce/CommerceProducts.test.tsx; echo "exit=$?"`
Expected: PASS con `exit=0`.

- [ ] **Step 7: Corré la suite, el tipado y el lint**

Run, cada uno por separado:
- `npx vitest run; echo "exit=$?"`, con `exit=0`.
- `npx tsc -p tsconfig.app.json; echo "exit=$?"`, con `exit=0`.
- `npx eslint src/components/features/CommerceSideNav.tsx src/components/features/CommerceSideNav.test.ts src/components/features/CommerceLayout.tsx src/pages/commerce/CommerceProducts.tsx src/pages/commerce/CommerceProducts.test.tsx src/routes.tsx; echo "exit=$?"`, sin errores.

- [ ] **Step 8: Commit**

```bash
git add src/components/features/CommerceSideNav.tsx src/components/features/CommerceSideNav.test.ts src/components/features/CommerceLayout.tsx src/pages/commerce/CommerceProducts.tsx src/pages/commerce/CommerceProducts.test.tsx src/routes.tsx
git commit -m "feat(productos): el panel del club publica lo que construye su hinchada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: El inicio del hincha muestra cada producto en su pestaña

**Files:**
- Modify: `src/pages/Home.tsx` (reemplazo completo)
- Test: `src/pages/Home.test.tsx` (reemplazo completo)

**Interfaces:**
- Consumes:
  - de Task 1: `esDelPanel` y `nombreDelProducto`;
  - de Task 2: `useCommerceProductsStore`, con `creados`;
  - de Task 3: `BancoDeLaHinchada`, que ya pasa `forma` al dibujo.
- Produces:
  - El grupo `role="group"` con `aria-label="Productos de la hinchada"` y un botón `aria-pressed` por producto. Aparece sólo si el club destacado tiene más de un producto que se dibuja como banco.
  - Con un producto del panel elegido, «Sumá tus tapitas» guarda su `puntoId` en `sessionStorage[claveDeAlmacenamiento('scan-point')]`, que el escáner ya lee.

- [ ] **Step 1: Escribí las pruebas que fallan**

Reemplazá `src/pages/Home.test.tsx` entero por:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject } from '@/types'
import Home from './Home'

const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Club', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [], topContributors: [{ name: 'Camila R.', units: 640, avatarColor: '#16a34a' }],
} as ImpactProject

const butacas = {
  ...banco, id: 'pr_nuevo_1', title: 'Butacas para la platea', goalUnits: 119000, collectedUnits: 0,
  myContributionUnits: 0, estimatedDate: '', topContributors: [], forma: 'butacas', puntoId: 'p_club_sede',
  creadoEn: '2026-10-10T12:00:00.000Z',
} as ImpactProject

// Los proyectos que devuelve la API en cada caso: arranca siendo sólo el banco.
let proyectosDelCaso: ImpactProject[] = [banco]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getProjects: () => Promise.resolve(proyectosDelCaso),
    getContributions: () => Promise.resolve([]),
    getCauses: () => Promise.resolve([]),
  },
}))

function verElInicio() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
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

describe('inicio del hincha', () => {
  beforeEach(() => {
    proyectosDelCaso = [banco]
    sessionStorage.clear()
  })

  it('arranca con el banco de la hinchada y su botón, sin el viejo «Escanear un aporte»', async () => {
    verElInicio()
    expect(await screen.findByText('Sumá tus tapitas')).toBeInTheDocument()
    expect(screen.getByText('42.840')).toBeInTheDocument()
    expect(screen.queryByText('Escanear un aporte')).not.toBeInTheDocument()
  })

  it('un proyecto que no es un banco sigue con «Tu impacto» y conserva el botón para escanear', async () => {
    proyectosDelCaso = [{ ...banco, id: 'pr_totem', title: 'Tótem reciclado', illustration: 'totem' } as ImpactProject]
    verElInicio()
    expect(await screen.findByText('Tu impacto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Escanear un aporte/ })).toHaveAttribute('href', '/escanear')
    expect(screen.queryByText('Sumá tus tapitas')).not.toBeInTheDocument()
  })

  it('con un solo producto no hay pestañas', async () => {
    verElInicio()
    await screen.findByText('Sumá tus tapitas')
    expect(screen.queryByRole('group', { name: 'Productos de la hinchada' })).not.toBeInTheDocument()
  })

  it('con un producto que publicó el club hay pestañas: el banco elegido de entrada y el nuevo marcado', async () => {
    proyectosDelCaso = [banco, butacas]
    verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    expect(within(pestanas).getByRole('button', { name: /Banco de suplentes/ })).toHaveAttribute('aria-pressed', 'true')
    expect(within(pestanas).getByRole('button', { name: /Butacas para la platea/ })).toHaveTextContent('nuevo')
    expect(screen.getByText('42.840')).toBeInTheDocument()
  })

  it('al tocar la pestaña del producto nuevo se ve ese producto, con su forma', async () => {
    proyectosDelCaso = [banco, butacas]
    const { container } = verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    fireEvent.click(within(pestanas).getByRole('button', { name: /Butacas para la platea/ }))
    expect(screen.getByRole('heading', { name: 'Butacas para la platea' })).toBeInTheDocument()
    expect(container.querySelector('svg[data-forma="butacas"]')).not.toBeNull()
    expect(within(pestanas).getByRole('button', { name: /Butacas para la platea/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('con el producto nuevo elegido, «Sumá tus tapitas» deja su Punto R listo para el escáner', async () => {
    proyectosDelCaso = [banco, butacas]
    verElInicio()
    const pestanas = await screen.findByRole('group', { name: 'Productos de la hinchada' })
    fireEvent.click(within(pestanas).getByRole('button', { name: /Butacas para la platea/ }))
    fireEvent.click(screen.getByRole('link', { name: /Sumá tus tapitas/ }))
    expect(sessionStorage.getItem('reciclaxp-scan-point')).toBe('p_club_sede')
  })
})
```

- [ ] **Step 2: Corré las pruebas y verificá que fallan**

Run: `npx vitest run src/pages/Home.test.tsx; echo "exit=$?"`
Expected: FAIL. Los casos de pestañas no encuentran el grupo «Productos de la hinchada». Termina con `exit=1`.

- [ ] **Step 3: Reemplazá `src/pages/Home.tsx` entero**

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Leaf, QrCode, Sparkles, Trophy } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { MATERIAL_EMOJI, MATERIAL_UNIT, cn, formatNumber, formatXp, timeAgo } from '@/lib/utils'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { XpWallet } from '@/components/features/XpWallet'
import { ImpactProgress } from '@/components/features/ImpactProgress'
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { esDelPanel, nombreDelProducto } from '@/lib/productosDelClub'
import { ultimosAportesDeLaHinchada } from '@/lib/ultimosAportes'
import { BancoDeLaHinchada } from '@/components/features/BancoDeLaHinchada'
import { CauseCard } from '@/components/features/CauseCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)
  const sessionContributions = useActivityStore((s) => s.sessionContributions)
  // Lo que el club publica desde el panel, aunque sea en otra pestaña, vuelve a pedir los proyectos.
  const creados = useCommerceProductsStore((s) => s.creados)
  const { data: projects, error: projectsError, reload: reloadProjects } = useApi(
    () => api.getProjects(),
    [creados],
  )
  const { data: history } = useApi(() => api.getContributions(), [])
  const { data: causes } = useApi(() => api.getCauses(), [])
  const [elegidoId, setElegidoId] = useState<string>()

  const principal = projects?.[0]
  // Los productos de la hinchada del club destacado: su banco y los que el club publicó desde el panel.
  const productos =
    principal?.illustration === 'bench'
      ? (projects ?? []).filter((p) => p.sponsorId === principal.sponsorId && p.illustration === 'bench')
      : []
  const elegido = productos.find((p) => p.id === elegidoId) ?? principal
  // El proyecto destacado suma los aportes de esta sesión (ver src/lib/aportesDeLaSesion.ts).
  const featured = elegido && conAportesDeLaSesion(elegido, sessionContributions, user?.name)
  // El banco de la hinchada: sólo para un proyecto que se dibuja como banco.
  const esBanco = featured?.illustration === 'bench'
  const aportesDelBanco = featured && esBanco ? ultimosAportesDeLaHinchada(featured, sessionContributions, user?.name) : []
  const propias = featured && featured.collectedUnits > 0 ? featured.myContributionUnits / featured.collectedUnits : 0
  const featuredCause = causes?.[0]
  const recent = [...sessionContributions, ...(history ?? [])].slice(0, 4)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">¡Hola de nuevo!</p>
        <h1 className="text-2xl font-extrabold leading-tight">
          {user?.name.split(' ')[0] ?? 'Reciclador'} 👋
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        {/* Columna principal */}
        <div className="space-y-5 lg:col-span-2">
          {/* El banco de la hinchada del club, o el proyecto destacado si no se dibuja como banco */}
          {projectsError && !featured ? (
            <ErrorState message={projectsError} onRetry={reloadProjects} />
          ) : featured && esBanco ? (
            <div className="space-y-3">
              {/* Un producto por pestaña, si el club publicó alguno además del banco */}
              {productos.length > 1 && (
                <div
                  role="group"
                  aria-label="Productos de la hinchada"
                  className="no-scrollbar flex gap-2 overflow-x-auto"
                >
                  {productos.map((p) => {
                    const activo = p.id === featured.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={activo}
                        onClick={() => setElegidoId(p.id)}
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                          activo
                            ? 'bg-eco-600 text-white'
                            : 'bg-card text-muted-foreground ring-1 ring-border hover:bg-muted',
                        )}
                      >
                        {nombreDelProducto(p)}
                        {esDelPanel(p) && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wide',
                              activo ? 'bg-white/20 text-white' : 'bg-xp-100 text-xp-700',
                            )}
                          >
                            nuevo
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
              <BancoDeLaHinchada
                key={featured.id}
                proyecto={featured}
                items={aportesDelBanco}
                propias={propias}
                enlace={`/proyecto/${featured.id}`}
                accion={
                  <Link
                    to="/escanear"
                    className="block"
                    onClick={() => {
                      // Un producto del panel junta en su Punto R: el escáner arranca con ese punto elegido.
                      if (featured.puntoId) sessionStorage.setItem(claveDeAlmacenamiento('scan-point'), featured.puntoId)
                    }}
                  >
                    <Button block size="lg" variant="xp">
                      <QrCode size={20} /> Sumá tus tapitas
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : featured ? (
            <>
              <Link to="/escanear" className="block">
                <Button block size="lg" className="shadow-md shadow-eco-600/20">
                  <QrCode size={20} /> Escanear un aporte
                </Button>
              </Link>
              <Card>
                <div className="flex items-center justify-between p-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-eco-600" />
                    <h2 className="font-bold">Tu impacto</h2>
                  </div>
                  <Link
                    to={`/proyecto/${featured.id}`}
                    className="inline-flex items-center text-sm font-semibold text-eco-700"
                  >
                    Ver <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="px-5 pb-5">
                  <p className="mb-3 font-bold leading-tight">{featured.title}</p>
                  <ImpactProgress project={featured} compact />
                </div>
              </Card>
            </>
          ) : (
            <Skeleton className="h-80 w-full rounded-2xl" />
          )}

          <XpWallet />
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Causa destacada */}
          {featuredCause && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold">Sumá a una causa</h2>
                <Link
                  to="/causas"
                  className="inline-flex items-center text-sm font-semibold text-eco-700 dark:text-eco-300"
                >
                  Ver todas <ChevronRight size={16} />
                </Link>
              </div>
              <CauseCard
                cause={featuredCause}
                onClick={() => navigate(`/causa/${featuredCause.id}`)}
              />
            </div>
          )}

          {/* Marcas de la red */}
          <Link to="/marcas" className="block">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300">
                <Leaf size={18} />
              </span>
              <div className="flex-1">
                <p className="font-bold">Marcas de la red</p>
                <p className="text-xs text-muted-foreground">
                  Empresas y comercios de la red, con su Huella Verde
                </p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
          </Link>

          {/* Premio del mes */}
          <Link to="/ranking" className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-xp-400 to-xp-500 p-4 text-ink-900 shadow-sm">
              <Trophy size={28} />
              <div className="flex-1">
                <p className="text-sm font-extrabold leading-tight">Ranking del mes</p>
                <p className="text-xs font-medium text-ink-800/80">
                  Subí posiciones y ganá premios de los sponsors
                </p>
              </div>
              <ChevronRight size={20} />
            </div>
          </Link>
        </div>
      </div>

      {/* Actividad reciente */}
      <div>
        <h2 className="mb-2 font-bold">Actividad reciente</h2>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {recent.length === 0 && (
            <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground lg:col-span-2">
              Todavía no registraste aportes. ¡Escaneá tu primer QR!
            </p>
          )}
          {recent.map((item) => {
            const isRecycle = 'material' in item
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-lg">
                  {isRecycle ? MATERIAL_EMOJI[item.material] : '🛍️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {isRecycle ? item.pointName : `Compra · ${item.sponsorName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRecycle
                      ? item.units
                        ? `${formatNumber(item.units)} ${MATERIAL_UNIT[item.material]}`
                        : `${item.weightKg} kg`
                      : `$${formatNumber(item.amountArs)}`}{' '}
                    · {timeAgo(item.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-eco-700 dark:text-eco-300">
                    +{formatXp(item.xpEarned)}
                  </p>
                  {isRecycle && item.status === 'pendiente' && (
                    <Badge variant="warning">Pendiente</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Corré las pruebas y verificá que pasan**

Run: `npx vitest run src/pages/Home.test.tsx; echo "exit=$?"`
Expected: PASS, 6 pruebas y `exit=0`.

- [ ] **Step 5: Corré la suite, el tipado y el lint**

Run, cada uno por separado:
- `npx vitest run; echo "exit=$?"`, con `exit=0`.
- `npx tsc -p tsconfig.app.json; echo "exit=$?"`, con `exit=0`.
- `npx eslint src/pages/Home.tsx src/pages/Home.test.tsx; echo "exit=$?"`, sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.tsx src/pages/Home.test.tsx
git commit -m "feat(productos): el inicio del hincha muestra cada producto del club en su pestaña

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: El informe para la Comisión Directiva

**Files:**
- Create: `src/hooks/useMetricasDelPanel.ts`
- Modify: `src/pages/commerce/CommerceResumen.tsx` (usa el hook)
- Modify: `src/pages/commerce/CommerceReports.tsx` (reemplazo completo: usa el hook y suma la tarjeta del informe)
- Create: `src/lib/informe.ts`
- Test: `src/lib/informe.test.ts`
- Create: `src/pages/commerce/CommerceInforme.tsx`
- Test: `src/pages/commerce/CommerceInforme.test.tsx`
- Test: `src/pages/commerce/CommerceReports.test.tsx` (nuevo)
- Modify: `src/routes.tsx`
- Modify: `src/components/features/CommerceLayout.tsx` y `src/components/features/CommerceSideNav.tsx` (`data-no-imprimir`)
- Modify: `src/index.css` (regla de impresión y márgenes de página)

**Interfaces:**
- Consumes:
  - de Task 1: `esDelPanel`, `kilosDeLaMeta` y `puntosDelProducto`;
  - de Task 2: `useCommerceProductsStore`;
  - de Task 3: `BancoDeTapitas` con `forma`;
  - del repo:
    - `conAportesDeLaSesion` y `conAporteDeLaSesionEnLaTraza` (`@/lib/aportesDeLaSesion`);
    - `estadoDelRecorrido` (`@/lib/recorridoDeLaTapita`);
    - `posicionEnLaRed` y `textoDePosicion` (`@/lib/posicionEnLaRed`);
    - `AVISO_DE_EJEMPLO` y `csvDelReporte` (`@/lib/reporte`).
- Produces:
  - `useMetricasDelPanel(): { m: SponsorMetrics | null; points: RecyclePoint[] | null; loading: boolean; error: string | null; reload: () => void }`.
  - De `@/lib/informe`:
    - `ETAPAS_DEL_PILOTO`;
    - `SIN_PESAJES`;
    - `topDeLaHinchada(productos, tope?)`.
  - La ruta `/comercio/informe`.
  - El atributo `data-no-imprimir`, que oculta un elemento al imprimir.

- [ ] **Step 1: Escribí las pruebas que fallan**

Creá `src/lib/informe.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { ETAPAS_DEL_PILOTO, SIN_PESAJES, topDeLaHinchada } from './informe'

const producto = (id: string, topContributors: ImpactProject['topContributors']) =>
  ({ id, topContributors }) as ImpactProject

describe('topDeLaHinchada', () => {
  it('suma a cada hincha lo de todos los productos y deja a los primeros', () => {
    const top = topDeLaHinchada(
      [
        producto('banco', [
          { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
          { name: 'Camila R.', units: 640, avatarColor: '#059669' },
        ]),
        producto('butacas', [{ name: 'Camila R.', units: 3000, avatarColor: '#059669' }]),
      ],
      5,
    )
    expect(top.map((c) => [c.name, c.units])).toEqual([
      ['Camila R.', 3640],
      ['Facu R.', 3120],
    ])
  })

  it('corta en el tope y, sin aportantes, no inventa ninguno', () => {
    const muchos = Array.from({ length: 8 }, (_, i) => ({ name: `H${i}`, units: i, avatarColor: '#000' }))
    expect(topDeLaHinchada([producto('banco', muchos)])).toHaveLength(5)
    expect(topDeLaHinchada([])).toEqual([])
  })
})

describe('ETAPAS_DEL_PILOTO', () => {
  it('son las cuatro del piloto y cubren los 90 días sin huecos', () => {
    expect(ETAPAS_DEL_PILOTO.map((e) => e.nombre)).toEqual([
      'Preparación',
      'Lanzamiento controlado',
      'Operación en partidos',
      'Evaluación y decisión',
    ])
    expect(ETAPAS_DEL_PILOTO.map((e) => e.dias.match(/\d+/g)!.map(Number))).toEqual([
      [1, 20],
      [21, 35],
      [36, 75],
      [76, 90],
    ])
  })
})

describe('SIN_PESAJES', () => {
  it('no trae números de partidos: sólo dice desde cuándo se completa', () => {
    expect(SIN_PESAJES).toBe('Se completa con el pesaje de cada partido, desde la etapa 1 del piloto.')
  })
})
```

Creá `src/pages/commerce/CommerceInforme.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImpactProject, RecyclePoint, Sponsor, TraceEvent } from '@/types'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useSessionStore } from '@/store/session'
import { AVISO_DE_EJEMPLO } from '@/lib/reporte'
import { SIN_PESAJES } from '@/lib/informe'
import CommerceInforme from './CommerceInforme'

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
const puntos = [punto('p_club_estadio', 'Punto R · Estadio'), punto('p_club_sede', 'Punto R · Sede social')]
const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [
    { label: 'Recolección', done: false },
    { label: 'Pesaje y retiro', done: false },
  ],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
    { name: 'Camila R.', units: 640, avatarColor: '#059669' },
  ],
} as ImpactProject
const traza: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas.', date: '2026-10-04', done: true },
  {
    stage: 'validacion', title: 'Pesaje del lote',
    detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.',
    date: null, done: false, operator: 'Talleres',
  },
]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve(puntos),
    getSponsors: () => Promise.resolve([club, { ...club, id: 's_cafe', name: 'Café Lúmen', category: 'comercio', greenScore: 70 }]),
    getProjects: () => Promise.resolve([banco]),
    getProjectTrace: () => Promise.resolve(traza),
  },
}))

function verElInforme(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceInforme />
    </MemoryRouter>,
  )
}

const seccion = async (titulo: string) => (await screen.findByRole('heading', { name: titulo })).closest('section')!

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

beforeEach(() => {
  useActivityStore.setState({ sessionContributions: [] })
  useCommerceProductsStore.setState({ creados: [] })
  useSessionStore.setState({ user: null })
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.classList.remove('dark')
})

describe('informe para la Comisión Directiva', () => {
  it('lleva el título, la fecha de emisión y el aviso de datos de ejemplo, arriba y al pie', async () => {
    const { container } = verElInforme()
    expect(await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })).toBeInTheDocument()
    expect(screen.getByText(/Emitido el/)).toBeInTheDocument()
    expect(screen.getByText(AVISO_DE_EJEMPLO)).toBeInTheDocument()
    expect(container.querySelector('footer')?.textContent).toContain('Datos de ejemplo de la demo')
  })

  it('pone los números del panel: kilos, tapitas, aportes, hinchas y la Huella Verde con su puesto', async () => {
    verElInforme()
    const numeros = await seccion('En números')
    const t = numeros.textContent ?? ''
    expect(t).toContain('Kilos recuperados180')
    expect(t).toContain('Tapitas42.840')
    expect(t).toContain('Aportes828')
    expect(t).toContain('Hinchas que participaron este mes162')
    expect(t).toContain('Beneficios canjeados28')
    expect(t).toContain('Huella Verde64 de 100')
    expect(await within(numeros).findByText(/Puesto 2 de 2 en la red/)).toBeInTheDocument()
  })

  it('muestra cada producto con su dibujo, su avance, dónde junta y en qué etapa está', async () => {
    verElInforme()
    const productos = await seccion('Lo que construye la hinchada')
    expect(productos.textContent).toContain('42.840 de 300.000 tapitas · 14% · meta 1.261 kg')
    expect(productos.querySelector('svg[data-forma="banco"]')).not.toBeNull()
    expect(await within(productos).findByText(/Junta en: Punto R · Estadio, Punto R · Sede social/)).toBeInTheDocument()
    expect(productos.textContent).toContain('Etapa actual: Recolección')
  })

  it('«Partido por partido» muestra la tabla con sus columnas y sin ningún número de partido', async () => {
    verElInforme()
    const partidos = await seccion('Partido por partido')
    expect([...partidos.querySelectorAll('th')].map((th) => th.textContent)).toEqual([
      'Partido', 'Fecha', 'Kilos', 'Tapitas', 'Hinchas',
    ])
    const celdas = partidos.querySelectorAll('tbody td')
    expect(celdas).toHaveLength(1)
    expect(celdas[0].textContent).toBe(SIN_PESAJES)
  })

  it('pone a los que más aportan y lo que sigue: la próxima etapa y las cuatro del piloto', async () => {
    verElInforme()
    const top = (await seccion('Los que más aportan')).textContent ?? ''
    expect(top.indexOf('Facu R.')).toBeLessThan(top.indexOf('Camila R.'))
    expect(top).toContain('3.120 tapitas')
    const sigue = await seccion('Lo que sigue')
    expect(await within(sigue).findByText(/pesaje del lote/)).toBeInTheDocument()
    expect(sigue.textContent).toContain('a cargo de Talleres')
    for (const etapa of ['Preparación', 'Lanzamiento controlado', 'Operación en partidos', 'Evaluación y decisión']) {
      expect(sigue.textContent).toContain(etapa)
    }
  })

  it('«Imprimir o guardar PDF» abre la impresión del navegador, y sus botones no se imprimen', async () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
    verElInforme()
    const boton = await screen.findByRole('button', { name: /Imprimir o guardar PDF/ })
    expect(boton.closest('[data-no-imprimir]')).not.toBeNull()
    fireEvent.click(boton)
    expect(imprimir).toHaveBeenCalledOnce()
  })

  it('en modo oscuro se imprime en claro, y después vuelve al oscuro', async () => {
    document.documentElement.classList.add('dark')
    verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    window.dispatchEvent(new Event('beforeprint'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    window.dispatchEvent(new Event('afterprint'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('un comercio no tiene informe', () => {
    verElInforme({ ...club, id: 's_cafe', category: 'comercio' })
    expect(screen.queryByRole('heading', { name: 'Informe para la Comisión Directiva' })).not.toBeInTheDocument()
  })
})
```

Creá `src/pages/commerce/CommerceReports.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { useSessionStore } from '@/store/session'
import CommerceReports from './CommerceReports'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: { getPoints: () => Promise.resolve([]) },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

function verReportes(sponsor: Sponsor) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceReports />
    </MemoryRouter>,
  )
}

describe('Reportes', () => {
  it('a un club le ofrece el informe para la Comisión Directiva', async () => {
    verReportes(club)
    expect(await screen.findByRole('link', { name: /Informe para la Comisión Directiva/ })).toHaveAttribute(
      'href',
      '/comercio/informe',
    )
  })

  it('a un comercio no', async () => {
    verReportes({ ...club, id: 's_cafe', category: 'comercio' })
    await screen.findByRole('heading', { name: 'Reportes' })
    expect(screen.queryByRole('link', { name: /Informe para la Comisión Directiva/ })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Corré las pruebas y verificá que fallan**

Run: `npx vitest run src/lib/informe.test.ts src/pages/commerce/CommerceInforme.test.tsx src/pages/commerce/CommerceReports.test.tsx; echo "exit=$?"`
Expected: FAIL. No existen `./informe` ni `./CommerceInforme`, y Reportes no tiene la tarjeta. Termina con `exit=1`.

- [ ] **Step 3: Sacá las métricas del panel a un hook**

Creá `src/hooks/useMetricasDelPanel.ts`:

```ts
import { useMemo } from 'react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { useActivityStore } from '@/store/activity'
import { useCouponsStore } from '@/store/coupons'
import { metricsFor } from '@/lib/metrics'
import { metricasConLaSesion } from '@/lib/aportesDeLaSesion'

/**
 * Las métricas del panel con lo que la comunidad hizo en esta sesión (mismo navegador): aportes,
 * XP y canjes. Las usan el resumen, los reportes y el informe, así los tres dicen lo mismo; antes
 * la cuenta estaba copiada en cada pantalla.
 */
export function useMetricasDelPanel() {
  const commerce = useSessionStore((s) => s.commerce)
  const createdCommerce = useCreatedCommerceStore((s) => s.commerce)
  const createdPoint = useCreatedCommerceStore((s) => s.point)
  const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])
  const actividad = useActivityStore((s) => s.sessionContributions)
  const cupones = useCouponsStore((s) => s.coupons)

  const m = useMemo(() => {
    if (!commerce || !points) return null
    const extra = createdCommerce?.id === commerce.id && createdPoint ? [createdPoint] : []
    return metricasConLaSesion(metricsFor(commerce, [...points, ...extra]), actividad, cupones)
  }, [commerce, points, createdCommerce, createdPoint, actividad, cupones])

  return { m, points, loading, error, reload }
}
```

En `src/pages/commerce/CommerceResumen.tsx`:
- Borrá estos imports, que dejan de usarse:
  - `import { useMemo } from 'react'`;
  - `import { useCreatedCommerceStore } from '@/store/createdCommerce'`;
  - `import { metricsFor } from '@/lib/metrics'`;
  - `import { useCouponsStore } from '@/store/coupons'`.
- Cambiá `import { conAportesDeLaSesion, metricasConLaSesion } from '@/lib/aportesDeLaSesion'` por `import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'`.
- Agregá `import { useMetricasDelPanel } from '@/hooks/useMetricasDelPanel'` debajo de `import { useApi } from '@/hooks/useApi'`.
- Reemplazá estas líneas del principio de `CommerceResumen`:

```tsx
  const createdCommerce = useCreatedCommerceStore((s) => s.commerce)
  const createdPoint = useCreatedCommerceStore((s) => s.point)
  const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])
  // Lo que la comunidad hizo en esta sesión (mismo navegador): aportes, XP y canjes.
  const actividad = useActivityStore((s) => s.sessionContributions)
  const cupones = useCouponsStore((s) => s.coupons)
```

por:

```tsx
  // Las métricas con lo que la comunidad hizo en esta sesión (mismo navegador): aportes, XP y canjes.
  const { m, loading, error, reload } = useMetricasDelPanel()
  const actividad = useActivityStore((s) => s.sessionContributions)
```

- Borrá entero el bloque `const m = useMemo(() => { … }, [commerce, points, createdCommerce, createdPoint, actividad, cupones])`.
- No cambies nada más de la pantalla.

Reemplazá `src/pages/commerce/CommerceReports.tsx` entero por:

```tsx
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronRight, Download, FileText, Landmark, Printer } from 'lucide-react'
import type { SponsorMetrics } from '@/types'
import { useSessionStore } from '@/store/session'
import { useMetricasDelPanel } from '@/hooks/useMetricasDelPanel'
import { downloadBlob, formatNumber } from '@/lib/utils'
import { AVISO_DE_EJEMPLO, csvDelReporte, filasDelReporte } from '@/lib/reporte'
import { esInstitucion } from '@/lib/vocabulario'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function CommerceReports() {
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

      {/* El informe para la comisión directiva: es de un club o un estadio */}
      {esInstitucion(commerce.category) && (
        <Link
          to="/comercio/informe"
          className="flex items-center gap-3 rounded-2xl border-2 border-eco-600 bg-eco-50 p-5 transition-colors hover:bg-eco-100 dark:bg-eco-900/20 dark:hover:bg-eco-900/30"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-eco-600 text-white">
            <Landmark size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Informe para la Comisión Directiva</span>
            <span className="block text-sm text-muted-foreground">
              Kilos, hinchas, productos y lo que sigue, en una página lista para imprimir o mandar.
            </span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-muted-foreground" />
        </Link>
      )}

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

- [ ] **Step 4: Escribí lo que el informe cuenta**

Creá `src/lib/informe.ts`:

```ts
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
```

- [ ] **Step 5: Escribí la página del informe**

Creá `src/pages/commerce/CommerceInforme.tsx`:

```tsx
import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, Download, Printer } from 'lucide-react'
import type { TraceEvent } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useMetricasDelPanel } from '@/hooks/useMetricasDelPanel'
import { useSessionStore } from '@/store/session'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { conAporteDeLaSesionEnLaTraza, conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { estadoDelRecorrido } from '@/lib/recorridoDeLaTapita'
import { esDelPanel, kilosDeLaMeta, puntosDelProducto } from '@/lib/productosDelClub'
import { ETAPAS_DEL_PILOTO, SIN_PESAJES, topDeLaHinchada } from '@/lib/informe'
import { posicionEnLaRed, textoDePosicion } from '@/lib/posicionEnLaRed'
import { AVISO_DE_EJEMPLO, csvDelReporte } from '@/lib/reporte'
import { esInstitucion } from '@/lib/vocabulario'
import { downloadBlob, formatDate, formatNumber, pct } from '@/lib/utils'
import { BancoDeTapitas } from '@/components/features/BancoDeTapitas'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** Al imprimir, el informe sale en claro aunque la app esté en modo oscuro: en papel, el texto claro no se lee. */
function useImprimirEnClaro() {
  useEffect(() => {
    const html = document.documentElement
    let eraOscuro = false
    const antes = () => {
      eraOscuro = html.classList.contains('dark')
      html.classList.remove('dark')
    }
    const despues = () => {
      if (eraOscuro) html.classList.add('dark')
    }
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', despues)
    }
  }, [])
}

/**
 * El informe para la Comisión Directiva (E4.2 del piloto): una página del panel lista para imprimir
 * o guardar como PDF, con lo que el panel ya sabe. «Partido por partido» muestra su estructura sin
 * números: se completa con los pesajes, que llegan en la etapa 1 del piloto.
 */
export default function CommerceInforme() {
  const commerce = useSessionStore((s) => s.commerce)
  const nombreDelHincha = useSessionStore((s) => s.user?.name)
  const actividad = useActivityStore((s) => s.sessionContributions)
  const creados = useCommerceProductsStore((s) => s.creados)
  // Las mismas métricas que el resumen y los reportes, con lo que la hinchada hizo en esta sesión.
  const { m, points, loading, error, reload } = useMetricasDelPanel()
  const { data: red } = useApi(() => api.getSponsors(), [])
  const { data: proyectos } = useApi(() => api.getProjects(), [creados])
  useImprimirEnClaro()

  // Los productos del club, con lo que la hinchada aportó en esta sesión.
  const productos = (proyectos ?? [])
    .filter((p) => p.sponsorId === commerce?.id && p.illustration === 'bench')
    .map((p) => conAportesDeLaSesion(p, actividad, nombreDelHincha))
  // Lo que sigue lo dice el recorrido del banco del club.
  const principal = productos.find((p) => !esDelPanel(p)) ?? productos[0]
  const { data: traza } = useApi(
    () => (principal ? api.getProjectTrace(principal.id) : Promise.resolve<TraceEvent[]>([])),
    [principal?.id],
  )
  const eventos = traza && principal ? conAporteDeLaSesionEnLaTraza(traza, principal, actividad) : []
  const { siguiente } = estadoDelRecorrido(eventos)
  const proxima = siguiente === null ? undefined : eventos[siguiente]

  if (!commerce) return null
  if (!esInstitucion(commerce.category)) return <Navigate to="/comercio/reportes" replace />
  if (error && !m) return <ErrorState message={error} onRetry={reload} />
  if (loading || !m) return <Skeleton className="h-96 w-full" />

  const emitido = formatDate(new Date())
  const posicion = red ? textoDePosicion(posicionEnLaRed(commerce.id, m.greenScore, red)) : undefined
  const maxMes = Math.max(1, ...m.monthlySeries.map((s) => s.value))
  const maxPunto = Math.max(1, ...m.byPoint.map((p) => p.contributions))
  const top = topDeLaHinchada(productos)
  const numeros: [string, string][] = [
    ['Kilos recuperados', formatNumber(m.kgRecovered)],
    ['Tapitas', formatNumber(m.capsRecovered)],
    ['Aportes', formatNumber(m.contributions)],
    ['Hinchas que participaron este mes', formatNumber(m.activeUsers)],
    ['Beneficios canjeados', formatNumber(m.benefitsRedeemed)],
    ['Huella Verde', `${m.greenScore} de 100`],
  ]

  function descargarCsv() {
    downloadBlob(`informe-${commerce!.slug}.csv`, csvDelReporte(m!), 'text/csv;charset=utf-8')
    toast.success('CSV descargado 📄')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 print:max-w-none">
      <div data-no-imprimir className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/comercio/reportes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-eco-700 dark:text-eco-300"
        >
          <ChevronLeft size={16} /> Reportes
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={descargarCsv}>
            <Download size={15} /> Descargar CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer size={15} /> Imprimir o guardar PDF
          </Button>
        </div>
      </div>

      <article className="space-y-6 rounded-2xl border border-border bg-card p-5 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] sm:p-8 print:rounded-none print:border-0 print:p-0">
        <header className="border-b-4 border-eco-600 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                {commerce.name} · reciclaje con la hinchada
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">Informe para la Comisión Directiva</h1>
              <p className="mt-1 text-sm text-muted-foreground">Emitido el {emitido}</p>
            </div>
            <p className="shrink-0 font-extrabold text-eco-700 dark:text-eco-300">ReciclaXP</p>
          </div>
          <p className="mt-3 rounded-lg bg-xp-50 px-3 py-2 text-xs font-semibold text-xp-700 dark:bg-xp-700/10 dark:text-xp-300">
            {AVISO_DE_EJEMPLO}
          </p>
        </header>

        <section className="break-inside-avoid">
          <h2 className="text-lg font-extrabold">En números</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {numeros.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="rounded-xl border border-border p-3">
                <dt className="text-xs font-semibold text-muted-foreground">{etiqueta}</dt>
                <dd className="font-marcador text-3xl font-bold tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>
          {posicion && <p className="mt-2 text-xs font-semibold text-eco-700 dark:text-eco-300">{posicion}</p>}
        </section>

        {productos.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Lo que construye la hinchada</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {productos.map((p) => (
                <div key={p.id} className="break-inside-avoid rounded-xl border border-border p-3">
                  <BancoDeTapitas
                    className="max-w-[16rem]"
                    forma={p.forma}
                    progreso={p.goalUnits > 0 ? p.collectedUnits / p.goalUnits : 0}
                    propias={0}
                  />
                  <p className="mt-2 font-bold leading-tight">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(p.collectedUnits)} de {formatNumber(p.goalUnits)} tapitas ·{' '}
                    {pct(p.collectedUnits, p.goalUnits)}% · meta {formatNumber(kilosDeLaMeta(p))} kg
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Junta en:{' '}
                    {puntosDelProducto(p, points ?? [], creados)
                      .map((pt) => pt.name)
                      .join(', ') || 'sin Punto R'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Etapa actual: {p.milestones.find((h) => !h.done)?.label ?? 'terminado'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="break-inside-avoid">
          <h2 className="text-lg font-extrabold">Partido por partido</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-2 font-bold">Partido</th>
                  <th className="py-2 pr-2 font-bold">Fecha</th>
                  <th className="py-2 pr-2 text-right font-bold">Kilos</th>
                  <th className="py-2 pr-2 text-right font-bold">Tapitas</th>
                  <th className="py-2 text-right font-bold">Hinchas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-4 text-center text-sm italic text-muted-foreground">
                    {SIN_PESAJES}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Aportes por mes</h2>
            <div className="mt-3 flex h-36 items-end justify-between gap-2">
              {m.monthlySeries.map((s) => (
                <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[11px] font-bold tabular-nums">{formatNumber(s.value)}</span>
                  <div
                    className="w-full rounded-t-md bg-eco-500"
                    style={{ height: `${Math.max(4, (s.value / maxMes) * 96)}px` }}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Aportes por Punto R</h2>
            <div className="mt-3 space-y-3">
              {m.byPoint.map((p) => (
                <div key={p.point}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate pr-2 font-semibold">{p.point}</span>
                    <span className="font-bold tabular-nums">{formatNumber(p.contributions)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-eco-500"
                      style={{ width: `${(p.contributions / maxPunto) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {top.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="text-lg font-extrabold">Los que más aportan</h2>
            <ol className="mt-3 divide-y divide-border">
              {top.map((c, i) => (
                <li key={c.name} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-5 font-marcador text-base font-bold text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 font-semibold">{c.name}</span>
                  <span className="font-marcador text-base font-bold tabular-nums">{formatNumber(c.units)} tapitas</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="break-inside-avoid">
          <h2 className="text-lg font-extrabold">Lo que sigue</h2>
          {proxima && (
            <p className="mt-2 text-sm">
              La próxima etapa del recorrido de las tapitas: <b>{proxima.title.toLowerCase()}</b>
              {proxima.operator ? `, a cargo de ${proxima.operator}` : ''}. {proxima.detail}
            </p>
          )}
          <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ETAPAS_DEL_PILOTO.map((e) => (
              <li key={e.numero} className="break-inside-avoid rounded-xl border border-border p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                  Etapa {e.numero} · {e.dias}
                </p>
                <p className="font-bold">{e.nombre}</p>
                <p className="text-sm text-muted-foreground">{e.detalle}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="border-t border-border pt-3 text-xs text-muted-foreground">
          Datos de ejemplo de la demo · Generado con ReciclaXP el {emitido}
        </footer>
      </article>
    </div>
  )
}
```

- [ ] **Step 6: Agregá la ruta y que el menú no se imprima**

En `src/routes.tsx`:
- Debajo de `const CommerceReports = lazyWithRetry(() => import('@/pages/commerce/CommerceReports'))`, agregá:

```ts
const CommerceInforme = lazyWithRetry(() => import('@/pages/commerce/CommerceInforme'))
```

- En los hijos de `CommerceLayout`, después de `{ path: 'reportes', element: withSuspense(<CommerceReports />) },`, agregá:

```tsx
            { path: 'informe', element: withSuspense(<CommerceInforme />) },
```

En `src/components/features/CommerceLayout.tsx`:
- Al `<header className="pt-safe sticky top-0 z-30 …">`, agregale el atributo `data-no-imprimir`.
- Cambiá la clase del `<main>` a `"mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-4 lg:px-8 lg:pt-8 print:max-w-none print:p-0"`.
- Cambiá `<AvisoDemo />` por:

```tsx
          {/* El informe impreso lleva su propio aviso, arriba y al pie */}
          <div data-no-imprimir>
            <AvisoDemo />
          </div>
```

En `src/components/features/CommerceSideNav.tsx`, agregale `data-no-imprimir` al `<aside>` de `CommerceSideNav`.

Al final de `src/index.css`, agregá:

```css

/*
 * Al imprimir (el informe para la Comisión Directiva) no salen el menú, el aviso de la demo ni los
 * botones: van marcados con `data-no-imprimir`. El informe lleva su propio aviso, arriba y al pie.
 */
@media print {
  [data-no-imprimir] {
    display: none !important;
  }
}

@page {
  margin: 14mm;
}
```

- [ ] **Step 7: Corré las pruebas y verificá que pasan**

Run: `npx vitest run src/lib/informe.test.ts src/pages/commerce; echo "exit=$?"`
Expected: PASS con `exit=0`, incluido `CommerceResumen.test.tsx`, que ya existía y no se toca.

- [ ] **Step 8: Corré la suite, el tipado y el lint**

Run, cada uno por separado:
- `npx vitest run; echo "exit=$?"`, con `exit=0`.
- `npx tsc -p tsconfig.app.json; echo "exit=$?"`, con `exit=0`.
- `npx eslint src/hooks/useMetricasDelPanel.ts src/lib/informe.ts src/lib/informe.test.ts src/pages/commerce src/routes.tsx src/components/features/CommerceLayout.tsx src/components/features/CommerceSideNav.tsx; echo "exit=$?"`, sin errores.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/useMetricasDelPanel.ts src/pages/commerce/CommerceResumen.tsx src/pages/commerce/CommerceReports.tsx src/pages/commerce/CommerceReports.test.tsx src/lib/informe.ts src/lib/informe.test.ts src/pages/commerce/CommerceInforme.tsx src/pages/commerce/CommerceInforme.test.tsx src/routes.tsx src/components/features/CommerceLayout.tsx src/components/features/CommerceSideNav.tsx src/index.css
git commit -m "feat(informe): el informe para la Comisión Directiva, listo para imprimir o guardar en PDF

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
