# ReciclaXP ♻️

App de **reciclaje incentivado**: reciclá tapitas y materiales, sumá **XP**, canjeá
beneficios en una red de lugares adheridos y seguí la **trazabilidad e impacto real**
de tu aporte. Incluye comunidad, rankings, proyectos de impacto visual y un panel B2B
para sponsors.

> MVP navegable (demo front-end) con datos simulados vía **MSW**. El backend real se
> enchufa reemplazando los handlers de mock — los tipos y la capa `services/api.ts`
> no cambian.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS 4** (`@tailwindcss/vite`) con tokens eco propios
- **react-router-dom 7** (rutas lazy)
- **zustand** (sesión, wallet XP, actividad, UI/tema) con persistencia
- **react-hook-form** + **zod** (formularios)
- **framer-motion** (animaciones, incl. el fill B&N→color del impacto)
- **MSW** (backend mock) · **vite-plugin-pwa** (instalable)
- **lucide-react**, **sonner**, **cva** + **tailwind-merge**
- **vitest** + **@testing-library**

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5183
```

Login: cualquier email/contraseña, o el botón **“Entrar a la demo sin registro”**.

### Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (:5183) |
| `npm run build` | Type-check + build de producción |
| `npm run build:no-msw` | Build sin MSW (para backend real) |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (vitest) |
| `npm run deploy` | Publica `dist/` en GitHub Pages |

## Funcionalidades (MVP)

- **Wallet XP con dos saldos**: reputación (ranking/nivel, no se gasta) y canjeable.
- **Escaneo QR simulado** → registra aporte y acredita XP.
- **Mapa** de puntos adheridos (estaciones, estadios, comercios, puntos verdes).
- **Marketplace de beneficios** con canje → cupón QR.
- **Ranking mensual** por sede/sponsor + premio del mes.
- **Proyecto de impacto visual** ⭐ — el producto reciclado (ej. banco de suplentes)
  arranca en blanco y negro y se colorea de abajo hacia arriba según lo recolectado,
  con % total, % individual, hitos y top aportantes.
- **Trazabilidad** del material (punto → lote → retiro → planta → producto).
- **Perfil + Premium** (mejores canjes, transferencia de XP).
- **Panel B2B** (`/empresas`): KPIs, aportes por mes y por punto.

## Deploy (GitHub Pages)

El `base` de Vite es `/reciclaje/`. Para publicar:

```bash
npm run deploy
```

Queda en `https://soyalantapia.github.io/reciclaje/`. El `public/404.html` + el script
de decode en `index.html` resuelven el ruteo SPA en GitHub Pages.

> Si el repo es **privado**, GitHub Pages requiere plan Pro. Para demo pública sin Pro,
> hacé el repo público.

## ⚠️ Nota sobre iCloud (importante)

El proyecto **real** vive en `~/dev/reciclaje` (fuera de iCloud). En `~/Desktop` está
sincronizado por iCloud Drive, que desaloja/lockea los binarios nativos de
`node_modules` (esbuild, rollup, lightningcss) y rompe `vite dev`/`build`. Hay un
**symlink** en `~/Desktop/Programacion/reciclaje → ~/dev/reciclaje` para tenerlo a mano
sin meter los archivos en iCloud.

## Handoff a backend real

1. Implementar los endpoints que consume `src/services/api.ts` (mismos contratos que
   `src/services/mocks/handlers.ts`).
2. Buildear con `npm run build:no-msw` y, en `vite.config.ts`, pasar VitePWA a
   `injectRegister: 'auto'` + `selfDestroying: false`.
