# El mapa de Córdoba y tres retoques · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sacar las franjas del césped, animar los íconos de la barra de abajo, aclarar «Pasate a Premium», y cambiar el mapa esquemático por un mapa de verdad de Córdoba capital. El mapa nuevo tiene que ser rápido e interactivo, con todos los puntos en lugares válidos de Nueva Córdoba y el Centro.

**Architecture:**
- **Los retoques** son CSS y componentes chicos.
- **Los datos:** pasan a Córdoba en una sola tabla (`src/services/mocks/data.ts`) que sirve a las dos demos. La del club sólo cambia los nombres de las marcas.
- **El mapa:**
  - lógica pura en `src/lib/mapa.ts`;
  - un componente de Leaflet en `src/components/features/MapaDeCordoba.tsx`, que en las pruebas se reemplaza;
  - la pantalla en `src/pages/MapPoints.tsx`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind 4, framer-motion, zustand, Vitest 4 y Testing Library (jsdom). Suma `leaflet` 1.9.4, `react-leaflet` 5.0.0 y `@types/leaflet`.

Diseño: `docs/superpowers/specs/2026-10-11-mapa-de-cordoba-y-pulido-design.md`.

## Global Constraints

- **Idioma:** textos de pantalla y comentarios en español rioplatense, con voseo. Nada de «en vivo» ni «tiempo real». El aviso «Demo · los números son de ejemplo» no se toca.
- **Imports:** con el alias `@/`; entre hermanos de una carpeta, `./` como ya se usa.
- **Los ids de los puntos no cambian:** `p_ypf_libertador`, `p_ypf_cabildo`, `p_ypf_pana`, `p_muni_plaza`, `p_lumen_palermo`, `p_mcdonalds_palermo`, `p_starbucks_recoleta`, `p_grido_lanus`, `p_club_estadio` y `p_club_sede`. Los usan los QR impresos y los enlaces.
- **Las ubicaciones, al pie de la letra.** El nombre de la demo general y la dirección van en la tabla; los valores van como `lat`/`lng`:

| id | Nombre (demo general) | Dirección | lat | lng |
|---|---|---|---|---|
| `p_ypf_libertador` | YPF Bv. Perón | Bv. Perón, Centro | -31.418470 | -64.176348 |
| `p_ypf_cabildo` | YPF San Luis | San Luis, Güemes | -31.422153 | -64.189875 |
| `p_ypf_pana` | YPF Humberto Primo | Humberto Primo, Centro | -31.409436 | -64.184583 |
| `p_muni_plaza` | Punto Verde Plaza de la Intendencia | Plaza de la Intendencia, Centro | -31.417111 | -64.191230 |
| `p_lumen_palermo` | Café Lúmen Nueva Córdoba | Ituzaingó 1202, Nueva Córdoba | -31.430756 | -64.187332 |
| `p_mcdonalds_palermo` | McDonald's Nueva Córdoba | Obispo Trejo 1154, Nueva Córdoba | -31.428794 | -64.190979 |
| `p_starbucks_recoleta` | Starbucks Nueva Córdoba | San Lorenzo 25, Nueva Córdoba | -31.423175 | -64.186960 |
| `p_grido_lanus` | Grido Bv. San Juan | Bv. San Juan 125, Nueva Córdoba | -31.420568 | -64.187765 |
| `p_club_estadio` | Punto R · Estadio | Estadio Mario Alberto Kempes, ingreso principal en días de partido | -31.368847 | -64.246145 |
| `p_club_sede` | Punto R · Sede social | Rosario de Santa Fe 15, frente a la Plaza San Martín | -31.415995 | -64.183657 |

- **Nombres en la demo del club:** salen del reemplazo que ya existe (`MARCAS_DE_EJEMPLO` en `src/services/mocks/escenarioClub.ts`). Quedan «Norte Energía Bv. Perón», «Norte Energía San Luis», «Norte Energía Humberto Primo», «Café Lúmen Nueva Córdoba», «Burger Plaza Nueva Córdoba», «Café Andino Nueva Córdoba» y «Helados del Parque Bv. San Juan». El Punto Verde del municipio no está en la demo del club.
- **Nada del club real en el repo:** sin escudo, archivo ni colores oficiales.
- **Sin dependencias nuevas fuera de** `leaflet@1.9.4`, `react-leaflet@5.0.0` y `@types/leaflet` (dev).
- **Pruebas:**
  - Vitest y Testing Library con `fireEvent`: no hay `user-event`.
  - Sin stubs propios de `localStorage`: `src/test/setup.ts` lo resuelve.
  - jsdom no tiene canvas, `URL.createObjectURL` ni `requestIdleCallback`.
- **Comandos:**
  - Desde la raíz del worktree `~/.reunion/worktrees/reciclaxp-tareas/mapa`.
  - Los tipos, con `npx tsc -p tsconfig.app.json`. **Nunca `tsc -b`.**
  - El lint, con `npx eslint .`, sin errores; los 9 warnings que ya existen no cuentan.
  - El exit se lee directo: `npx vitest run <archivos> > /tmp/x.txt 2>&1; echo "exit=$?"`. **Nunca a través de un pipe.**
  - En zsh, las rutas de las pruebas van literales.
- **Commits:**
  - Con `git add <archivos>`, nunca `-A`.
  - El mensaje en español (`feat(mapa): …`), terminado en `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- **No hagas:** push, deploy, ni tocar otros worktrees. No arranques servidores con `preview_start` sin nombre: arranca otro proyecto.

---

### Task 1: Los retoques: el césped sin franjas, «Pasate a Premium» sin negro y los íconos que se mueven

**Files:**
- Modify:
  - `src/index.css`: el bloque `.bg-cancha`, alrededor de la línea 175;
  - `src/pages/Profile.tsx`: la tarjeta «Pasate a Premium», alrededor de las líneas 140-158;
  - `src/components/features/BottomNav.tsx`: el archivo entero, abajo.
- Test: `src/components/features/retoques.test.tsx` (nuevo).

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `BottomNav` con los íconos envueltos en `motion.span` con `data-icono`. La navegación y los `aria-label` quedan igual.

- [ ] **Step 1: La prueba que falla**

`src/components/features/retoques.test.tsx`:

```tsx
import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BottomNav } from './BottomNav'

describe('el césped', () => {
  // Alan, 11/10: «no me gusta el fondo con una celda pintada y la otra sí y la otra no».
  const css = readFileSync('src/index.css', 'utf8')
  const bloque = css.slice(css.indexOf('.bg-cancha'), css.indexOf('}', css.indexOf('.bg-cancha')) + 1)

  it('es un verde liso con un degradé suave, sin franjas', () => {
    expect(bloque).not.toMatch(/repeating-linear-gradient/)
    expect(bloque).toMatch(/linear-gradient\(\s*180deg,\s*var\(--cancha-claro\),\s*var\(--cancha-oscuro\)\s*\)/)
  })
})

describe('«Pasate a Premium»', () => {
  // Alan, 11/10: «el negro rompe mucho».
  const perfil = readFileSync('src/pages/Profile.tsx', 'utf8')
  const tarjeta = perfil.slice(perfil.indexOf('Pasate a Premium') - 600, perfil.indexOf('Pasate a Premium'))

  it('no usa el degradé casi negro ni el texto blanco', () => {
    expect(tarjeta).not.toMatch(/from-ink-800|to-ink-900|text-white/)
    expect(tarjeta).toMatch(/from-xp-50/)
  })
})

describe('la barra de abajo', () => {
  function verBarra(ruta = '/') {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <BottomNav />
        <Routes>
          <Route path="*" element={<p>pantalla</p>} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('cada ícono va envuelto en su animación, y siguen las cinco etiquetas', () => {
    const { container } = verBarra()
    for (const etiqueta of ['Inicio', 'Mapa', 'Escanear', 'Beneficios', 'Perfil']) {
      expect(screen.getByRole('link', { name: etiqueta })).toBeInTheDocument()
    }
    expect(container.querySelectorAll('[data-icono]')).toHaveLength(5)
  })

  it('tocar un ícono navega y lo marca como activo', () => {
    verBarra('/')
    fireEvent.click(screen.getByRole('link', { name: 'Mapa' }))
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('aria-current', 'page')
  })
})
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/components/features/retoques.test.tsx > /tmp/t1-rojo.txt 2>&1; echo "exit=$?"`
Expected: `exit=1`. Fallan el césped, por las franjas; Premium, por `from-ink-800`; y la barra, porque no hay `[data-icono]`.

- [ ] **Step 3: El césped**

En `src/index.css`, reemplazá el bloque `.bg-cancha` entero, con su comentario, por:

```css
  /* Césped: un verde liso con un degradé suave de arriba hacia abajo. Sin franjas: a Alan no le
     gustaban las celdas alternadas (11/10/2026). */
  .bg-cancha {
    background-image: linear-gradient(180deg, var(--cancha-claro), var(--cancha-oscuro));
  }
```

- [ ] **Step 4: «Pasate a Premium»**

En `src/pages/Profile.tsx`, reemplazá la rama `: (` de la tarjeta Premium (el `<div className="rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 p-5 text-white">` hasta su cierre) por:

```tsx
        <div className="rounded-2xl border border-xp-200 bg-gradient-to-br from-xp-50 to-xp-100 p-5 shadow-sm dark:border-xp-700/40 dark:from-xp-700/15 dark:to-xp-700/5">
          <div className="flex items-center gap-2 font-extrabold text-xp-700 dark:text-xp-300">
            <Crown size={20} /> Pasate a Premium
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            La app es gratis. Premium potencia tus beneficios y tu impacto.
          </p>
          <ul className="mt-3 space-y-1.5">
            {PREMIUM_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-xp-600 dark:text-xp-300" /> {p}
              </li>
            ))}
          </ul>
          <Button variant="xp" block size="lg" className="mt-4" onClick={goPremium}>
            Probar Premium
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Demo: no se cobra.</p>
        </div>
```

- [ ] **Step 5: La barra de abajo**

Reemplazá `src/components/features/BottomNav.tsx` entero por:

```tsx
import { NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Gift, Home, MapPin, QrCode, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/escanear', label: 'Escanear', icon: QrCode, center: true },
  { to: '/beneficios', label: 'Beneficios', icon: Gift },
  { to: '/perfil', label: 'Perfil', icon: User },
]

/**
 * El ícono de la barra: al apretarlo se achica, y al quedar elegido rebota (sube y crece un poco, y
 * vuelve). Con «reducir movimiento» del sistema queda quieto.
 */
function IconoDeLaBarra({ icon: Icon, activo, centro }: { icon: LucideIcon; activo: boolean; centro?: boolean }) {
  const reducir = useReducedMotion()
  return (
    <motion.span
      data-icono
      className="inline-flex"
      animate={reducir ? undefined : activo ? { y: [0, -5, 0], scale: [1, 1.18, 1] } : { y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileTap={reducir ? undefined : { scale: centro ? 0.88 : 0.85 }}
    >
      <Icon size={centro ? 24 : 22} strokeWidth={centro ? 2.4 : activo ? 2.6 : 2} />
    </motion.span>
  )
}

export function BottomNav() {
  const reducir = useReducedMotion()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md md:hidden">
      <div className="pb-safe border-t border-border bg-card/95 backdrop-blur-md">
        <ul className="grid grid-cols-5 items-end px-2 pt-1.5">
          {items.map(({ to, label, icon, end, center }) => (
            <li key={to} className="flex justify-center">
              <NavLink
                to={to}
                end={end}
                aria-label={label}
                className="group flex w-full flex-col items-center gap-0.5"
              >
                {({ isActive }) =>
                  center ? (
                    <span className="-mt-7 flex flex-col items-center">
                      <span
                        className={cn(
                          'relative grid h-14 w-14 place-items-center rounded-full bg-eco-600 text-white shadow-lg shadow-eco-600/40 ring-4 ring-card',
                          isActive && 'bg-eco-700',
                        )}
                      >
                        {/* El pulso del botón del medio al quedar elegido */}
                        {isActive && !reducir && (
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full bg-eco-500"
                            initial={{ scale: 1, opacity: 0.45 }}
                            animate={{ scale: 1.45, opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                          />
                        )}
                        <IconoDeLaBarra icon={icon} activo={isActive} centro />
                      </span>
                      <span className="mt-0.5 text-[11px] font-semibold text-eco-700">{label}</span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors',
                        isActive ? 'text-eco-700' : 'text-muted-foreground',
                      )}
                    >
                      <IconoDeLaBarra icon={icon} activo={isActive} />
                      {label}
                    </span>
                  )
                }
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
```

- [ ] **Step 6: Correr las pruebas y ver el verde**

Run: `npx vitest run src/components/features/retoques.test.tsx > /tmp/t1-verde.txt 2>&1; echo "exit=$?"`
Expected: `exit=0`.

Después, la suite entera, los tipos y el lint. Los tres tienen que dar `exit=0`; si una prueba vieja buscaba las franjas o la tarjeta negra, actualizala:

```bash
npx vitest run > /tmp/t1-suite.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t1-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t1-lint.txt 2>&1; echo "exit=$?"
```

- [ ] **Step 7: Commit**

```bash
git add src/index.css src/pages/Profile.tsx src/components/features/BottomNav.tsx src/components/features/retoques.test.tsx
git commit -m "feat(app): el césped sin franjas, «Pasate a Premium» en dorado claro y los íconos de la barra que se mueven" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Todos los puntos en Córdoba capital

**Files:**
- Modify:
  - `src/types/index.ts`: `RecyclePoint`, alrededor de las líneas 57-69;
  - `src/services/mocks/data.ts`: los 8 puntos (líneas ~130-225), los beneficios, el municipio, el historial (`pointName`) y las métricas por punto de YPF;
  - `src/services/mocks/escenarioClub.ts`: los dos puntos del club, y sacar los remapeos que quedan de más;
  - `src/pages/commerce/CommerceOnboarding.tsx`: el punto que crea el alta, alrededor de las líneas 82-93;
  - `src/store/versionDeDatos.ts`: sube a 3;
  - `src/pages/MapPoints.tsx`: sólo la posición de los pines, para que compile con `lat`/`lng`; la pantalla se rehace en la tarea 4.
- Test: `src/services/mocks/puntosEnCordoba.test.ts` (nuevo), más las pruebas existentes que nombren los puntos viejos.

**Interfaces:**
- Consumes: `datosGenerales` (`src/services/mocks/datos.ts`) y `datosDelClub(base, club)` (`src/services/mocks/escenarioClub.ts`), los mismos que usa `src/services/mocks/escenarioClub.test.ts`.
- Produces: `RecyclePoint` con `lat: number` y `lng: number` en lugar de `x`/`y`, y todos los puntos en Córdoba con los valores de la tabla de las Global Constraints. `VERSION_DE_LOS_DATOS === 3`.

- [ ] **Step 1: La prueba que falla**

`src/services/mocks/puntosEnCordoba.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { datosGenerales } from './datos'
import { datosDelClub } from './escenarioClub'
import { VERSION_DE_LOS_DATOS } from '@/store/versionDeDatos'

const club = datosDelClub(datosGenerales, { nombre: 'Talleres', estadio: 'Estadio', sede: 'Sede social' })
// Córdoba capital, con margen: el Kempes queda adentro, Buenos Aires y los pueblos de la provincia no.
const enCordoba = (p: { lat: number; lng: number }) => p.lat > -31.5 && p.lat < -31.3 && p.lng > -64.3 && p.lng < -64.1
const BUENOS_AIRES = /Palermo|Recoleta|Libertador|Cabildo|Panamericana|Lanús|Vicente López|Pilar|CABA|Plaza Mitre/

const UBICACIONES: Record<string, [number, number]> = {
  p_ypf_libertador: [-31.41847, -64.176348],
  p_ypf_cabildo: [-31.422153, -64.189875],
  p_ypf_pana: [-31.409436, -64.184583],
  p_muni_plaza: [-31.417111, -64.19123],
  p_lumen_palermo: [-31.430756, -64.187332],
  p_mcdonalds_palermo: [-31.428794, -64.190979],
  p_starbucks_recoleta: [-31.423175, -64.18696],
  p_grido_lanus: [-31.420568, -64.187765],
  p_club_estadio: [-31.368847, -64.246145],
  p_club_sede: [-31.415995, -64.183657],
}

describe('los puntos de las dos demos, en Córdoba capital', () => {
  it.each([
    ['general', datosGenerales],
    ['club', club],
  ])('en la demo %s, cada punto tiene lat/lng adentro de Córdoba y su ciudad es Córdoba', (_, datos) => {
    expect(datos.points.length).toBeGreaterThan(0)
    for (const p of datos.points) {
      expect(enCordoba(p), p.id).toBe(true)
      expect(p.city, p.id).toBe('Córdoba')
      expect(p).not.toHaveProperty('x')
    }
  })

  it('cada id queda en su lugar, con los ids de siempre', () => {
    for (const p of datosGenerales.points) {
      expect(UBICACIONES[p.id], p.id).toBeDefined()
      expect([p.lat, p.lng]).toEqual(UBICACIONES[p.id])
    }
  })

  it('no queda Buenos Aires en los puntos, los beneficios ni el historial', () => {
    for (const datos of [datosGenerales, club]) {
      expect(JSON.stringify(datos.points)).not.toMatch(BUENOS_AIRES)
      expect(JSON.stringify(datos.benefits)).not.toMatch(BUENOS_AIRES)
      expect(JSON.stringify(datos.contributions)).not.toMatch(BUENOS_AIRES)
    }
  })

  it('el municipio de la demo general es de ejemplo, y no está en la del club', () => {
    expect(datosGenerales.sponsors.find((s) => s.id === 's_muni')?.name).toBe('Municipio de ejemplo')
    expect(club.points.some((p) => p.id === 'p_muni_plaza')).toBe(false)
  })

  it('la demo del club usa los nombres de ejemplo', () => {
    const nombres = club.points.map((p) => p.name)
    expect(nombres).toEqual(expect.arrayContaining([
      'Norte Energía Bv. Perón', 'Norte Energía San Luis', 'Norte Energía Humberto Primo', 'Café Lúmen Nueva Córdoba',
      'Burger Plaza Nueva Córdoba', 'Café Andino Nueva Córdoba', 'Helados del Parque Bv. San Juan',
      'Punto R · Estadio', 'Punto R · Sede social',
    ]))
    expect(JSON.stringify(club.points)).not.toMatch(/YPF|McDonald|Starbucks|Grido/)
  })

  it('la versión de los datos guardados sube a 3: cambiaron los nombres de los puntos', () => {
    expect(VERSION_DE_LOS_DATOS).toBe(3)
  })
})
```

Ojo:
- `datosGenerales.contributions` es el nombre esperado del historial en `DatosDemo` (`src/services/mocks/datos.ts`). Si el campo se llama distinto, usá el nombre real y anotalo en el reporte.
- Lo mismo vale para los nombres del club: si `datosDelClub` arma los dos puntos del club con el nombre `Punto R · ${club.estadio}` o algo parecido, ajustá lo esperado al nombre real que sale con `{ estadio: 'Estadio', sede: 'Sede social' }`.

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/services/mocks/puntosEnCordoba.test.ts > /tmp/t2-rojo.txt 2>&1; echo "exit=$?"`
Expected: `exit=1`, porque todavía hay `x`/`y`, ciudades de Buenos Aires y la versión es 2.

- [ ] **Step 3: El tipo**

En `src/types/index.ts`, en `RecyclePoint`, reemplazá:

```ts
  /** Coordenadas normalizadas 0..100 sobre el mapa esquemático. */
  x: number
  y: number
```

por:

```ts
  /** Dónde está, en grados (WGS84): el mapa de Córdoba lo dibuja ahí. */
  lat: number
  lng: number
```

- [ ] **Step 4: Los datos de la demo general** (`src/services/mocks/data.ts`)

- **Los 8 puntos:** a cada uno, poné `name`, `address`, `city: 'Córdoba'`, `lat` y `lng` de la tabla de las Global Constraints, y sacale `x`/`y`. No toques `id`, `sponsorId`, `type`, `acceptedMaterials` ni `openNow`.
- **El municipio** (`s_muni`):
  - `name: 'Municipio de ejemplo'` y `slug: 'municipio-de-ejemplo'`;
  - en su `tagline`, si nombra a Vicente López, sacalo;
  - en todos los `sponsorName: 'Municipio de Vicente López'`, cambialo a `'Municipio de ejemplo'`.
- **Los beneficios:** todos los `city` que hoy son `'CABA'`, `'Vicente López'` o `'Lanús'` pasan a `'Córdoba'`. Las causas (`cause_*`) no se tocan.
- **El historial:**
  - `pointName: 'YPF Av. del Libertador 5800'` pasa a `'YPF Bv. Perón'`;
  - `'Café Lúmen Palermo'` pasa a `'Café Lúmen Nueva Córdoba'`;
  - `'Punto Verde Plaza Mitre'` pasa a `'Punto Verde Plaza de la Intendencia'`;
  - cualquier otro `pointName` de un punto de la tabla, al nombre nuevo.
- **Las métricas por punto de YPF:**
  - `'Libertador 5800'` pasa a `'Bv. Perón'`;
  - `'Cabildo 2200'`, a `'San Luis'`;
  - `'Panamericana KM 30'`, a `'Humberto Primo'`.
- **La comprobación:** `grep -n "Vicente López\|Palermo\|Recoleta\|Libertador\|Cabildo\|Panamericana\|Lanús\|Pilar\|Plaza Mitre" src/services/mocks/data.ts` sólo puede devolver las causas o nada.

- [ ] **Step 5: La demo del club** (`src/services/mocks/escenarioClub.ts`)

- **Los dos puntos del club** (`p_club_estadio` y `p_club_sede`, alrededor de las líneas 110-130): sacales `x`/`y` y poneles `lat`/`lng` y `address` de la tabla.
  - Estadio: `'Estadio Mario Alberto Kempes, ingreso principal en días de partido'`, -31.368847, -64.246145.
  - Sede: `'Rosario de Santa Fe 15, frente a la Plaza San Martín'`, -31.415995, -64.183657.
- **Los remapeos que sobran:** como `data.ts` ya está en Córdoba, `PUNTOS_EN_CORDOBA` y `METRICAS_EN_CORDOBA` no hacen falta.
  - Sacalos junto con el código que los aplica.
  - Los nombres del club salen de `MARCAS_DE_EJEMPLO`: «YPF Bv. Perón» queda «Norte Energía Bv. Perón».
  - Actualizá el comentario de arriba: la red de ejemplo está en Córdoba en las dos demos.
- **Lo que queda igual:** `MARCAS_DE_EJEMPLO`, `NO_VAN` y el resto.

- [ ] **Step 6: El alta y la versión**

En `src/pages/commerce/CommerceOnboarding.tsx`, en el `point` que crea el alta:
- `city: city.trim() || 'CABA'` pasa a `city: city.trim() || 'Córdoba'`;
- `x: 50, y: 50` pasan a estas dos líneas:

```ts
      // Sin una dirección elegida en un mapa, el punto nuevo se ve en Nueva Córdoba (Paseo del Buen Pastor).
      lat: -31.424083,
      lng: -64.18642,
```

En `src/store/versionDeDatos.ts`:
- `VERSION_DE_LOS_DATOS` pasa a `3`;
- sumá al comentario: ` * 3 · 11/10/2026: los puntos pasaron a Córdoba capital (Nueva Córdoba y el Centro), con otros nombres: lo guardado nombraba los viejos.`

- [ ] **Step 7: Que el mapa de hoy compile hasta la tarea 4**

En `src/pages/MapPoints.tsx`, reemplazá `style={{ left: \`${p.x}%\`, top: \`${p.y}%\` }}` por una proyección lineal sobre el recuadro de Córdoba:

```tsx
                  // Provisorio hasta el mapa de Córdoba: el recuadro del Kempes al Centro, en porcentaje.
                  style={{ left: `${((p.lng + 64.26) / 0.1) * 100}%`, top: `${((-31.36 - p.lat) / 0.08) * 100}%` }}
```

- [ ] **Step 8: Correr las pruebas y ver el verde**

Run: `npx vitest run src/services/mocks/puntosEnCordoba.test.ts > /tmp/t2-verde.txt 2>&1; echo "exit=$?"`
Expected: `exit=0`.

Después, la suite entera, el escenario del club, los tipos y el lint (los cuatro con `exit=0`):

```bash
npx vitest run > /tmp/t2-suite.txt 2>&1; echo "exit=$?"
VITE_ESCENARIO=club npx vitest run > /tmp/t2-club.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t2-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t2-lint.txt 2>&1; echo "exit=$?"
```

Si fallan pruebas existentes que nombran los puntos viejos, actualizá sus valores esperados a los nombres nuevos, sin debilitarlas, y listalas en el reporte. Las candidatas: `src/services/mocks/escenarioClub.test.ts`, `src/lib/aportesDeLaSesion.test.ts` y las que usen «Av. Colón 1500», «Cerro de las Rosas» o «Circunvalación».

- [ ] **Step 9: Commit**

Commiteá los archivos de esta tarea, sin `-A`, con el mensaje `feat(mapa): todos los puntos de las dos demos en Córdoba capital, en lugares reales de Nueva Córdoba y el Centro` y el `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` al final.

---

### Task 3: La lógica del mapa (`src/lib/mapa.ts`)

**Files:**
- Create: `src/lib/mapa.ts`
- Test: `src/lib/mapa.test.ts`

**Interfaces:**
- Consumes: `RecyclePoint` con `lat`/`lng` (tarea 2) y `MaterialType` (`src/types/index.ts`).
- Produces:
  - `interface Lugar { lat: number; lng: number }`;
  - `type Recuadro = [[number, number], [number, number]]`;
  - `CENTRO_Y_NUEVA_CORDOBA: Recuadro`, `CENTRO_DE_CORDOBA: Lugar` y `RADIO_DE_CORDOBA_KM = 50`;
  - `distanciaKm(a, b): number`;
  - `textoDeDistancia(km): string`;
  - `interface Filtros { abiertos: boolean; material: MaterialType | null }`;
  - `filtrarPuntos(puntos, filtros)`;
  - `materialesDeLaRed(puntos): MaterialType[]`;
  - `ordenarPuntos(puntos, desde?)`;
  - `enlaceComoLlegar(lugar): string`;
  - `estaEnCordoba(lugar): boolean`;
  - `recuadroDe(lugares): Recuadro | null`.

- [ ] **Step 1: La prueba que falla**

`src/lib/mapa.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { RecyclePoint } from '@/types'
import {
  CENTRO_DE_CORDOBA, distanciaKm, enlaceComoLlegar, estaEnCordoba, filtrarPuntos, materialesDeLaRed, ordenarPuntos,
  recuadroDe, textoDeDistancia,
} from './mapa'

const PLAZA_SAN_MARTIN = { lat: -31.416736, lng: -64.183581 }
const PLAZA_ESPANA = { lat: -31.428564, lng: -64.184875 }
const KEMPES = { lat: -31.368847, lng: -64.246145 }

const punto = (id: string, lugar: { lat: number; lng: number }, abierto: boolean, materiales: RecyclePoint['acceptedMaterials']): RecyclePoint => ({
  id, name: id, sponsorId: 's', type: 'deposito', address: '', city: 'Córdoba', ...lugar, acceptedMaterials: materiales, openNow: abierto,
})
const cerca = punto('cerca', PLAZA_ESPANA, false, ['tapitas'])
const centro = punto('centro', PLAZA_SAN_MARTIN, true, ['tapitas', 'vidrio'])
const lejos = punto('lejos', KEMPES, true, ['plastico'])

describe('distanciaKm', () => {
  it('de la Plaza San Martín a la Plaza España hay 1,3 km, y al Kempes 8 km', () => {
    expect(distanciaKm(PLAZA_SAN_MARTIN, PLAZA_ESPANA)).toBeCloseTo(1.32, 1)
    expect(distanciaKm(PLAZA_SAN_MARTIN, KEMPES)).toBeCloseTo(7.98, 0)
    expect(distanciaKm(PLAZA_ESPANA, PLAZA_ESPANA)).toBe(0)
  })
})

describe('textoDeDistancia', () => {
  it('en metros redondeados a la decena por debajo del kilómetro, y en kilómetros con una decimal', () => {
    expect(textoDeDistancia(0.347)).toBe('a 350 m')
    expect(textoDeDistancia(0.004)).toBe('a 10 m')
    expect(textoDeDistancia(1.234)).toBe('a 1,2 km')
    expect(textoDeDistancia(12)).toBe('a 12,0 km')
  })
})

describe('filtrarPuntos y materialesDeLaRed', () => {
  it('«Abiertos ahora» deja los abiertos; un material deja los que lo reciben; juntos, los dos', () => {
    const todos = [cerca, centro, lejos]
    expect(filtrarPuntos(todos, { abiertos: false, material: null })).toEqual(todos)
    expect(filtrarPuntos(todos, { abiertos: true, material: null }).map((p) => p.id)).toEqual(['centro', 'lejos'])
    expect(filtrarPuntos(todos, { abiertos: false, material: 'tapitas' }).map((p) => p.id)).toEqual(['cerca', 'centro'])
    expect(filtrarPuntos(todos, { abiertos: true, material: 'tapitas' }).map((p) => p.id)).toEqual(['centro'])
  })

  it('los materiales de la red salen sin repetir, en el orden en que aparecen', () => {
    expect(materialesDeLaRed([cerca, centro, lejos])).toEqual(['tapitas', 'vidrio', 'plastico'])
  })
})

describe('ordenarPuntos', () => {
  it('sin ubicación, primero los abiertos', () => {
    expect(ordenarPuntos([cerca, centro, lejos]).map((p) => p.id)).toEqual(['centro', 'lejos', 'cerca'])
  })

  it('con ubicación, primero los abiertos y, entre ellos, del más cercano al más lejano', () => {
    expect(ordenarPuntos([lejos, cerca, centro], PLAZA_ESPANA).map((p) => p.id)).toEqual(['centro', 'lejos', 'cerca'])
  })

  it('no cambia la lista que recibe', () => {
    const lista = [cerca, centro]
    ordenarPuntos(lista)
    expect(lista.map((p) => p.id)).toEqual(['cerca', 'centro'])
  })
})

describe('enlaceComoLlegar, estaEnCordoba y recuadroDe', () => {
  it('«Cómo llegar» abre Google Maps con el destino', () => {
    expect(enlaceComoLlegar(PLAZA_ESPANA)).toBe('https://www.google.com/maps/dir/?api=1&destination=-31.428564,-64.184875')
  })

  it('Córdoba capital está en Córdoba; Buenos Aires, no', () => {
    expect(estaEnCordoba(KEMPES)).toBe(true)
    expect(estaEnCordoba(CENTRO_DE_CORDOBA)).toBe(true)
    expect(estaEnCordoba({ lat: -34.603722, lng: -58.381592 })).toBe(false)
  })

  it('el recuadro encierra todos los lugares; sin lugares no hay recuadro', () => {
    expect(recuadroDe([PLAZA_ESPANA, KEMPES, PLAZA_SAN_MARTIN])).toEqual([[-31.428564, -64.246145], [-31.368847, -64.183581]])
    expect(recuadroDe([])).toBeNull()
  })
})
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/mapa.test.ts > /tmp/t3-rojo.txt 2>&1; echo "exit=$?"`
Expected: `exit=1`, porque no existe el módulo.

- [ ] **Step 3: `src/lib/mapa.ts`**

```ts
import type { MaterialType, RecyclePoint } from '@/types'

/**
 * La lógica del mapa de Córdoba, sin Leaflet: filtros, distancias, orden y enlaces. La pantalla y el
 * componente del mapa la usan; se prueba sola.
 */

/** Un lugar en el mapa, en grados. */
export interface Lugar {
  lat: number
  lng: number
}

/** Un recuadro: [[sur, oeste], [norte, este]], como lo pide Leaflet. */
export type Recuadro = [[number, number], [number, number]]

/** El Centro y Nueva Córdoba: la vista con que abre el mapa. */
export const CENTRO_Y_NUEVA_CORDOBA: Recuadro = [
  [-31.4325, -64.1945],
  [-31.4065, -64.1735],
]

/** El centro de Córdoba (Plaza San Martín): para saber si una ubicación queda en la ciudad. */
export const CENTRO_DE_CORDOBA: Lugar = { lat: -31.416736, lng: -64.183581 }

/** Más lejos que esto del centro, la ubicación no es de Córdoba: no se mueve el mapa. */
export const RADIO_DE_CORDOBA_KM = 50

/** La distancia entre dos lugares sobre la Tierra (fórmula de Haversine), en kilómetros. */
export function distanciaKm(a: Lugar, b: Lugar): number {
  const radio = 6371
  const rad = (grados: number) => (grados * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * radio * Math.asin(Math.sqrt(h))
}

/** «a 350 m» por debajo del kilómetro (a la decena, desde 10 m); «a 1,2 km» desde ahí. */
export function textoDeDistancia(km: number): string {
  if (km < 1) return `a ${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`
  return `a ${km.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

/** Los chips de arriba del mapa. */
export interface Filtros {
  abiertos: boolean
  material: MaterialType | null
}

export function filtrarPuntos(puntos: RecyclePoint[], filtros: Filtros): RecyclePoint[] {
  return puntos.filter(
    (p) => (!filtros.abiertos || p.openNow) && (!filtros.material || p.acceptedMaterials.includes(filtros.material)),
  )
}

/** Los materiales que recibe la red, sin repetir y en el orden en que aparecen: un chip por cada uno. */
export function materialesDeLaRed(puntos: RecyclePoint[]): MaterialType[] {
  return [...new Set(puntos.flatMap((p) => p.acceptedMaterials))]
}

/** Primero los abiertos; con una ubicación, del más cercano al más lejano. No toca la lista que recibe. */
export function ordenarPuntos(puntos: RecyclePoint[], desde?: Lugar | null): RecyclePoint[] {
  return [...puntos].sort((a, b) => {
    if (a.openNow !== b.openNow) return a.openNow ? -1 : 1
    return desde ? distanciaKm(desde, a) - distanciaKm(desde, b) : 0
  })
}

/** «Cómo llegar»: Google Maps con el destino, para abrir en otra pestaña o en la app del teléfono. */
export function enlaceComoLlegar(lugar: Lugar): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`
}

export function estaEnCordoba(lugar: Lugar): boolean {
  return distanciaKm(lugar, CENTRO_DE_CORDOBA) <= RADIO_DE_CORDOBA_KM
}

/** El recuadro que encierra todos los lugares («Ver todos»); sin lugares, null. */
export function recuadroDe(lugares: Lugar[]): Recuadro | null {
  if (!lugares.length) return null
  const lats = lugares.map((l) => l.lat)
  const lngs = lugares.map((l) => l.lng)
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}
```

- [ ] **Step 4: Correr las pruebas y ver el verde**

Run: `npx vitest run src/lib/mapa.test.ts > /tmp/t3-verde.txt 2>&1; echo "exit=$?"`. Expected: `exit=0`.

Después, `npx tsc -p tsconfig.app.json` y `npx eslint .`, los dos con `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mapa.ts src/lib/mapa.test.ts
git commit -m "feat(mapa): la lógica del mapa: filtros, distancias, orden y «Cómo llegar»" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: El mapa de verdad, rápido e interactivo

**Files:**
- Modify:
  - `package.json` y `package-lock.json`, por las dependencias;
  - `index.html`: el `preconnect` a las teselas;
  - `src/components/features/AppLayout.tsx`: precargar el mapa;
  - `src/components/features/PointCard.tsx`: la distancia y el elegido;
  - `src/pages/MapPoints.tsx`: el archivo entero, abajo.
- Create: `src/components/features/MapaDeCordoba.tsx`.
- Test: `src/pages/MapPoints.test.tsx` (nuevo).

**Interfaces:**
- Consumes: todo `src/lib/mapa.ts` (tarea 3), `RecyclePoint` con `lat`/`lng` (tarea 2) y `claveDeAlmacenamiento('scan-point')` (`src/lib/escenario.ts`), que es la clave del punto pendiente que lee Escanear (`src/pages/Scan.tsx:31`).
- Produces:
  - `MapaDeCordoba` (default export), con props `{ puntos: RecyclePoint[]; marcas: Map<string, Sponsor>; elegido: string | null; onElegir: (id: string) => void; miUbicacion: Lugar | null; vista: Vista }`;
  - `type Vista = { tipo: 'centro' | 'todos'; n: number }`. `n` sube para repetir un encuadre.

- [ ] **Step 1: Las dependencias**

```bash
npm install leaflet@1.9.4 react-leaflet@5.0.0
npm install -D @types/leaflet
```

`node_modules` es un enlace a otro worktree: `npm install` instala ahí, y está bien. Comprobá que `package.json` y `package-lock.json` del worktree tengan las tres.

- [ ] **Step 2: La prueba que falla**

`src/pages/MapPoints.test.tsx`:

```tsx
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint, Sponsor } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import MapPoints from './MapPoints'

// El mapa de Leaflet se reemplaza: acá se prueba la pantalla. Cada pin es un botón que dice si está elegido.
vi.mock('@/components/features/MapaDeCordoba', () => ({
  default: ({ puntos, elegido, onElegir }: { puntos: RecyclePoint[]; elegido: string | null; onElegir: (id: string) => void }) => (
    <div data-testid="mapa">
      {puntos.map((p) => (
        <button key={p.id} aria-pressed={p.id === elegido} onClick={() => onElegir(p.id)}>
          pin {p.name}
        </button>
      ))}
    </div>
  ),
}))

const marca: Sponsor = { id: 's_cafe', name: 'Café Andino', slug: 'cafe', category: 'comercio', brandColor: '#7c3aed', tagline: '', greenScore: 70, kgRecovered: 100 }
const punto = (id: string, name: string, lat: number, lng: number, openNow: boolean, materiales: RecyclePoint['acceptedMaterials']): RecyclePoint => ({
  id, name, sponsorId: 's_cafe', type: 'deposito', address: `${name} 123`, city: 'Córdoba', lat, lng, acceptedMaterials: materiales, openNow,
})
const PUNTOS = [
  punto('p_sede', 'Sede', -31.415995, -64.183657, true, ['tapitas', 'vidrio']),
  punto('p_espana', 'Plaza España', -31.428564, -64.184875, false, ['tapitas']),
  punto('p_kempes', 'Kempes', -31.368847, -64.246145, true, ['plastico']),
]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve(PUNTOS),
    getSponsors: () => Promise.resolve([marca]),
  },
}))

function verMapa() {
  return render(
    <MemoryRouter initialEntries={['/mapa']}>
      <Routes>
        <Route path="/mapa" element={<MapPoints />} />
        <Route path="/escanear" element={<p>Pantalla de escanear</p>} />
      </Routes>
    </MemoryRouter>,
  )
}
/** La lista de puntos, debajo del mapa. */
const lista = () => screen.getByRole('list', { name: 'Puntos de la red' })
const nombresDeLaLista = () => within(lista()).getAllByRole('listitem').map((li) => li.querySelector('p')?.textContent)

/** Simula la ubicación del navegador sin reemplazar `navigator` entero (React y sonner lo leen). */
function conUbicacion(getCurrentPosition: Geolocation['getCurrentPosition']) {
  Object.defineProperty(window.navigator, 'geolocation', { configurable: true, value: { getCurrentPosition } })
}

beforeEach(() => sessionStorage.clear())
afterEach(() => {
  vi.restoreAllMocks()
  delete (window.navigator as { geolocation?: Geolocation }).geolocation
})

describe('el mapa de Córdoba', () => {
  it('muestra los puntos en el mapa y en la lista, con los abiertos primero', async () => {
    verMapa()
    expect(await screen.findByRole('button', { name: 'pin Sede' })).toBeInTheDocument()
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
  })

  it('tocar un punto de la lista lo elige en el mapa y abre su tarjeta, con «Cómo llegar» a Google Maps', async () => {
    verMapa()
    fireEvent.click(await within(await screen.findByRole('list', { name: 'Puntos de la red' })).findByRole('button', { name: /Plaza España/ }))
    expect(screen.getByRole('button', { name: 'pin Plaza España' })).toHaveAttribute('aria-pressed', 'true')
    const tarjeta = screen.getByRole('region', { name: 'Plaza España' })
    const llegar = within(tarjeta).getByRole('link', { name: /Cómo llegar/ })
    expect(llegar).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=-31.428564,-64.184875')
    expect(llegar).toHaveAttribute('target', '_blank')
    expect(within(tarjeta).getByText(/Cerrado/)).toBeInTheDocument()
  })

  it('«Reciclar acá» deja el punto pendiente y va a Escanear', async () => {
    verMapa()
    fireEvent.click(await screen.findByRole('button', { name: 'pin Sede' }))
    fireEvent.click(within(screen.getByRole('region', { name: 'Sede' })).getByRole('button', { name: /Reciclar acá/ }))
    expect(await screen.findByText('Pantalla de escanear')).toBeInTheDocument()
    expect(sessionStorage.getItem(claveDeAlmacenamiento('scan-point'))).toBe('p_sede')
  })

  it('los chips filtran el mapa y la lista; sin resultados lo dice y «Ver todos» los vuelve a mostrar', async () => {
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    fireEvent.click(screen.getByRole('button', { name: 'Abiertos ahora' }))
    expect(screen.queryByRole('button', { name: 'pin Plaza España' })).not.toBeInTheDocument()
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes'])
    fireEvent.click(screen.getByRole('button', { name: 'Vidrio' }))
    expect(nombresDeLaLista()).toEqual(['Sede'])
    fireEvent.click(screen.getByRole('button', { name: 'Plástico' }))
    expect(nombresDeLaLista()).toEqual(['Kempes'])
    fireEvent.click(screen.getByRole('button', { name: 'Abiertos ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Plástico' }))
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
  })

  it('«Cerca mío» con permiso ordena por distancia y la escribe en cada punto', async () => {
    const getCurrentPosition = vi.fn((ok: PositionCallback) =>
      ok({ coords: { latitude: -31.4286, longitude: -64.1849 } } as GeolocationPosition),
    )
    conUbicacion(getCurrentPosition as unknown as Geolocation['getCurrentPosition'])
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
    expect(within(lista()).getByText('a 1,4 km')).toBeInTheDocument()
    expect(within(lista()).getByText(/^a \d+ m$/)).toBeInTheDocument()
  })

  it('«Cerca mío» sin permiso lo dice, y lejos de Córdoba avisa y no cambia nada', async () => {
    const error = vi.spyOn(toast, 'error')
    const info = vi.spyOn(toast, 'info')
    const deniega = vi.fn((_ok: PositionCallback, mal?: PositionErrorCallback | null) => mal?.({ code: 1 } as GeolocationPositionError))
    conUbicacion(deniega as unknown as Geolocation['getCurrentPosition'])
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/permiso de ubicación/))

    const enBuenosAires = vi.fn((ok: PositionCallback) => ok({ coords: { latitude: -34.6037, longitude: -58.3816 } } as GeolocationPosition))
    conUbicacion(enBuenosAires as unknown as Geolocation['getCurrentPosition'])
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(info).toHaveBeenCalledWith(expect.stringMatching(/lejos de Córdoba/))
    // Sin ubicación no hay distancias: ninguna línea empieza con «a » y un número.
    expect(within(lista()).queryByText(/^a \d/)).toBeNull()
  })
})
```

- [ ] **Step 3: Correrla y ver que falla**

Run: `npx vitest run src/pages/MapPoints.test.tsx > /tmp/t4-rojo.txt 2>&1; echo "exit=$?"`
Expected: `exit=1`. Hoy no existen `MapaDeCordoba`, la lista con nombre ni los chips.

- [ ] **Step 4: `src/components/features/MapaDeCordoba.tsx`**

```tsx
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { RecyclePoint, Sponsor } from '@/types'
import { CENTRO_Y_NUEVA_CORDOBA, recuadroDe, type Lugar } from '@/lib/mapa'

/** Qué encuadrar: el Centro y Nueva Córdoba, o todos los puntos. `n` sube para repetir el mismo encuadre. */
export type Vista = { tipo: 'centro' | 'todos'; n: number }

interface Props {
  puntos: RecyclePoint[]
  marcas: Map<string, Sponsor>
  elegido: string | null
  onElegir: (id: string) => void
  miUbicacion: Lugar | null
  vista: Vista
}

// Las teselas del estilo claro de CARTO, sobre OpenStreetMap. La atribución es obligatoria. Para el piloto,
// con tráfico real, hace falta un proveedor con plan comercial.
const TESELAS = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

/** El pin: un círculo del color de la marca con borde blanco; el elegido, más grande y con un halo. */
function iconoDelPunto(color: string, elegido: boolean): L.DivIcon {
  const lado = elegido ? 40 : 30
  const halo = elegido ? `box-shadow:0 0 0 6px ${color}55,0 4px 10px rgba(0,0,0,.35);` : 'box-shadow:0 2px 6px rgba(0,0,0,.3);'
  return L.divIcon({
    className: '',
    iconSize: [lado, lado],
    iconAnchor: [lado / 2, lado / 2],
    html: `<span style="display:grid;place-items:center;width:${lado}px;height:${lado}px;border-radius:9999px;background:${color};border:3px solid #fff;${halo}"><span style="width:${lado / 3}px;height:${lado / 3}px;border-radius:9999px;background:#fff"></span></span>`,
  })
}

/** Encuadra, vuela al elegido y a tu ubicación. Vive adentro del mapa para tener `useMap`. */
function ControlDeLaVista({ puntos, elegido, miUbicacion, vista }: Pick<Props, 'puntos' | 'elegido' | 'miUbicacion' | 'vista'>) {
  const mapa = useMap()

  useEffect(() => {
    const recuadro = vista.tipo === 'todos' ? recuadroDe(puntos) : CENTRO_Y_NUEVA_CORDOBA
    if (recuadro) mapa.fitBounds(recuadro, { padding: [28, 28] })
    // Sólo cuando se pide un encuadre: si dependiera de `puntos`, filtrar movería el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista.n, vista.tipo])

  useEffect(() => {
    const p = puntos.find((x) => x.id === elegido)
    if (p) mapa.flyTo([p.lat, p.lng], Math.max(mapa.getZoom(), 15), { duration: 0.6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegido])

  useEffect(() => {
    if (miUbicacion) mapa.flyTo([miUbicacion.lat, miUbicacion.lng], 15, { duration: 0.6 })
  }, [mapa, miUbicacion])

  return null
}

/**
 * El mapa de Córdoba con los puntos de la red (Leaflet). Arranca en el Centro y Nueva Córdoba. Tocar un
 * pin lo elige; la pantalla muestra su tarjeta.
 */
export default function MapaDeCordoba({ puntos, marcas, elegido, onElegir, miUbicacion, vista }: Props) {
  const iconos = useMemo(() => {
    const m = new Map<string, L.DivIcon>()
    for (const p of puntos) m.set(p.id, iconoDelPunto(marcas.get(p.sponsorId)?.brandColor ?? '#059669', p.id === elegido))
    return m
  }, [puntos, marcas, elegido])

  return (
    <MapContainer bounds={CENTRO_Y_NUEVA_CORDOBA} scrollWheelZoom className="h-full w-full">
      <TileLayer url={TESELAS} attribution={ATRIBUCION} subdomains="abcd" maxZoom={19} />
      {puntos.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={iconos.get(p.id)!}
          title={p.name}
          alt={p.name}
          zIndexOffset={p.id === elegido ? 1000 : 0}
          eventHandlers={{ click: () => onElegir(p.id) }}
        />
      ))}
      {miUbicacion && (
        <CircleMarker
          center={[miUbicacion.lat, miUbicacion.lng]}
          radius={8}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
        />
      )}
      <ControlDeLaVista puntos={puntos} elegido={elegido} miUbicacion={miUbicacion} vista={vista} />
    </MapContainer>
  )
}
```

- [ ] **Step 5: `PointCard` con la distancia y el elegido**

En `src/components/features/PointCard.tsx`:
- **Las props:** sumá `distancia?: string` y `elegido?: boolean`.
- **El botón:** sumale `aria-pressed={elegido}`.
- **Su `className`:** con `elegido`, agregá `ring-2 ring-eco-500`.
- **La distancia:** después del `<p>` de la dirección, sumá `{distancia && <p className="text-xs font-semibold text-eco-700 dark:text-eco-300">{distancia}</p>}`.

- [ ] **Step 6: `src/pages/MapPoints.tsx`**

Reemplazá el archivo entero por:

```tsx
import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Expand, LocateFixed, Navigation, Recycle, X } from 'lucide-react'
import type { MaterialType, Sponsor } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { cn, MATERIAL_LABEL } from '@/lib/utils'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import {
  distanciaKm, enlaceComoLlegar, estaEnCordoba, filtrarPuntos, materialesDeLaRed, ordenarPuntos, textoDeDistancia,
  type Filtros, type Lugar,
} from '@/lib/mapa'
import type { Vista } from '@/components/features/MapaDeCordoba'
import { PointCard } from '@/components/features/PointCard'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'

// Leaflet viene en su propio pedazo: la pantalla (chips y lista) se ve antes de que llegue el mapa.
const MapaDeCordoba = lazy(() => import('@/components/features/MapaDeCordoba'))

const SIN_FILTROS: Filtros = { abiertos: false, material: null }

export default function MapPoints() {
  const navigate = useNavigate()
  const { data: points, error, reload } = useApi(() => api.getPoints(), [])
  const { data: sponsors } = useApi(() => api.getSponsors(), [])
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [elegido, setElegido] = useState<string | null>(null)
  const [miUbicacion, setMiUbicacion] = useState<Lugar | null>(null)
  const [vista, setVista] = useState<Vista>({ tipo: 'centro', n: 0 })

  const marcas = useMemo(() => {
    const m = new Map<string, Sponsor>()
    sponsors?.forEach((s) => m.set(s.id, s))
    return m
  }, [sponsors])

  const materiales = useMemo(() => materialesDeLaRed(points ?? []), [points])
  const visibles = useMemo(() => filtrarPuntos(points ?? [], filtros), [points, filtros])
  const ordenados = useMemo(() => ordenarPuntos(visibles, miUbicacion), [visibles, miUbicacion])
  const punto = visibles.find((p) => p.id === elegido) ?? null

  function alternarMaterial(m: MaterialType) {
    setFiltros((f) => ({ ...f, material: f.material === m ? null : m }))
  }

  function cercaMio() {
    if (!navigator.geolocation) {
      toast.error('Este navegador no comparte la ubicación.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lugar = { lat: coords.latitude, lng: coords.longitude }
        if (!estaEnCordoba(lugar)) {
          toast.info('Estás lejos de Córdoba: te mostramos la red igual.')
          return
        }
        setMiUbicacion(lugar)
      },
      () => toast.error('No pudimos ubicarte. Revisá el permiso de ubicación del navegador.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function reciclarAca(id: string) {
    // Como el inicio: el punto queda pendiente y Escanear lo toma ya elegido.
    sessionStorage.setItem(claveDeAlmacenamiento('scan-point'), id)
    navigate('/escanear')
  }

  if (error && !points) return <ErrorState message={error} onRetry={reload} />

  const chip = (activo: boolean) =>
    cn(
      'shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
      activo ? 'border-eco-600 bg-eco-600 text-white' : 'border-border bg-card text-muted-foreground hover:bg-muted',
    )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Puntos adheridos</h1>
        <p className="text-sm text-muted-foreground">Dónde dejar tus tapitas en Córdoba: tocá un punto para ver cómo llegar.</p>
      </div>

      {/* Los filtros: filtran el mapa y la lista juntos */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtros">
        <button type="button" aria-pressed={filtros.abiertos} className={chip(filtros.abiertos)} onClick={() => setFiltros((f) => ({ ...f, abiertos: !f.abiertos }))}>
          Abiertos ahora
        </button>
        {materiales.map((m) => (
          <button key={m} type="button" aria-pressed={filtros.material === m} className={chip(filtros.material === m)} onClick={() => alternarMaterial(m)}>
            {MATERIAL_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* El mapa: `isolate` encierra los z-index de Leaflet, que si no pasan por encima del menú */}
        <div
          role="region"
          aria-label="Mapa de Córdoba"
          className="relative isolate h-[58vh] min-h-80 w-full overflow-hidden rounded-2xl border border-border bg-eco-50 dark:bg-eco-950 lg:sticky lg:top-6 lg:col-span-3 lg:h-[70vh] lg:self-start"
        >
          <Suspense fallback={<div className="h-full w-full bg-eco-50 dark:bg-eco-950" />}>
            <MapaDeCordoba puntos={visibles} marcas={marcas} elegido={elegido} onElegir={setElegido} miUbicacion={miUbicacion} vista={vista} />
          </Suspense>

          <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={cercaMio}>
              <LocateFixed size={15} /> Cerca mío
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setVista((v) => ({ tipo: 'todos', n: v.n + 1 }))}>
              <Expand size={15} /> Ver todos
            </Button>
          </div>

          {punto && (
            <section
              aria-label={punto.name}
              className="absolute inset-x-3 bottom-3 z-[1000] rounded-2xl bg-card/95 p-4 shadow-xl backdrop-blur"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold leading-tight">{punto.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {punto.address} · {marcas.get(punto.sponsorId)?.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold">
                    <span className={punto.openNow ? 'text-eco-700 dark:text-eco-300' : 'text-muted-foreground'}>
                      {punto.openNow ? 'Abierto ahora' : 'Cerrado'}
                    </span>
                    {miUbicacion && ` · ${textoDeDistancia(distanciaKm(miUbicacion, punto))}`}
                    {' · '}
                    {punto.acceptedMaterials.map((m) => MATERIAL_LABEL[m]).join(', ')}
                  </p>
                </div>
                <button type="button" aria-label="Cerrar" className="rounded-full p-1 text-muted-foreground hover:bg-muted" onClick={() => setElegido(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={enlaceComoLlegar(punto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
                >
                  <Navigation size={15} /> Cómo llegar
                </a>
                <Button type="button" size="sm" onClick={() => reciclarAca(punto.id)}>
                  <Recycle size={15} /> Reciclar acá
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* La lista: va con el mapa. Tocar un punto lo elige y el mapa vuela hasta él */}
        <div className="lg:col-span-2">
          {points && !visibles.length ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              Ningún punto cumple esos filtros.
              <div className="mt-3">
                <Button type="button" size="sm" variant="secondary" onClick={() => setFiltros(SIN_FILTROS)}>
                  Ver todos
                </Button>
              </div>
            </div>
          ) : (
            <ul aria-label="Puntos de la red" className="space-y-2">
              {ordenados.map((p) => (
                <li key={p.id}>
                  <PointCard
                    point={p}
                    sponsor={marcas.get(p.sponsorId)}
                    elegido={p.id === elegido}
                    distancia={miUbicacion ? textoDeDistancia(distanciaKm(miUbicacion, p)) : undefined}
                    onClick={() => setElegido(p.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
```

Ojo con dos cosas de la prueba:
- `nombresDeLaLista` lee el primer `<p>` de cada `<li>`, que en `PointCard` es el nombre.
- La prueba del filtro sin resultados espera «Ver todos». Ese botón vacía los filtros. El otro «Ver todos», arriba del mapa, encuadra todos los puntos. Los dos están bien.

- [ ] **Step 7: La carga rápida**

En `src/components/features/AppLayout.tsx`, sumá un `useEffect` junto al que ya hay:

```tsx
  // El mapa se precarga en un momento libre: al tocar «Mapa», ya está bajado.
  useEffect(() => {
    const precargar = () => {
      void import('@/pages/MapPoints')
      void import('@/components/features/MapaDeCordoba')
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(precargar)
      return () => window.cancelIdleCallback(id)
    }
    const t = window.setTimeout(precargar, 1500)
    return () => window.clearTimeout(t)
  }, [])
```

En `index.html`, después de los `preconnect` de Google Fonts, sumá:

```html
    <!-- Las teselas del mapa de Córdoba (CARTO): la conexión queda abierta antes de abrir el mapa -->
    <link rel="preconnect" href="https://a.basemaps.cartocdn.com" />
    <link rel="preconnect" href="https://b.basemaps.cartocdn.com" />
    <link rel="dns-prefetch" href="https://c.basemaps.cartocdn.com" />
    <link rel="dns-prefetch" href="https://d.basemaps.cartocdn.com" />
```

- [ ] **Step 8: Correr las pruebas y ver el verde**

Run: `npx vitest run src/pages/MapPoints.test.tsx > /tmp/t4-verde.txt 2>&1; echo "exit=$?"`. Expected: `exit=0`.

Después corré estos cuatro; todos tienen que dar `exit=0`:

```bash
npx vitest run > /tmp/t4-suite.txt 2>&1; echo "exit=$?"
VITE_ESCENARIO=club npx vitest run src/pages/MapPoints.test.tsx src/services/mocks/puntosEnCordoba.test.ts > /tmp/t4-club.txt 2>&1; echo "exit=$?"
npx tsc -p tsconfig.app.json > /tmp/t4-tsc.txt 2>&1; echo "exit=$?"
npx eslint . > /tmp/t4-lint.txt 2>&1; echo "exit=$?"
```

Y el build de las dos demos, una vez (también con `exit=0`):

```bash
rm -f node_modules/.tmp/*.tsbuildinfo; npm run build:railway > /tmp/t4-build.txt 2>&1; echo "exit=$?"; rm -rf dist
```

- [ ] **Step 9: Commit**

Commiteá los archivos de la tarea, incluidos `package.json` y `package-lock.json`, sin `-A`. El mensaje es `feat(mapa): un mapa de verdad de Córdoba, rápido e interactivo: chips, tarjeta con «Cómo llegar» y «Reciclar acá», «Cerca mío» y la lista junto al mapa`, con el `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` al final.

---

### Task 5 (la hace el controlador): docs, guion, verificación y publicación

- **`work-agent/11-HISTORIAL.md`:** el bullet de la rama.
- **`work-agent/03-DESIGN-SYSTEM.md`:** el césped liso, la barra animada, Premium en dorado y el mapa.
- **`docs/producto/prometido-vs-demo.md`:** el mapa.
- **El guion privado:** el mapa (Cerca mío, Cómo llegar), y que la marca se recarga después de publicar porque sube la versión de los datos.
- **En el navegador:**
  - 390 y 1280 px, y modo oscuro;
  - el mapa con sus teselas, los chips, la tarjeta y «Cerca mío»;
  - la barra animada, el césped y Premium.
- **Publicar:** PR, merge, Railway y GitHub Pages, con la verificación en producción.
