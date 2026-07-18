# 09 · Decisiones y reglas del proyecto

> Si sos una IA retomando el proyecto: **leé esto antes de escribir código o copy.**
> Varias de estas reglas nacieron de correcciones explícitas del dueño del proyecto.

---

## 🔴 REGLA 1 — Honestidad en la UI (la más importante)

**Prohibido inventar métricas, usuarios, kg, testimonios o clientes.**

Origen: la landing mostraba "+24k usuarios reciclando", "9 marcas aliadas", "24 tn
recuperadas" y una sección "Marcas que ya están". El dueño lo cortó en seco:
> *"No mientas por las dudas, si necesitas un kpi pone por lanzarse en 100 puntos en cordoba capital"*

Cómo se aplica hoy:
- El KPI del hero es **"Por lanzarse · cupos fundadores — primeros 100 puntos en Córdoba
  Capital"** (escasez real, sin countdown falso).
- La sección de marcas se llama **"Marcas que queremos sumar"** con el subtítulo
  *"El tipo de marcas con las que estamos construyendo la red"* — porque esas marcas
  (Coca-Cola, McDonald's, YPF…) son datos de demo, **no clientes**.
- El mockup del panel en el hero muestra **etiquetas, no números**.
- Si falta un dato real → **placeholder marcado con `// TODO`**, nunca un número inventado.

Excepción consciente: el **panel de un comercio recién creado** sí muestra datos de
muestra (decisión explícita del dueño para que la demo no se vea vacía). Está documentado
en [06-COMERCIO-B2B.md](06-COMERCIO-B2B.md) y es reversible.

---

## REGLA 2 — Mobile-first, y el mobile no se toca

La PWA mobile es la experiencia primaria. Todo lo de tablet/desktop se agrega con
`md:` / `lg:` **encima** de las clases base. *"Si un cambio altera lo que ve el celular,
está mal."*

---

## REGLA 3 — Usar el sistema, no inventar otro

- Colores → tokens (`eco-*`, `xp-*`, semánticos). Nunca hex sueltos.
- Anchos → `<Container>`. Grillas → `<CardGrid>`. Botones → `<Button>`.
- Variantes → **cva**, siguiendo `button.tsx`.
- Clases → `cn()`.

---

## REGLA 4 — Responder siempre en español rioplatense
Convención global del usuario (vos/tenés/podés), también en el copy del producto.

---

## Decisiones técnicas y su porqué

| Decisión | Por qué |
|---|---|
| **MSW como backend** | Permite un MVP completo y demostrable sin servidor. `api.ts` aísla el cambio: con backend real se reemplazan handlers y las páginas no se tocan |
| **PWA con `injectRegister: null` + `selfDestroying: true`** | Workbox y MSW pelean por el mismo scope de service worker; el segundo registro rompía `/api/*`. Ver comentario extenso en `vite.config.ts` |
| **`lazyWithRetry`** | Tras un deploy, el HTML cacheado pide chunks viejos → un reload automático por sesión lo resuelve |
| **`base` distinto dev/prod** | GitHub Pages sirve bajo `/reciclaje/`; en dev molesta. Es la causa #1 de confusión (ver [08](08-DEV-DEPLOY.md)) |
| **XP partido en reputación vs canjeable** | El mérito (ranking) no se gasta al canjear; si no, canjear te hacía perder posiciones |
| **Sidebar desde `md` en la app, desde `lg` en el comercio** | El panel B2B es más denso y su pill-nav funciona bien en tablet |
| **`metricsFor()` compartida cliente/handler** | Un comercio creado en el onboarding no existe en el seed → daba 404. Una sola fórmula para ambos lados |
| **`COMMERCE_NAV` exportado desde `CommerceSideNav`** | Fuente única de los 6 ítems del panel; evita duplicar el array en el layout |
| **Landing: una promesa, un público** | Regla de conversión. El header tiene pestañas de **navegación**, no un switcher de audiencias |
| **Animaciones one-way (`whileInView` + `once`)** | Nada de loops ni bounce: se lee como poco profesional. Se respeta `useReducedMotion()` |
| **Repo público** | GitHub Pages gratis requiere repo público |

## Convenciones de trabajo

- **Commits** en español, con scope: `feat(comercio): …`, `fix(responsive): …`,
  `chore: …`. Cada etapa grande = un commit.
- **Nunca** trabajar desde la ruta de Desktop (iCloud).
- Verificación visual real (preview + screenshots) antes de dar algo por terminado,
  no solo "compila".
- Reportar con honestidad: si algo quedó sin hacer o sin verificar, decirlo
  explícitamente (ej. Lighthouse nunca se corrió acá).

## Documentos previos en la raíz del repo

- `REPORTE-AUDITORIA-UX.md` — auditoría UX del lado usuario, **16 hallazgos (R01–R16)**,
  todos resueltos.
- `REPORTE-AUDITORIA-UX-COMERCIO.md` — auditoría del lado comercio, hallazgos **C01–C15**.
- `README.md` y `CLAUDE.md` — orientación general del repo.
