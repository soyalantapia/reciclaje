# CLAUDE.md — ReciclaXP

Guía rápida para trabajar en este repo.

## Qué es
PWA de reciclaje incentivado (XP, beneficios, comunidad, trazabilidad, B2B). MVP
navegable **front-end con datos mock (MSW)**. Ver `README.md` para el detalle de producto.

## Entorno (crítico)
- Proyecto real: **`~/dev/reciclaje`** (NO en `~/Desktop`, que está sincronizado por
  iCloud y rompe esbuild/rollup/lightningcss). Hay un symlink en
  `~/Desktop/Programacion/reciclaje`.
- GitHub: `soyalantapia/reciclaje`. Deploy a GitHub Pages con `npm run deploy`.
- Dev server: **:5183** (`strictPort`).

## Stack y convenciones
- Vite + React 19 + TS + Tailwind 4 (`@tailwindcss/vite`).
- Alias `@/` → `src/`.
- Tokens de tema en `src/index.css` (`@theme inline`): `eco-*` (verde, primario),
  `xp-*` (ámbar, recompensas), `ink-*` (neutrales). Variantes semánticas en `:root`/`.dark`.
- UI primitives en `src/components/ui` (patrón `cva` + helper `cn`).
- Componentes de feature en `src/components/features`.
- Estado en `src/store` (zustand persistido): `session`, `wallet`, `activity`, `ui`.
- Rutas lazy en `src/routes.tsx` (con `lazyWithRetry`).

## Datos / API
- Capa cliente: `src/services/api.ts`. Mock: `src/services/mocks/` (`handlers.ts`,
  `data.ts`, `browser.ts`). Endpoints bajo `${BASE}/api`.
- **MSW + PWA**: VitePWA va con `injectRegister: null` + `selfDestroying: true` para no
  pisar el SW de MSW. No cambiar sin leer el comentario en `vite.config.ts`.
- Flag `VITE_USE_MSW=false` desactiva el mock (para backend real).

## XP (regla de negocio)
Dos saldos separados: **reputación** (ranking/nivel, no se gasta) y **canjeable**
(beneficios). Niveles y umbrales en `src/lib/copy.ts`.

## Feature estrella
`src/components/features/ImpactProgress.tsx`: ilustración del producto reciclado que se
colorea de abajo hacia arriba (clip-path animado con framer-motion) según % recolectado.
Las ilustraciones SVG están en `ProductIllustration.tsx` (sin ids internos: se renderiza
dos veces).

## Comandos
`npm run dev` · `npm run build` · `npm run lint` · `npm run test` · `npm run deploy`
