# 07 · Modelo de datos, API y estado

## Tipos del dominio — `src/types/index.ts`

Fuente única de verdad. Están pensados para que **enchufar un backend real sea
reemplazar handlers, no tocar tipos**.

| Tipo | Notas clave |
|---|---|
| `User` | `reputationXp` (mérito, **no se gasta**) vs `spendableXp` (canjeable), `level`, `levelName`, `streakDays`, `isPremium` |
| `Sponsor` | `greenScore` 0-100 (**Huella Verde**), `kgRecovered`, `brandColor`, `category` |
| `RecyclePoint` | `type` (deposito/maquina/totem), `x`/`y` **normalizados 0..100** para el mapa esquemático, `acceptedMaterials`, `openNow` |
| `Contribution` | aporte reciclado: `material`, `units?`/`weightKg?`, `xpEarned`, `status` (validado/pendiente), `lotId?` |
| `Purchase` | compra en la red: `amountArs`, `xpEarned`, `kind: 'compra'` |
| `ActivityItem` | `Contribution \| Purchase` — **discriminar con `'material' in item`** |
| `ImpactProject` | proyecto de impacto con `goalUnits`/`collectedUnits`, `milestones`, `topContributors`, `illustration` ('bench'\|'totem') |
| `TraceEvent` | una de 7 `TraceStage`: aporte → validacion → lote → retiro → clasificacion → transformacion → producto |
| `Benefit` / `Coupon` | beneficio canjeable (`costXp`, `premiumCostXp?`) y su cupón con `qrPayload` |
| `Cause` / `CauseNeed` | institución beneficiaria + necesidades con `costPoints`/`fundedPoints` |
| `RankingResult` | `entries` + `prize` (MonthlyPrize) |
| `SponsorMetrics` | métricas del panel B2B (ver más abajo) |
| `Campaign` | `kind`: premio \| multiplicador \| desafio |

Constantes exportadas:
```ts
XP_PER_UNIT = { tapitas: 2, plastico: 3, vidrio: 1, papel: 1, aluminio: 4 }
XP_PER_PESO = 1 / 50   // 1 XP cada $50 de compra
```

## API — `src/services/api.ts`

Cliente tipado. Exporta `api` y la clase **`ApiError`**. Métodos:

```
getMe()                     getSponsors()          getSponsorMetrics(id)
getPoints()                 getProjects()          getProject(id)
getProjectTrace(id)         getBenefits(filtro?)   redeemBenefit(id)
getContributions()          scan(payload)          getRanking(scope)
getCauses()                 getCause(id)           purchase(payload)
```

## Endpoints mock — `src/services/mocks/handlers.ts`

```
GET  /me
GET  /sponsors            GET  /sponsors/:id/metrics
GET  /points
GET  /projects            GET  /projects/:id      GET  /projects/:id/trace
GET  /benefits            POST /benefits/:id/redeem
GET  /contributions       POST /contributions
GET  /ranking
GET  /causes              GET  /causes/:id
POST /purchases
```

- El seed vive en **`src/services/mocks/data.ts`** (usuarios, sponsors, puntos,
  proyectos, beneficios, causas, ranking).
- **No hay endpoint de login**: el login es simulado en cliente (`api.getMe()` + el
  store de sesión).
- `browser.ts` arranca el worker; `main.tsx` **espera a MSW antes de montar React**.

### Métricas del sponsor
`buildMetrics` en handlers usa `seeded ?? metricsFor(sponsor, points)` — o sea, si el
sponsor no tiene métricas sembradas, las **deriva** con `src/lib/metrics.ts`. Misma
función que usan las páginas del panel, así no hay dos fórmulas. Ver
[06-COMERCIO-B2B.md](06-COMERCIO-B2B.md).

## Stores zustand — `src/store/` (todos con `persist`)

| Store | Key en localStorage | Qué guarda |
|---|---|---|
| `session` | `reciclaxp-session` | `user`, **`commerce`** (Sponsor logueado en el panel), `setSession`, `logout`, `loginAsCommerce`, `logoutCommerce`, `setPremium` |
| `wallet` | `reciclaxp-wallet` | `reputationXp`, `spendableXp`, `streakDays`, `spend()`, `hydrateFromUser()`, `reset()` |
| `activity` | `reciclaxp-activity` | `sessionContributions` (aportes/compras de la sesión) |
| `coupons` | `reciclaxp-coupons` | cupones canjeados ("Mis cupones" en Perfil) |
| `causes` | `reciclaxp-causes` | aportes del usuario a causas |
| `ui` | `reciclaxp-ui` | `theme` + `toggleTheme` |
| `commerceBenefits` | `reciclaxp-commerce-benefits` | `created[]` + `pausedIds[]` del comercio |
| `commerceCampaigns` | `reciclaxp-commerce-campaigns` | campañas del comercio |
| `createdCommerce` | `reciclaxp-created-commerce` | comercio + punto + plan creados en el onboarding |

⚠️ Si cambiás la forma de un store persistido, subí la `version` y agregá `migrate`,
o los usuarios con datos viejos van a romper.

Otra key relevante (no es store): **`sessionStorage['reciclaxp-scan-point']`** — el
punto pendiente del deep-link por QR.

## Helpers — `src/lib/`

- **`utils.ts`** — `cn`, `sleep`, `formatNumber`, `formatXp`, `formatDate`, `timeAgo`,
  `pct`, `MATERIAL_EMOJI` / `MATERIAL_LABEL` / `MATERIAL_UNIT`, `shortCode`,
  `pointDeepLink`, `parsePointFromQr`, `buildPlaceholderQrSvg`, `qrDataUri`,
  **`downloadBlob`**, **`objectsToCsv`** (estos dos los usa la exportación de reportes).
- **`metrics.ts`** — `metricsFor(sponsor, points)`.
- **`qr.ts`** — `qrPngDataUrl`, `downloadQrPng`, `printQr`.
- **`copy.ts`** — textos/utilidades de copy (tiene tests).

## Tests

`src/lib/utils.test.ts` y `src/lib/copy.test.ts` → **2 archivos, 14 tests**, con vitest +
jsdom. No hay tests de componentes ni E2E todavía (ver [10](10-ESTADO-Y-PENDIENTES.md)).
