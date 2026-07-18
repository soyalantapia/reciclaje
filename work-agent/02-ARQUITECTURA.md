# 02 · Arquitectura

## Stack (versiones reales de `package.json`)

| Capa | Tecnología |
|---|---|
| Build | **Vite 8** (`^8.0.11`) + `@vitejs/plugin-react` |
| UI | **React 19** (`^19.2.5`) + **TypeScript** (`~6.0.2`) |
| Estilos | **Tailwind CSS 4** (`^4.2.4`) vía `@tailwindcss/vite` — tokens en `@theme inline` |
| Routing | **react-router-dom 7** (`^7.15.0`) — `createBrowserRouter`, rutas lazy |
| Estado | **zustand 5** (`^5.0.13`) con middleware `persist` (localStorage) |
| Backend mock | **MSW 2** (`^2.14.3`) — service worker que intercepta `/api/*` |
| PWA | **vite-plugin-pwa** (`^1.3.0`) |
| Animación | **framer-motion** (`^12.38.0`) |
| Iconos | **lucide-react** (`^0.471.2`) |
| Toasts | **sonner** (`^2.0.7`) |
| Forms | react-hook-form + zod + `@hookform/resolvers` |
| QR | `@zxing/browser` + `@zxing/library` (lectura cámara) · `qrcode` (generación) |
| Utilidades | `class-variance-authority` (cva) + `clsx` + `tailwind-merge` → helper `cn` |
| Tests | **vitest 4** + jsdom + @testing-library |
| Deploy | `gh-pages` → rama `gh-pages` de GitHub Pages |

Alias de imports: **`@/` → `src/`** (definido en `vite.config.ts` y `tsconfig`).

## Estructura de carpetas (real)

```
src/
├── components/
│   ├── ui/                    ← primitivas genéricas (design system)
│   │   ├── avatar · badge · button · card · card-grid · container
│   │   ├── input · label · modal · otp-input · progress · skeleton · tabs
│   ├── features/              ← componentes con lógica de dominio
│   │   ├── AppLayout · BottomNav · SideNav          (shell usuario)
│   │   ├── CommerceLayout · CommerceSideNav         (shell comercio)
│   │   ├── RequireAuth · RequireCommerce            (guards)
│   │   ├── BenefitCard · CauseCard · PointCard · RankingRow · StatCard
│   │   ├── ImpactProgress · TraceabilityTimeline · HuellaVerde · XpWallet
│   │   ├── QrScanner · QrImage · QrCoupon · BuyFlow
│   │   └── ErrorState · Logo · ProductIllustration
│   └── landing/
│       └── LandingHeader.tsx  ← header sticky con pestañas + scroll-spy
├── pages/                     ← una pantalla por archivo
│   ├── (usuario) Home, Scan, MapPoints, Marketplace, Ranking, Causes,
│   │   CauseDetail, Marcas, ImpactProjectPage, Traceability, CommerceQr,
│   │   Profile, Login, NotFound
│   └── commerce/              ← B2B
│       ├── CommerceLanding · CommerceLogin · CommerceOnboarding
│       └── CommerceResumen · CommerceBenefits · CommerceCampaigns
│           · CommercePoints · CommerceReports · CommercePlan
├── services/
│   ├── api.ts                 ← cliente HTTP tipado (única puerta a datos)
│   └── mocks/                 ← browser.ts · handlers.ts · data.ts (seed)
├── store/                     ← zustand: session, wallet, activity, ui, coupons,
│                                 causes, commerceBenefits, commerceCampaigns,
│                                 createdCommerce
├── hooks/                     ← useApi.ts · useThemeEffect.ts
├── lib/                       ← utils.ts · metrics.ts · qr.ts · copy.ts (+ tests)
├── types/index.ts             ← TODO el modelo de dominio
├── routes.tsx                 ← árbol de rutas + lazyWithRetry
├── index.css                  ← tokens Tailwind 4 (@theme inline) + utilidades
└── main.tsx                   ← bootstrap (arranca MSW antes de montar React)
```

## Capas y flujo de datos

```
Página  ──useApi()──►  services/api.ts  ──fetch /api/*──►  MSW handlers  ──►  data.ts (seed)
   │
   └──► zustand stores (persist) para estado de sesión/cliente
```

**Regla:** las páginas nunca hacen `fetch` directo. Van por `api.ts`.
Cuando exista backend real, se reemplazan los handlers de MSW y `api.ts` queda igual.

### `useApi` (src/hooks/useApi.ts)
Hook estándar de fetching: devuelve `{ data, loading, error, reload }`.
Se usa así en casi todas las páginas:
```tsx
const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])
```

## Routing (`src/routes.tsx`)

```
/login                                    → Login (usuario)
/                     [RequireAuth]       → AppLayout
   ├── /                                  → Home
   ├── /escanear · /mapa · /beneficios · /ranking · /perfil
   ├── /proyecto/:id · /trazabilidad/:projectId
   ├── /causas · /causa/:id
   ├── /marcas · /qr-comercios
/comercio/login                           → CommerceLogin (OTP)
/comercio/sumate                          → CommerceLanding  ⭐ landing B2B
/comercio/onboarding                      → CommerceOnboarding (wizard 3 pasos)
/comercio/registro                        → redirect a /comercio/sumate
/comercio            [RequireCommerce]    → CommerceLayout
   ├── (index)                            → CommerceResumen
   ├── beneficios · campanias · puntos · reportes · plan
/empresas                                 → redirect a /comercio
*                                         → NotFound
```

`basename` = `import.meta.env.BASE_URL` sin barra final → **`/reciclaje`** en prod,
**undefined** en dev.

### `lazyWithRetry`
Todas las páginas se cargan con `lazyWithRetry()`. Tras un deploy, el `index.html`
cacheado puede pedir chunks viejos que ya no existen ("Failed to fetch dynamically
imported module"); el primer fallo dispara **un** `window.location.reload()` por sesión
(flag en `sessionStorage`, key `reciclaxp-chunk-reload`). Si vuelve a fallar, propaga
al ErrorBoundary. **No romper este mecanismo.**

## PWA + MSW (coexistencia — leer antes de tocar)

`vite.config.ts` documenta el problema y la solución:

- VitePWA con auto-register inyectaría un SW de Workbox **en el mismo scope** que el SW
  de MSW → el segundo registro pisa al primero → las requests a `/api/*` salen a la red
  → 404 con el HTML del SPA.
- Por eso: **`injectRegister: null`** (Workbox no se auto-registra; MSW es el único SW)
  y **`selfDestroying: true`** (el `sw.js` generado se auto-desregistra y limpia cachés
  viejas al activarse).
- Cuando exista backend real (`npm run build:no-msw`), pasar a
  `injectRegister: 'auto'` y `selfDestroying: false`.

## Config clave de `vite.config.ts`

```ts
const BASE = '/reciclaje/'
base: command === 'build' ? BASE : '/'   // ⚠️ dev "/" vs build "/reciclaje/"
server: { port: 5183, strictPort: true }
resolve.alias: { '@': './src' }
test: { globals: true, environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }
```

Manifest PWA: nombre "ReciclaXP · Reciclá, sumá XP, cambiá tu mundo",
`theme_color: #059669`, `display: standalone`, `lang: es-AR`, `start_url`/`scope` = BASE.
