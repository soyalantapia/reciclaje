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
| `npm run dev:club` | Servidor de desarrollo con el escenario club (:5183) |
| `npm run build` | Type-check + build de producción |
| `npm run build:no-msw` | Build sin MSW (para backend real) |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (vitest) |
| `npm run deploy` | Publica `dist/` en GitHub Pages |

### Escenario club (caso para el piloto)

`npm run dev:club` levanta la demo con el caso de un club: dos **Punto R** (estadio y sede), el
banco de suplentes como producto destacado, el ranking de la hinchada con su premio-experiencia
y las recompensas del club. El club de ejemplo de la demo general no aparece.

- **El club es Talleres** (decidido el 10/10/2026): las dos demos lo nombran y ninguna nombra a River
  (lo vigila `src/services/mocks/escenarioClub.test.ts`). Para mostrarle la demo a otro club, `.env.local`
  pisa el nombre, el estadio y la sede (`VITE_CLUB_NOMBRE`, `VITE_CLUB_ESTADIO`, `VITE_CLUB_SEDE`; ver
  `.env.example`). El escudo y los colores del club **no** se publican sin su permiso escrito.
- Guarda su estado con claves propias (`reciclaxp-club-*`): abrirlo en el mismo navegador no
  toca la demo general.
- Todas las pantallas llevan el aviso «Demo · los números son de ejemplo».
- Se publica aparte con `npm run deploy:club` en https://soyalantapia.github.io/reciclaje-club/
  (repo `soyalantapia/reciclaje-club`), y en Railway en https://reciclaxp.xnod.tech/club. `npm run deploy` sigue
  publicando la demo general en su dirección de siempre.
- Qué existe y qué falta respecto de lo prometido: `docs/producto/prometido-vs-demo.md`.

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

## Deploy en Railway (reciclaxp.xnod.tech)

El proyecto **reciclaXP** de Railway (workspace «Ticketera») tiene un solo servicio, `web`.

- **Build:** `npm run build:railway` compila dos veces el mismo código: la app general en `dist/` (base `/`) y el caso club en `dist/club/` (base `/club/`).
- **Arranque:** `node server.mjs`, un servidor estático sin dependencias (`server/estatico.mjs`):
  - cada app cae en su `index.html`;
  - los archivos con hash van con caché larga y el HTML y los service workers, sin caché;
  - un archivo que no existe da 404;
  - el chequeo de salud está en `/healthz`;
  - **si falta el `index.html` de alguna de las dos apps, no arranca**: el chequeo de salud falla y Railway deja el deploy anterior en pie.
- **Direcciones:**
  - app general: https://reciclaxp.xnod.tech (la dirección propia de Railway, https://web-production-781cc.up.railway.app, también sirve);
  - caso club: https://reciclaxp.xnod.tech/club.

**La configuración vive en el servicio, no sólo en `railway.json`.** El 10/10/2026 `railway up` no aplicó
el `railway.json` (el deploy registró `fileServiceManifest: {}`), corrió `npm run build` a secas y `/club/`
quedó en 502 con el chequeo de salud en verde. Desde entonces el comando de build, el de arranque y el
chequeo de salud están cargados en el servicio (Settings). `railway.json` repite los mismos valores: si
cambiás uno, cambiá los dos.

**Cómo se publica: cada push a `main` se publica solo**, con GitHub Actions
(`.github/workflows/railway.yml`):
1. `verificar`: `npm ci`, `tsc -b`, `vitest run` y `build:railway`, con las dos apps presentes. Si algo falla, no se publica.
2. `publicar`: `railway up --ci --service web` y después un chequeo de que `/healthz`, `/` y `/club/` respondan 200 en `reciclaxp.xnod.tech`.

El secreto `RAILWAY_TOKEN` del repo es un token **del proyecto** reciclaXP (entorno production), no de la
cuenta: se llama `github-actions-reciclaje` y se revoca en Railway → proyecto → Settings → Tokens.
Se eligió Actions y no la conexión directa de Railway con GitHub porque así las pruebas frenan un
deploy roto, y porque la app de GitHub de Railway no tiene acceso a este repo. **No conectes además el
servicio al repo en Railway (Settings → Source):** cada push se publicaría dos veces.

Para volver a publicar sin un push: Actions → «Publicar en Railway» → *Run workflow*. A mano, desde un
checkout limpio de `origin/main`:

```bash
railway link --project d5c0ac8a-d08d-4f71-9c5a-cdb94ab0b2c8 --environment production --service web
railway up --ci --service web
```

**DNS de `reciclaxp.xnod.tech`** (Cloudflare, zona `xnod.tech`, igual que `crm.xnod.tech`; cargados el 10/10/2026):

| Tipo | Nombre | Valor | Proxy |
|---|---|---|---|
| CNAME | `reciclaxp` | `dls0s0z4.up.railway.app` | apagado (sólo DNS) |
| TXT | `_railway-verify.reciclaxp` | el token que muestra Railway en el dominio | — |

GitHub Pages (abajo) sigue funcionando igual.

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
