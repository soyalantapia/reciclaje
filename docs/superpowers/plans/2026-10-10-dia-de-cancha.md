# Día de cancha · plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar los cuatro momentos clave de la demo (inicio, proyecto, festejo del aporte y panel del club) con la dirección «Día de cancha», sin tocar los circuitos ya verificados.

**Architecture:**
- La lógica nueva va en dos módulos puros con pruebas (`src/lib/bancoDeTapitas.ts`, `src/lib/ultimosAportes.ts`).
- La parte visual son piezas reutilizables en `src/components/features/`: `Cancha`, `Marcador`, `BancoDeTapitas`, `UltimosAportes`, `BancoDeLaHinchada` y `FestejoDelAporte`.
- Las cuatro pantallas sólo componen esas piezas con datos que ya existen (`conAportesDeLaSesion`, `metricasConLaSesion`).

**Tech Stack:** React 19, TypeScript, Tailwind 4 (`@theme inline` en `src/index.css`), framer-motion 12, Vitest con jsdom y Testing Library.

**Diseño:** `docs/superpowers/specs/2026-10-10-dia-de-cancha-design.md`

## Global Constraints

- **Ningún número nuevo:** todo sale del proyecto con `conAportesDeLaSesion` o del panel con `metricasConLaSesion`.
- **Prohibido:** «en vivo», «tiempo real», horarios inventados, colores o escudo del club, marcas reales en la demo del club.
- **El aviso «Demo · los números son de ejemplo»** sigue en cada pantalla (lo pone el layout: no se toca).
- **Grillas:** toda grilla nueva con columnas por ancho lleva `grid-cols-1` de base (`src/lib/grillas.test.ts` lo vigila).
- **Movimiento:** con `useReducedMotion()` no se anima nada y se ve el estado final.
- **Textos de la interfaz:** en español rioplatense, con voseo.
- **Rama `feat/dia-de-cancha`:** nada se mergea a `main` sin el OK de Alan sobre las capturas.
- **Comandos en el worktree:** `cd ~/.reunion/worktrees/reciclaxp-tareas/cancha`, con `SP=/private/tmp/claude-501/-Users-alannaimtapia-dev-speed-sonar-fix/19e2e349-5746-4871-ab4c-f9c155649458/scratchpad`.
- **El exit de una suite se lee directo, nunca a través de un pipe:** `npx vitest run > $SP/x.txt 2>&1; echo $?`.

---

### Task 1: La cuenta del banco de tapitas

**Files:**
- Create: `src/lib/bancoDeTapitas.ts`
- Test: `src/lib/bancoDeTapitas.test.ts`

**Interfaces:**
- Produces:
  - `type EstadoTapita = 'vacia' | 'hinchada' | 'tuya'`
  - `COLUMNAS_DEL_BANCO = 16`, `FILAS_DEL_BANCO = 5`, `TAPITAS_DEL_BANCO = 80`
  - `tapitasEncendidas(progreso: number, total: number): number`
  - `estadosDelBanco(o: { total: number; progreso: number; propias: number }): EstadoTapita[]`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { estadosDelBanco, tapitasEncendidas, TAPITAS_DEL_BANCO } from './bancoDeTapitas'

const cuantas = (estados: string[], e: string) => estados.filter((x) => x === e).length

describe('tapitasEncendidas', () => {
  it('sin avance no enciende ninguna', () => {
    expect(tapitasEncendidas(0, 80)).toBe(0)
    expect(tapitasEncendidas(Number.NaN, 80)).toBe(0)
  })

  it('con algo de avance enciende al menos una: un proyecto que arrancó no se ve vacío', () => {
    expect(tapitasEncendidas(0.0001, 80)).toBe(1)
  })

  it('el 14 % de 80 son 11', () => {
    expect(tapitasEncendidas(42840 / 300000, 80)).toBe(11)
  })

  it('completo o pasado enciende todas', () => {
    expect(tapitasEncendidas(1, 80)).toBe(80)
    expect(tapitasEncendidas(1.5, 80)).toBe(80)
  })
})

describe('estadosDelBanco', () => {
  it('las tuyas son las últimas encendidas, y si aportaste hay al menos una', () => {
    const e = estadosDelBanco({ total: TAPITAS_DEL_BANCO, progreso: 42840 / 300000, propias: 640 / 42840 })
    expect(e).toHaveLength(80)
    expect(cuantas(e, 'hinchada')).toBe(10)
    expect(cuantas(e, 'tuya')).toBe(1)
    expect(e[10]).toBe('tuya')
    expect(cuantas(e, 'vacia')).toBe(69)
  })

  it('sin aporte propio no hay tuyas', () => {
    expect(cuantas(estadosDelBanco({ total: 80, progreso: 0.5, propias: 0 }), 'tuya')).toBe(0)
  })

  it('sin avance está todo vacío, aunque haya aporte propio', () => {
    expect(cuantas(estadosDelBanco({ total: 80, progreso: 0, propias: 1 }), 'vacia')).toBe(80)
  })

  it('si todo lo aportaste vos, todas las encendidas son tuyas', () => {
    const e = estadosDelBanco({ total: 80, progreso: 0.25, propias: 1 })
    expect(cuantas(e, 'tuya')).toBe(20)
    expect(cuantas(e, 'hinchada')).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/bancoDeTapitas.test.ts > $SP/t1.txt 2>&1; echo $?; grep -E '×|Tests |Error' $SP/t1.txt | head`
Expected: exit 1, porque no existe el módulo `./bancoDeTapitas`.

- [ ] **Step 3: Write minimal implementation**

```ts
/** Cómo se ve cada tapita del dibujo del banco. */
export type EstadoTapita = 'vacia' | 'hinchada' | 'tuya'

/** El respaldo del banco: 16 columnas por 5 filas de tapitas. */
export const COLUMNAS_DEL_BANCO = 16
export const FILAS_DEL_BANCO = 5
export const TAPITAS_DEL_BANCO = COLUMNAS_DEL_BANCO * FILAS_DEL_BANCO

/**
 * Cuántas tapitas del dibujo se encienden para un avance entre 0 y 1. Con algo de avance se
 * enciende al menos una: un proyecto que arrancó no se ve vacío por redondeo.
 */
export function tapitasEncendidas(progreso: number, total: number): number {
  if (!(progreso > 0)) return 0
  if (progreso >= 1) return total
  return Math.min(total, Math.max(1, Math.round(progreso * total)))
}

/**
 * El estado de cada tapita, en orden de llenado (de abajo hacia arriba, de izquierda a derecha).
 * `propias` es la parte del avance que aportó la persona, entre 0 y 1. Las suyas son las últimas
 * encendidas: quedan arriba, a la vista, y si aportó algo tiene al menos una.
 */
export function estadosDelBanco({
  total,
  progreso,
  propias,
}: {
  total: number
  progreso: number
  propias: number
}): EstadoTapita[] {
  const encendidas = tapitasEncendidas(progreso, total)
  const tuyas =
    encendidas === 0 || !(propias > 0)
      ? 0
      : Math.min(encendidas, Math.max(1, Math.round(propias * encendidas)))
  return Array.from({ length: total }, (_, i) =>
    i >= encendidas ? 'vacia' : i >= encendidas - tuyas ? 'tuya' : 'hinchada',
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/bancoDeTapitas.test.ts > $SP/t1.txt 2>&1; echo $?; grep -E '×|Tests ' $SP/t1.txt`
Expected: exit 0, con `Tests  8 passed (8)`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bancoDeTapitas.ts src/lib/bancoDeTapitas.test.ts
git commit -m "feat(cancha): la cuenta del banco de tapitas, con las tuyas al final

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Los últimos aportes de la hinchada

**Files:**
- Create: `src/lib/ultimosAportes.ts`
- Test: `src/lib/ultimosAportes.test.ts`

**Interfaces:**
- Consumes: `nombreCorto(nombre: string): string` de `src/lib/aportesDeLaSesion.ts`; `formatNumber(n: number): string` de `src/lib/utils.ts`.
- Produces:
  - `interface AporteDeLaHinchada { id: string; nombre: string; texto: string; esTuyo: boolean; cuando?: string }`
  - `ultimosAportesDeLaHinchada(proyecto: ImpactProject, actividad: ActivityItem[], nombreDelUsuario?: string, tope?: number): AporteDeLaHinchada[]`

- [ ] **Step 1: Write the failing test**

```ts
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
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ultimosAportes.test.ts > $SP/t2.txt 2>&1; echo $?`
Expected: exit 1, porque no existe el módulo `./ultimosAportes`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { ActivityItem, Contribution, ImpactProject } from '@/types'
import { nombreCorto } from './aportesDeLaSesion'
import { formatNumber } from './utils'

/** Una fila de «la hinchada en el banco». */
export interface AporteDeLaHinchada {
  id: string
  nombre: string
  /** «dejó 50 tapitas» para lo de esta sesión; «lleva 3.120 tapitas» para el acumulado. */
  texto: string
  esTuyo: boolean
  /** Sólo en los aportes de esta sesión: su hora real. El acumulado no tiene hora. */
  cuando?: string
}

const esAporte = (i: ActivityItem): i is Contribution => !('kind' in i)

/**
 * Lo que muestra el banco de la hinchada: primero los aportes de esta sesión a ese proyecto, con
 * su hora real; después el acumulado de los que más aportan. No dice «en vivo» ni inventa
 * horarios: el acumulado de `topContributors` no tiene hora.
 */
export function ultimosAportesDeLaHinchada(
  proyecto: ImpactProject,
  actividad: ActivityItem[],
  nombreDelUsuario?: string,
  tope = 5,
): AporteDeLaHinchada[] {
  const corto = nombreDelUsuario ? nombreCorto(nombreDelUsuario) : undefined
  const deLaSesion: AporteDeLaHinchada[] = actividad
    .filter(esAporte)
    .filter((c) => c.projectId === proyecto.id && c.material === proyecto.material)
    .map((c) => ({
      id: c.id,
      nombre: corto ?? 'Un hincha',
      texto: `dejó ${formatNumber(c.units ?? 0)} ${proyecto.unitLabel}`,
      esTuyo: corto !== undefined,
      cuando: c.createdAt,
    }))
  const acumulado: AporteDeLaHinchada[] = proyecto.topContributors.map((t) => ({
    id: `top_${t.name}`,
    nombre: t.name,
    texto: `lleva ${formatNumber(t.units)} ${proyecto.unitLabel}`,
    esTuyo: t.name === corto,
  }))
  return [...deLaSesion, ...acumulado].slice(0, tope)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ultimosAportes.test.ts > $SP/t2.txt 2>&1; echo $?; grep -E '×|Tests ' $SP/t2.txt`
Expected: exit 0, con `Tests  4 passed (4)`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimosAportes.ts src/lib/ultimosAportes.test.ts
git commit -m "feat(cancha): la hinchada en el banco, con lo de la sesión primero y sin horarios inventados

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Tokens, fuente y las piezas visuales

**Files:**
- Modify:
  - `index.html:16-19` (el link de Google Fonts)
  - `src/index.css` (`@theme inline`, `:root`, `.dark`, `@layer utilities`)
- Create:
  - `src/components/features/Cancha.tsx`
  - `src/components/features/Marcador.tsx`
  - `src/components/features/BancoDeTapitas.tsx`
  - `src/components/features/UltimosAportes.tsx`
  - `src/components/features/BancoDeLaHinchada.tsx`
- Test: `src/components/features/cancha.test.tsx`

**Interfaces:**
- Consumes: Task 1 (`estadosDelBanco`, `TAPITAS_DEL_BANCO`, `COLUMNAS_DEL_BANCO`, `FILAS_DEL_BANCO`) y Task 2 (`AporteDeLaHinchada`).
- Produces:
  - `Cancha({ children, className?, conLinea? })`
  - `Marcador({ valor: number, etiqueta: string, desde?: number, tamano?: 'grande' | 'mediano', className? })`
  - `BancoDeTapitas({ progreso: number, propias: number, animarTuyas?: boolean, className? })`, cada `<circle>` con `data-estado`
  - `UltimosAportes({ items: AporteDeLaHinchada[], className? })`, cada `<li>` con `data-tuyo`
  - `BancoDeLaHinchada({ proyecto: ImpactProject, items: AporteDeLaHinchada[], propias: number, antetitulo?: string, enlace?: string, accion?: ReactNode, className? })`
  - Utilidades de Tailwind: `bg-cancha`, `bg-cal`, `font-marcador`

- [ ] **Step 1: Write the failing test**

`src/components/features/cancha.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Marcador } from './Marcador'
import { UltimosAportes } from './UltimosAportes'
import { BancoDeLaHinchada } from './BancoDeLaHinchada'

const estados = (c: HTMLElement, e: string) => c.querySelectorAll(`circle[data-estado="${e}"]`).length

describe('BancoDeTapitas', () => {
  it('dibuja 80 tapitas: 10 de la hinchada, 1 tuya y el resto vacías', () => {
    const { container } = render(<BancoDeTapitas progreso={42840 / 300000} propias={640 / 42840} />)
    expect([estados(container, 'hinchada'), estados(container, 'tuya'), estados(container, 'vacia')]).toEqual([10, 1, 69])
  })
})

describe('Marcador', () => {
  it('muestra el número con separador de miles y su etiqueta', () => {
    render(<Marcador valor={42890} etiqueta="tapitas de 300.000" />)
    expect(screen.getByText('42.890')).toBeInTheDocument()
    expect(screen.getByText('tapitas de 300.000')).toBeInTheDocument()
  })
})

describe('UltimosAportes', () => {
  it('marca el tuyo y muestra la hora sólo donde la hay', () => {
    const { container } = render(
      <UltimosAportes
        items={[
          { id: 'a', nombre: 'Camila R.', texto: 'dejó 50 tapitas', esTuyo: true, cuando: new Date().toISOString() },
          { id: 'b', nombre: 'Facu R.', texto: 'lleva 3.120 tapitas', esTuyo: false },
        ]}
      />,
    )
    expect(container.querySelectorAll('li[data-tuyo="true"]')).toHaveLength(1)
    expect(container.textContent).toContain('dejó 50 tapitas')
    expect(container.textContent).not.toMatch(/en vivo|tiempo real/i)
  })
})

describe('BancoDeLaHinchada', () => {
  it('cuenta el avance con los números del proyecto y no dice «en vivo»', () => {
    const proyecto = {
      id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
      sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
      collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
      milestones: [], topContributors: [],
    } as ImpactProject
    const { container } = render(
      <MemoryRouter>
        <BancoDeLaHinchada proyecto={proyecto} items={[]} propias={640 / 42840} enlace="/proyecto/pr_banco_club" />
      </MemoryRouter>,
    )
    expect(container.textContent).toContain('42.840')
    expect(container.textContent).toContain('14%')
    expect(container.textContent).not.toMatch(/en vivo|tiempo real/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/features/cancha.test.tsx > $SP/t3.txt 2>&1; echo $?`
Expected: exit 1, porque no existen `./BancoDeTapitas`, `./Marcador`, `./UltimosAportes` ni `./BancoDeLaHinchada`.

- [ ] **Step 3: Tokens y fuente**

En `index.html`, reemplazar el `href` del link de Google Fonts por:

```html
      href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
```

En `src/index.css`, dentro de `@theme inline`, después de `--font-display`:

```css
  /* Día de cancha: los números grandes como el tablero del estadio */
  --font-marcador: "Barlow Condensed", "Plus Jakarta Sans", system-ui, sans-serif;
  --color-cancha-claro: var(--cancha-claro);
  --color-cancha-oscuro: var(--cancha-oscuro);
  --color-cal: var(--cal);
```

En `:root`, después de `--ring: #10b981;`:

```css
  --cancha-claro: #eaf6e4;
  --cancha-oscuro: #dcefd3;
  --cal: #ffffff;
```

En `.dark`, después de `--ring: #34d399;`:

```css
  --cancha-claro: #0f2a1f;
  --cancha-oscuro: #12301f;
  --cal: rgb(231 243 237 / 0.35);
```

En `@layer utilities`, al final:

```css
  /* Césped recién cortado: franjas horizontales en dos verdes */
  .bg-cancha {
    background-image: repeating-linear-gradient(
      180deg,
      var(--cancha-claro) 0 28px,
      var(--cancha-oscuro) 28px 56px
    );
  }
```

- [ ] **Step 4: Las piezas**

`src/components/features/Cancha.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Fondo de césped recién cortado; con `conLinea`, una línea de cal arriba. */
export function Cancha({
  children,
  className,
  conLinea = false,
}: {
  children: ReactNode
  className?: string
  conLinea?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-cancha', className)}>
      {conLinea && (
        <div aria-hidden className="pointer-events-none absolute inset-x-4 top-3 h-0.5 rounded-full bg-cal" />
      )}
      {children}
    </div>
  )
}
```

`src/components/features/Marcador.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { cn, formatNumber } from '@/lib/utils'

interface MarcadorProps {
  valor: number
  etiqueta: string
  /** Si viene, cuenta desde este número hasta `valor`. */
  desde?: number
  tamano?: 'grande' | 'mediano'
  className?: string
}

/** Un número grande como el tablero del estadio. Con movimiento reducido, va directo al valor. */
export function Marcador({ valor, etiqueta, desde, tamano = 'grande', className }: MarcadorProps) {
  const reduce = useReducedMotion()
  const anima = desde !== undefined && !reduce
  const [animado, setAnimado] = useState(desde ?? valor)

  useEffect(() => {
    if (!anima || desde === undefined) return
    const control = animate(desde, valor, {
      duration: 1.2,
      delay: 0.3,
      ease: 'easeOut',
      onUpdate: (v) => setAnimado(Math.round(v)),
    })
    return () => control.stop()
  }, [anima, desde, valor])

  const numero = anima ? animado : valor
  return (
    <div className={cn('leading-none', className)}>
      <p
        className={cn(
          'font-marcador font-bold tabular-nums text-eco-900 dark:text-eco-50',
          tamano === 'grande' ? 'text-5xl' : 'text-4xl',
        )}
      >
        {formatNumber(numero)}
      </p>
      <p className="mt-1 text-xs font-semibold text-eco-800 dark:text-eco-200">{etiqueta}</p>
    </div>
  )
}
```

`src/components/features/BancoDeTapitas.tsx`:

```tsx
import { motion, useReducedMotion } from 'framer-motion'
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
const ALTO = ASIENTO + 32

const CLASE: Record<EstadoTapita, string> = {
  hinchada: 'fill-eco-500 stroke-eco-700',
  tuya: 'fill-xp-400 stroke-xp-600',
  vacia: 'fill-transparent stroke-eco-300 dark:stroke-eco-800',
}

/**
 * El banco de suplentes dibujado con tapitas, que se llenan con el avance real del proyecto.
 * Las de la hinchada en verde y las de la persona en ámbar. Con `animarTuyas`, las suyas entran
 * cayendo (salvo con movimiento reducido).
 */
export function BancoDeTapitas({
  progreso,
  propias,
  animarTuyas = false,
  className,
}: {
  progreso: number
  propias: number
  animarTuyas?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const estados = estadosDelBanco({ total: TAPITAS_DEL_BANCO, progreso, propias })
  const encendidas = estados.filter((e) => e !== 'vacia').length

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={`Banco de tapitas: ${encendidas} de ${TAPITAS_DEL_BANCO} encendidas`}
      className={cn('block h-auto w-full', className)}
    >
      {estados.map((estado, i) => {
        const cx = MARGEN + (i % COLUMNAS_DEL_BANCO) * PASO
        const cy = MARGEN + (FILAS_DEL_BANCO - 1 - Math.floor(i / COLUMNAS_DEL_BANCO)) * PASO
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
      <rect
        x={4}
        y={ASIENTO - 4}
        width={ANCHO - 8}
        height={7}
        rx={3}
        strokeWidth={1.2}
        className="fill-transparent stroke-eco-500 dark:stroke-eco-700"
      />
      <rect x={16} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className="fill-transparent stroke-eco-500 dark:stroke-eco-700" />
      <rect x={ANCHO - 21} y={ASIENTO + 3} width={5} height={26} rx={1.5} strokeWidth={1.2} className="fill-transparent stroke-eco-500 dark:stroke-eco-700" />
    </svg>
  )
}
```

`src/components/features/UltimosAportes.tsx`:

```tsx
import type { AporteDeLaHinchada } from '@/lib/ultimosAportes'
import { cn, timeAgo } from '@/lib/utils'

/** La hinchada en el banco: lo de esta sesión con su hora y el acumulado de los que más aportan. */
export function UltimosAportes({ items, className }: { items: AporteDeLaHinchada[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <ul className={cn('space-y-1.5', className)}>
      {items.map((a) => (
        <li
          key={a.id}
          data-tuyo={a.esTuyo}
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm',
            a.esTuyo
              ? 'bg-xp-50 text-xp-700 ring-1 ring-xp-300 dark:bg-xp-700/20 dark:text-xp-100'
              : 'bg-card/85 text-foreground',
          )}
        >
          <span aria-hidden className={cn('h-3 w-3 shrink-0 rounded-full', a.esTuyo ? 'bg-xp-400' : 'bg-eco-500')} />
          <span className="min-w-0 flex-1 truncate">
            <b className="font-bold">{a.nombre}</b> {a.texto}
          </span>
          {a.cuando && <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.cuando)}</span>}
        </li>
      ))}
    </ul>
  )
}
```

`src/components/features/BancoDeLaHinchada.tsx`:

```tsx
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { ImpactProject } from '@/types'
import type { AporteDeLaHinchada } from '@/lib/ultimosAportes'
import { cn, formatNumber, pct } from '@/lib/utils'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { Marcador } from './Marcador'
import { UltimosAportes } from './UltimosAportes'

/**
 * El banco de la hinchada sobre césped: el marcador, el avance, el banco de tapitas y la
 * hinchada en el banco. Lo usan el inicio del hincha y el panel del club, con los mismos números.
 */
export function BancoDeLaHinchada({
  proyecto,
  items,
  propias,
  antetitulo,
  enlace,
  accion,
  className,
}: {
  proyecto: ImpactProject
  items: AporteDeLaHinchada[]
  propias: number
  antetitulo?: string
  enlace?: string
  accion?: ReactNode
  className?: string
}) {
  const avance = proyecto.goalUnits > 0 ? proyecto.collectedUnits / proyecto.goalUnits : 0
  return (
    <Cancha conLinea className={cn('p-4 pt-6 sm:p-5 sm:pt-7', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-eco-800 dark:text-eco-200">{antetitulo ?? proyecto.sponsorName}</p>
          <h2 className="text-lg font-extrabold leading-tight text-eco-950 dark:text-eco-50">{proyecto.title}</h2>
        </div>
        {enlace && (
          <Link to={enlace} className="inline-flex shrink-0 items-center text-sm font-semibold text-eco-800 dark:text-eco-200">
            Ver <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
        <div>
          <div className="flex items-end justify-between gap-3">
            <Marcador
              valor={proyecto.collectedUnits}
              etiqueta={`${proyecto.unitLabel} de ${formatNumber(proyecto.goalUnits)}`}
            />
            <p className="font-marcador text-4xl font-bold tabular-nums text-eco-700 dark:text-eco-300">
              {pct(proyecto.collectedUnits, proyecto.goalUnits)}%
            </p>
          </div>
          <BancoDeTapitas className="mt-3" progreso={avance} propias={propias} />
        </div>
        {items.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-eco-800 dark:text-eco-200">
              La hinchada en el banco
            </p>
            <UltimosAportes items={items} />
          </div>
        )}
      </div>

      {accion && <div className="mt-4">{accion}</div>}
    </Cancha>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/features/cancha.test.tsx src/lib/grillas.test.ts > $SP/t3.txt 2>&1; echo $?; grep -E '×|Tests ' $SP/t3.txt`
Expected: exit 0, con `Tests  5 passed (5)`.

- [ ] **Step 6: Commit**

```bash
git add index.html src/index.css src/components/features/Cancha.tsx src/components/features/Marcador.tsx src/components/features/BancoDeTapitas.tsx src/components/features/UltimosAportes.tsx src/components/features/BancoDeLaHinchada.tsx src/components/features/cancha.test.tsx
git commit -m "feat(cancha): césped, cal, marcador y el banco de tapitas como piezas reutilizables

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: El inicio del hincha

**Files:**
- Modify: `src/pages/Home.tsx`, el bloque de la columna principal (hoy `XpWallet`, el botón «Escanear un aporte» y la tarjeta «Tu impacto»).

**Interfaces:**
- Consumes:
  - `BancoDeLaHinchada` (Task 3);
  - `ultimosAportesDeLaHinchada` (Task 2);
  - `conAportesDeLaSesion(project, actividad, nombre?)` de `src/lib/aportesDeLaSesion.ts`.

- [ ] **Step 1: Imports**

En `src/pages/Home.tsx`, agregar después de `import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'`:

```tsx
import { ultimosAportesDeLaHinchada } from '@/lib/ultimosAportes'
import { BancoDeLaHinchada } from '@/components/features/BancoDeLaHinchada'
```

- [ ] **Step 2: Los datos del banco**

Reemplazar:

```tsx
  const featured = projects?.[0] && conAportesDeLaSesion(projects[0], sessionContributions, user?.name)
```

por:

```tsx
  const featured = projects?.[0] && conAportesDeLaSesion(projects[0], sessionContributions, user?.name)
  // El banco de la hinchada: sólo para un proyecto que se dibuja como banco.
  const esBanco = featured?.illustration === 'bench'
  const aportesDelBanco = featured && esBanco ? ultimosAportesDeLaHinchada(featured, sessionContributions, user?.name) : []
  const propias = featured && featured.collectedUnits > 0 ? featured.myContributionUnits / featured.collectedUnits : 0
```

- [ ] **Step 3: La columna principal**

Reemplazar desde `<XpWallet />` hasta el cierre del condicional de la tarjeta «Tu impacto» inclusive, es decir hasta las líneas

```tsx
          ) : (
            <Skeleton className="h-72 w-full" />
          )}
```

por:

```tsx
          {projectsError && !featured ? (
            <ErrorState message={projectsError} onRetry={reloadProjects} />
          ) : featured && esBanco ? (
            <BancoDeLaHinchada
              proyecto={featured}
              items={aportesDelBanco}
              propias={propias}
              enlace={`/proyecto/${featured.id}`}
              accion={
                <Link to="/escanear" className="block">
                  <Button block size="lg" variant="xp">
                    <QrCode size={20} /> Sumá tus tapitas
                  </Button>
                </Link>
              }
            />
          ) : featured ? (
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
          ) : (
            <Skeleton className="h-80 w-full rounded-2xl" />
          )}

          <XpWallet />
```

El botón «Escanear un aporte» se va: lo reemplaza «Sumá tus tapitas», y la barra de abajo sigue teniendo «Escanear».

- [ ] **Step 4: Verificar**

Run:

```bash
npx tsc -b > $SP/t4-tsc.txt 2>&1; echo "TSC=$?"; head -5 $SP/t4-tsc.txt
npx vitest run > $SP/t4.txt 2>&1; echo "VITEST=$?"; grep -E 'Tests |×' $SP/t4.txt | head -4
```

Expected: `TSC=0`, `VITEST=0`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat(cancha): el inicio arranca con el banco de la hinchada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: El proyecto: banco grande, línea de hitos y titulares

**Files:**
- Modify:
  - `src/components/features/ImpactProgress.tsx`: el bloque visual, los hitos y el top de aportantes;
  - `src/pages/ImpactProjectPage.tsx`: pasarle el nombre corto.
- Test: `src/components/features/ImpactProgress.test.tsx`

**Interfaces:**
- Consumes: `Cancha`, `Marcador`, `BancoDeTapitas` (Task 3); `nombreCorto` de `src/lib/aportesDeLaSesion.ts`.
- Produces: `ImpactProgress` suma la prop opcional `nombreCorto?: string`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { ImpactProgress } from './ImpactProgress'

const banco = {
  id: 'pr_banco_club', title: 'Banco', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42840, myContributionUnits: 640,
  estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [
    { label: 'Recolección', done: false },
    { label: 'Pesaje y retiro', done: false },
    { label: 'Fabricación', done: false },
    { label: 'Instalación', done: false },
  ],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
    { name: 'Camila R.', units: 640, avatarColor: '#059669' },
  ],
} as ImpactProject

describe('ImpactProgress del banco', () => {
  it('dibuja el banco de tapitas, marca la etapa actual y destaca a la persona entre los titulares', () => {
    const { container } = render(<ImpactProgress project={banco} nombreCorto="Camila R." />)
    expect(container.querySelectorAll('circle[data-estado]')).toHaveLength(80)
    expect(container.querySelector('[data-hito-actual="true"]')?.textContent).toContain('Recolección')
    expect(container.textContent).toContain('Los titulares de la hinchada')
    expect(container.querySelector('[data-titular-tuyo="true"]')?.textContent).toContain('Camila R.')
  })

  it('un proyecto que no es un banco sigue con su ilustración', () => {
    const { container } = render(<ImpactProgress project={{ ...banco, illustration: 'totem' } as ImpactProject} />)
    expect(container.querySelectorAll('circle[data-estado]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/features/ImpactProgress.test.tsx > $SP/t5.txt 2>&1; echo $?; grep -E '×' $SP/t5.txt | head -3`
Expected: exit 1. El banco no tiene `circle[data-estado]` y no existen `data-hito-actual` ni «Los titulares de la hinchada».

- [ ] **Step 3: Implementación**

En `src/components/features/ImpactProgress.tsx`:

1. Agregar los imports:

```tsx
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { Marcador } from './Marcador'
```

2. Sumar la prop: en `interface Props`, agregar `nombreCorto?: string`, y en la firma, `export function ImpactProgress({ project, compact = false, className, nombreCorto }: Props)`.

3. Envolver el bloque visual que empieza en `{/* Visual B&N → color */}` (el `<div className="relative overflow-hidden rounded-2xl border ...">` completo, hasta su cierre) así:

```tsx
      {project.illustration === 'bench' ? (
        <Cancha conLinea className="p-4 pt-6">
          <div className="flex items-end justify-between gap-3">
            <Marcador valor={project.collectedUnits} etiqueta={`${project.unitLabel} de ${formatNumber(project.goalUnits)}`} />
            <p className="font-marcador text-4xl font-bold tabular-nums text-eco-700 dark:text-eco-300">{total}%</p>
          </div>
          <BancoDeTapitas
            className="mt-3"
            progreso={project.goalUnits > 0 ? project.collectedUnits / project.goalUnits : 0}
            propias={project.collectedUnits > 0 ? project.myContributionUnits / project.collectedUnits : 0}
          />
        </Cancha>
      ) : (
        /* el bloque visual de hoy, sin cambios */
      )}
```

En lugar del comentario `/* el bloque visual de hoy, sin cambios */` va el `<div className="relative overflow-hidden rounded-2xl border ...">` original, tal cual.

4. Reemplazar el bloque `{/* Hitos */}`, del `<div>` con «Hitos del proyecto» hasta su cierre, por:

```tsx
          {/* Hitos: una línea de cal con la etapa actual marcada */}
          <div>
            <p className="mb-3 text-sm font-bold">Hitos del proyecto</p>
            <ol
              className="relative grid gap-1"
              style={{ gridTemplateColumns: `repeat(${project.milestones.length}, minmax(0, 1fr))` }}
            >
              <span
                aria-hidden
                className="absolute top-[11px] h-0.5 bg-eco-200 dark:bg-eco-800"
                style={{
                  left: `${50 / project.milestones.length}%`,
                  right: `${50 / project.milestones.length}%`,
                }}
              />
              {project.milestones.map((m, i) => {
                const actual = i === project.milestones.findIndex((h) => !h.done)
                return (
                  <li key={m.label} data-hito-actual={actual} className="relative flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={cn(
                        'grid h-6 w-6 place-items-center rounded-full border-2 text-[11px] font-bold',
                        m.done
                          ? 'border-eco-600 bg-eco-600 text-white'
                          : actual
                            ? 'border-xp-500 bg-xp-100 text-xp-700'
                            : 'border-eco-200 bg-card text-muted-foreground dark:border-eco-800',
                      )}
                    >
                      {m.done ? '✓' : i + 1}
                    </span>
                    <span className={cn('text-xs leading-tight', actual ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                      {m.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
```

5. Reemplazar el bloque `{/* Top aportantes */}` por:

```tsx
          {/* Los titulares de la hinchada */}
          <div>
            <p className="mb-2 text-sm font-bold">Los titulares de la hinchada</p>
            <ul className="space-y-1.5">
              {project.topContributors.map((c, i) => {
                const tuyo = c.name === nombreCorto
                return (
                  <li
                    key={c.name}
                    data-titular-tuyo={tuyo}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-2 py-1.5',
                      tuyo && 'bg-xp-50 ring-1 ring-xp-300 dark:bg-xp-700/20',
                    )}
                  >
                    <span className="w-5 font-marcador text-base font-bold text-muted-foreground">{i + 1}</span>
                    <Avatar name={c.name} color={c.avatarColor} size="sm" />
                    <span className="flex-1 text-sm font-semibold">
                      {c.name}
                      {tuyo && ' (vos)'}
                    </span>
                    <span className="font-marcador text-base font-bold tabular-nums text-eco-700">{formatNumber(c.units)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
```

6. En `src/pages/ImpactProjectPage.tsx`:
   - cambiar `import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'` por `import { conAportesDeLaSesion, nombreCorto } from '@/lib/aportesDeLaSesion'`;
   - cambiar `<ImpactProgress project={project} />` por `<ImpactProgress project={project} nombreCorto={nombre ? nombreCorto(nombre) : undefined} />`.

`Badge` deja de usarse en `ImpactProgress.tsx` cuando sale el bloque de hitos: si `tsc` o el lint lo marcan como import sin usar, se saca.

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
npx vitest run src/components/features/ImpactProgress.test.tsx > $SP/t5.txt 2>&1; echo "T=$?"; grep -E '×|Tests ' $SP/t5.txt
npx tsc -b > $SP/t5-tsc.txt 2>&1; echo "TSC=$?"; head -5 $SP/t5-tsc.txt
```

Expected: `T=0` con `Tests  2 passed (2)`; `TSC=0`.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/ImpactProgress.tsx src/components/features/ImpactProgress.test.tsx src/pages/ImpactProjectPage.tsx
git commit -m "feat(cancha): el proyecto con el banco de tapitas, la línea de hitos y los titulares de la hinchada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: El festejo del aporte

**Files:**
- Create: `src/components/features/FestejoDelAporte.tsx`
- Modify: `src/pages/Scan.tsx`, en los hooks del principio de `Scan()` y en el bloque `// ─── Paso: resultado`.
- Test: `src/components/features/FestejoDelAporte.test.tsx`

**Interfaces:**
- Consumes: `Cancha`, `Marcador`, `BancoDeTapitas` (Task 3); `conAportesDeLaSesion`.
- Produces: `FestejoDelAporte({ proyecto: ImpactProject, unidades: number, xp: number })`. `proyecto` es el que ya incluye el aporte.

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactProject } from '@/types'
import { FestejoDelAporte } from './FestejoDelAporte'

const proyecto = {
  id: 'pr_banco_club', title: 'Banco', sponsorId: 's_club', sponsorName: 'Talleres', description: '',
  material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000, collectedUnits: 42890, myContributionUnits: 690,
  estimatedDate: '2027-03-31', illustration: 'bench', milestones: [], topContributors: [],
} as ImpactProject

describe('FestejoDelAporte', () => {
  it('dice lo que sumaste sin prometer de más, y al tocar muestra el total final', () => {
    const { container, getByTestId } = render(<FestejoDelAporte proyecto={proyecto} unidades={50} xp={100} />)
    expect(container.textContent).toContain('+100 XP')
    expect(container.textContent).toContain('Tus 50 tapitas ya suman al banco de la hinchada')
    expect(container.querySelectorAll('circle[data-estado="tuya"]')).toHaveLength(1)
    fireEvent.click(getByTestId('festejo'))
    expect(container.textContent).toContain('42.890')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/features/FestejoDelAporte.test.tsx > $SP/t6.txt 2>&1; echo $?`
Expected: exit 1, porque no existe `./FestejoDelAporte`.

- [ ] **Step 3: El componente**

`src/components/features/FestejoDelAporte.tsx`:

```tsx
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ImpactProject } from '@/types'
import { formatNumber } from '@/lib/utils'
import { BancoDeTapitas } from './BancoDeTapitas'
import { Cancha } from './Cancha'
import { Marcador } from './Marcador'

/** Tapitas que caen al banco: decorativas, no representan una cantidad. */
function TapitasCayendo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full">
      {[12, 26, 38, 50, 62, 74, 86].map((x, i) => (
        <motion.span
          key={x}
          className="absolute h-3 w-3 rounded-full bg-xp-400 ring-1 ring-xp-600"
          style={{ left: `${x}%` }}
          initial={{ top: '-12%', opacity: 0 }}
          animate={{ top: '42%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

/**
 * El festejo del aporte. Las tapitas caen al banco, la tuya se enciende en ámbar, el marcador sube
 * del total anterior al nuevo y aparece el XP. Dura unos 2 segundos; tocar salta al final, y con
 * movimiento reducido se ve todo quieto.
 */
export function FestejoDelAporte({ proyecto, unidades, xp }: { proyecto: ImpactProject; unidades: number; xp: number }) {
  const reduce = useReducedMotion()
  const [saltado, setSaltado] = useState(false)
  const quieto = Boolean(reduce) || saltado
  const antes = Math.max(0, proyecto.collectedUnits - unidades)

  return (
    <div data-testid="festejo" onClick={() => setSaltado(true)} className="w-full cursor-pointer text-left">
      <Cancha conLinea className="p-4 pt-6">
        <p className="text-xs font-bold text-eco-800 dark:text-eco-200">{proyecto.sponsorName} · banco de la hinchada</p>
        <div className="relative mt-2">
          {!quieto && <TapitasCayendo />}
          <BancoDeTapitas
            progreso={proyecto.goalUnits > 0 ? proyecto.collectedUnits / proyecto.goalUnits : 0}
            propias={proyecto.collectedUnits > 0 ? proyecto.myContributionUnits / proyecto.collectedUnits : 0}
            animarTuyas={!quieto}
          />
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <Marcador
            valor={proyecto.collectedUnits}
            desde={quieto ? undefined : antes}
            etiqueta={`${proyecto.unitLabel} de la hinchada`}
          />
          <motion.p
            initial={quieto ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, type: 'spring', damping: 12 }}
            className="font-marcador text-4xl font-bold tabular-nums text-xp-600"
          >
            +{formatNumber(xp)} XP
          </motion.p>
        </div>
      </Cancha>
      <p className="mt-3 text-center text-lg font-extrabold leading-tight">
        Tus {formatNumber(unidades)} {proyecto.unitLabel} ya suman al banco de la hinchada
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Usarlo en el resultado del escaneo**

En `src/pages/Scan.tsx`:

1. Agregar los imports:

```tsx
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { useSessionStore } from '@/store/session'
import { FestejoDelAporte } from '@/components/features/FestejoDelAporte'
```

Si `useSessionStore` ya está importado, no se duplica.

2. Después de `const addActivity = useActivityStore((s) => s.add)`, agregar:

```tsx
  const actividad = useActivityStore((s) => s.sessionContributions)
  const nombre = useSessionStore((s) => s.user?.name)
```

3. Dentro de `if (mode === 'reciclar' && step === 'done' && result) {`, antes del `return`, agregar:

```tsx
    // El festejo, sólo si el aporte suma a un banco: mismo proyecto y mismo material.
    const proyectoConAporte = result.project && conAportesDeLaSesion(result.project, actividad, nombre)
    const sumaAlBanco =
      !!proyectoConAporte &&
      proyectoConAporte.illustration === 'bench' &&
      result.contribution.projectId === proyectoConAporte.id &&
      result.contribution.material === proyectoConAporte.material
```

4. En ese `return`, envolver el tilde, el `<h1>`, el punto y la caja verde de «Sumaste» así:

```tsx
        {sumaAlBanco && proyectoConAporte ? (
          <>
            <h1 className="text-2xl font-extrabold">¡Aporte registrado!</h1>
            <p className="mb-4 text-muted-foreground">{result.contribution.pointName}</p>
            <FestejoDelAporte proyecto={proyectoConAporte} unidades={result.contribution.units ?? 0} xp={result.xpEarned} />
          </>
        ) : (
          <>
            {/* el tilde, el h1, el punto y la caja «Sumaste» de hoy, sin cambios */}
          </>
        )}
```

En lugar del comentario van los cuatro elementos originales, tal cual: el `<motion.div>` del tilde, el `<h1>`, el `<p>` con el punto y el `<div>` de «Sumaste». Lo que sigue (la tarjeta «Tu aporte suma a un proyecto» y «Escanear otro») no cambia.

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
npx vitest run src/components/features/FestejoDelAporte.test.tsx > $SP/t6.txt 2>&1; echo "T=$?"; grep -E '×|Tests ' $SP/t6.txt
npx tsc -b > $SP/t6-tsc.txt 2>&1; echo "TSC=$?"; head -5 $SP/t6-tsc.txt
```

Expected: `T=0` con `Tests  1 passed (1)`; `TSC=0`.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/FestejoDelAporte.tsx src/components/features/FestejoDelAporte.test.tsx src/pages/Scan.tsx
git commit -m "feat(cancha): el festejo del aporte: las tapitas caen al banco y el marcador sube

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: El panel del club con el banco de su hinchada

**Files:**
- Modify: `src/pages/commerce/CommerceResumen.tsx`

**Interfaces:**
- Consumes:
  - `BancoDeLaHinchada` (Task 3);
  - `ultimosAportesDeLaHinchada` (Task 2);
  - `conAportesDeLaSesion`;
  - `api.getProjects()`.

- [ ] **Step 1: Imports**

```tsx
import { conAportesDeLaSesion } from '@/lib/aportesDeLaSesion'
import { ultimosAportesDeLaHinchada } from '@/lib/ultimosAportes'
import { BancoDeLaHinchada } from '@/components/features/BancoDeLaHinchada'
```

Si `conAportesDeLaSesion` ya está importado desde `@/lib/aportesDeLaSesion` junto con `metricasConLaSesion`, se suma a ese import.

- [ ] **Step 2: Los datos**, antes de `if (!commerce) return null`

```tsx
  // El banco de la hinchada de esta institución, con lo que hizo la hinchada en la sesión.
  const { data: proyectos } = useApi(() => api.getProjects(), [])
  const nombreDelHincha = useSessionStore((s) => s.user?.name)
  const proyectoBase = proyectos?.find((p) => p.sponsorId === commerce?.id && p.illustration === 'bench')
  const proyecto = proyectoBase && conAportesDeLaSesion(proyectoBase, actividad, nombreDelHincha)
  // En el panel nada es «tuyo»: el club ve a toda la hinchada.
  const aportesDelBanco = proyecto
    ? ultimosAportesDeLaHinchada(proyecto, actividad, nombreDelHincha).map((a) => ({ ...a, esTuyo: false }))
    : []
```

- [ ] **Step 3: El encabezado**

Inmediatamente después del bloque del título («Resumen» y «Tu impacto y tu comunidad, desde que te sumaste.») y antes de `{/* Huella Verde accionable */}`:

```tsx
      {proyecto && (
        <BancoDeLaHinchada proyecto={proyecto} items={aportesDelBanco} propias={0} antetitulo="El banco de tu hinchada" />
      )}
```

- [ ] **Step 4: Verificar**

Run:

```bash
npx tsc -b > $SP/t7-tsc.txt 2>&1; echo "TSC=$?"; head -5 $SP/t7-tsc.txt
npx vitest run > $SP/t7.txt 2>&1; echo "VITEST=$?"; grep -E 'Tests |×' $SP/t7.txt | head -4
```

Expected: `TSC=0`, `VITEST=0`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/commerce/CommerceResumen.tsx
git commit -m "feat(cancha): el panel del club arranca con el banco de su hinchada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Los números de marcador en el resto

**Files:**
- Modify:
  - `src/components/features/XpWallet.tsx`: los dos números, hoy `mt-1 text-2xl font-extrabold leading-none`;
  - `src/components/features/StatCard.tsx:27`;
  - `src/components/features/RankingRow.tsx:29`.

- [ ] **Step 1: Reemplazos**

- En `XpWallet.tsx`, las dos apariciones de `className="mt-1 text-2xl font-extrabold leading-none"` pasan a `className="mt-1 font-marcador text-3xl font-bold leading-none tabular-nums"`.
- En `StatCard.tsx`, `className="text-2xl font-extrabold leading-none"` pasa a `className="font-marcador text-3xl font-bold leading-none tabular-nums"`.
- En `RankingRow.tsx`, `className="text-sm font-extrabold text-eco-700"` pasa a `className="font-marcador text-base font-bold tabular-nums text-eco-700"`.

- [ ] **Step 2: Verificar**

Run: `npx tsc -b > $SP/t8-tsc.txt 2>&1; echo "TSC=$?"; npx vitest run > $SP/t8.txt 2>&1; echo "VITEST=$?"; grep -E 'Tests |×' $SP/t8.txt | head -3`
Expected: `TSC=0`, `VITEST=0`.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/XpWallet.tsx src/components/features/StatCard.tsx src/components/features/RankingRow.tsx
git commit -m "feat(cancha): los números grandes de la billetera, el panel y el ranking, como el tablero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Verificación completa, documentación y capturas para Alan

**Files:**
- Modify:
  - `work-agent/03-DESIGN-SYSTEM.md`: una sección «Día de cancha» con los tokens y las piezas;
  - `work-agent/11-HISTORIAL.md`: una entrada.

- [ ] **Step 1: La suite, tipos, lint y build**

```bash
npx vitest run > $SP/t9.txt 2>&1; echo "VITEST=$?"; grep -E 'Test Files|Tests |×' $SP/t9.txt | head -5
npx tsc -b > $SP/t9-tsc.txt 2>&1; echo "TSC=$?"
npx eslint . > $SP/t9-lint.txt 2>&1; echo "LINT=$?"; grep problems $SP/t9-lint.txt
npm run build:railway > $SP/t9-build.txt 2>&1; echo "BUILD=$?"
```

Expected:
- `VITEST=0`, `TSC=0`, `BUILD=0`;
- el lint, con 0 errores y los mismos 9 avisos que `main`.

- [ ] **Step 2: Recorrido en el navegador sobre el build local**

Levantar el build con `PORT=18450 node server.mjs` en segundo plano. Recorrer con Playwright, a 390 y 1280 px, la demo del club (`/club`) y la general (`/`):
- **Inicio:** el banco con 42.840 y 14 %, «La hinchada en el banco» y «Sumá tus tapitas».
- **Proyecto:** el banco grande, la línea de hitos con «Recolección» actual y los titulares con «Camila R. (vos)».
- **Escanear y aportar 50 tapitas en el Punto R · Estadio:** el festejo con «+100 XP», «Tus 50 tapitas ya suman al banco de la hinchada» y el marcador en 42.890.
- **Panel del club:** «El banco de tu hinchada» con 42.890 y «Camila R. dejó 50 tapitas».
- **En ninguna pantalla:** desborde horizontal (`document.documentElement.scrollWidth - innerWidth === 0`), «en vivo», «tiempo real» ni marcas reales en `/club`.
- **Movimiento reducido** (`page.emulateMedia({ reducedMotion: 'reduce' })` con `browser_run_code_unsafe`): el festejo se ve quieto, con 42.890.
- **Modo oscuro** (Perfil → Tema): el inicio y el panel se leen bien.

Expected: todo lo de arriba se cumple.

- [ ] **Step 3: Capturas para Alan**

Sacar capturas a 390 px del inicio, el proyecto y el festejo (tres cuadros: al tocar «Registrar aporte», a los 0,8 s y al final), y a 1280 px del panel. Se guardan en `.playwright-mcp/` y se mueven a `$SP/diseno/cancha/`. Se mandan con SendUserFile.

- [ ] **Step 4: Documentación**

En `work-agent/03-DESIGN-SYSTEM.md`, al final:

```markdown
## Día de cancha (10/10/2026)

Dirección visual de los momentos clave. Diseño: `docs/superpowers/specs/2026-10-10-dia-de-cancha-design.md`.

**Tokens:**
- `--font-marcador`: Barlow Condensed 600/700, sólo para números grandes, con `tabular-nums`.
- `bg-cancha`: franjas de césped.
- `bg-cal`: línea de cal, sólo sobre césped.
- `--color-cancha-claro` y `--color-cancha-oscuro`.

**Piezas** (`src/components/features/`):

| Pieza | Para qué |
|---|---|
| `Cancha` | El fondo de césped |
| `Marcador` | Los números de tablero, con cuenta animada opcional |
| `BancoDeTapitas` | El banco dibujado con 80 tapitas, según el avance real; las de la persona en ámbar |
| `UltimosAportes` | La hinchada en el banco |
| `BancoDeLaHinchada` | El inicio y el panel |
| `FestejoDelAporte` | El festejo del aporte |

**Lógica con pruebas:** `src/lib/bancoDeTapitas.ts` y `src/lib/ultimosAportes.ts`.

**Reglas:**
- Nada dice «en vivo» ni inventa horarios.
- Con movimiento reducido, nada se anima.
```

En `work-agent/11-HISTORIAL.md`, después de la entrada de `fix/csv-del-reporte-con-aviso`:

```markdown
- Rama `feat/dia-de-cancha`: el rediseño de los cuatro momentos (inicio, proyecto, festejo del aporte y panel del club) con la dirección «Día de cancha», aprobada por Alan.
  - El banco de suplentes se dibuja con tapitas que se llenan con el avance real; las de la persona van en ámbar.
  - El festejo hace subir el marcador de 42.840 a 42.890.
  - El panel arranca con «El banco de tu hinchada».
```

- [ ] **Step 5: Commit, sin mergear**

```bash
git add work-agent/03-DESIGN-SYSTEM.md work-agent/11-HISTORIAL.md
git commit -m "docs(cancha): el sistema visual Día de cancha y su entrada en el historial

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin feat/dia-de-cancha
```

La rama queda publicada, pero **no se mergea**: `main` publica en la demo del martes. El PR a `main` se abre recién con el OK de Alan sobre las capturas.
