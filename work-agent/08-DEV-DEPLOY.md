# 08 · Desarrollo, deploy y troubleshooting

## Dónde vive el proyecto

```
~/dev/reciclaje                      ← ARCHIVOS REALES (trabajá acá)
~/Desktop/Programacion/reciclaje     ← symlink (Desktop está sincronizado con iCloud)
```
⚠️ **Nunca corras `npm install` ni el dev server desde la ruta de Desktop.** iCloud
rompe los binarios nativos de esbuild. Es una convención de todos los proyectos de este
usuario.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Vite en **http://localhost:5183** (base `/`) |
| `npm run build` | `tsc -b && vite build` → `dist/` (base `/reciclaje/`) |
| `npm run build:no-msw` | Build con `VITE_USE_MSW=false` (para cuando haya backend real) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (2 archivos, 14 tests) |
| `npm run preview` | Sirve el `dist/` buildeado |
| `npm run deploy` | `predeploy` (build) + `gh-pages -d dist` → publica |

**Definition of done de cualquier cambio:** `build` + `lint` + `test` en verde.
Lint hoy da **0 errores** y 7 warnings benignos y preexistentes
(`react-refresh/only-export-components` en archivos que exportan una constante junto al
componente, y un `eslint-disable` no usado en `Scan.tsx`).

## Deploy

- Target: **GitHub Pages**, rama `gh-pages`, repo público `soyalantapia/reciclaje`.
- URL: **https://soyalantapia.github.io/reciclaje/**
- `package.json` → `"homepage": "https://soyalantapia.github.io/reciclaje/"`.
- El deploy **no depende del push a `main`**: `npm run deploy` buildea y publica el
  `dist/` actual. Igual, commiteá y pusheá siempre antes de desplegar.

### Verificar que producción tiene lo último
```bash
# ¿el artefacto tiene el cambio?
grep -rl "algún texto nuevo" dist/assets/

# ¿el hash del entry de prod coincide con el local?
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' dist/index.html | head -1
curl -s https://soyalantapia.github.io/reciclaje/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1
```
Si coinciden, producción está actualizada. El CDN de Pages puede tardar **1–2 minutos**
en propagar.

---

## 🔧 Troubleshooting (los problemas que YA nos pasaron)

### 1. "Sigo viendo la versión vieja en producción"
**Causa:** service worker + caché del navegador, **no** el deploy.
- Confirmá primero con el chequeo de hashes de arriba.
- El `sw.js` publicado es **self-destroying** (se desregistra y borra todas las cachés al
  activarse), pero puede tardar 1–2 recargas.
- **Solución rápida:** abrir en **incógnito** (prueba definitiva) o recargar 2 veces o
  `Cmd/Ctrl+Shift+R`. Última opción: DevTools → Application → Service Workers →
  Unregister + Clear site data.

### 2. "En dev me da 404 / Página no encontrada"
**Causa:** el base path. En **dev** es `/`, en **build** es `/reciclaje/`.
- ✅ dev: `http://localhost:5183/comercio/sumate`
- ❌ dev: `http://localhost:5183/reciclaje/comercio/sumate` → NotFound
- En producción sí lleva `/reciclaje/`.

### 3. "El dev server no arranca / veo otra app en 5183"
**Causa:** `strictPort: true` y otro proyecto tomó el 5183.
```bash
lsof -ti tcp:5183 | xargs kill -9
```
Después relanzá. Verificá que sea ReciclaXP:
```bash
curl -s http://localhost:5183/ | grep -o '<title>.*</title>'
```

### 4. "Deep-link de un chunk falla tras deploy"
Es el caso que cubre `lazyWithRetry`: el `index.html` cacheado pide un chunk viejo.
Hace **un** reload automático por sesión. Si ves el loop, revisá la key
`sessionStorage['reciclaxp-chunk-reload']`.

### 5. "El screenshot de la preview sale en negro"
Ocurre después de un `window.scrollTo(...)`: la captura se desincroniza.
**Workaround:** cambiar el viewport (ej. 1280 → 1281) justo antes de capturar.
Para verificar contenido, `preview_eval` sobre el DOM es más confiable que la captura.

### 6. Rutas profundas en GitHub Pages
Pages devuelve **404** para `/comercio/sumate` porque no existe ese archivo — sirve
`404.html`, que contiene el redirect SPA (`pathSegmentsToKeep = 1`) y lleva al router.
En el navegador funciona bien; **un `curl` mostrando 404 en una ruta profunda es normal.**

## Cuentas de prueba

| Superficie | Credenciales |
|---|---|
| App usuario | `camila@reciclaxp.app` / `demo123` (precargadas en el form) |
| Panel comercio | `demo@reciclaxp.app` + OTP **`123456`** → entra como McDonald's |
| Otros comercios demo | `ypf@` · `river@` · `starbucks@` `reciclaxp.app`, mismo OTP |
