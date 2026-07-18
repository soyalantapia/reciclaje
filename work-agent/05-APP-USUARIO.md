# 05 · App de usuario (B2C)

Todas estas rutas viven detrás de **`RequireAuth`** y dentro de **`AppLayout`**.
Sesión demo: **`camila@reciclaxp.app`** / **`demo123`** (viene precargada en el form).

## Mapa de pantallas

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/login` | `pages/Login.tsx` | react-hook-form + zod. Credenciales demo precargadas. Al entrar hidrata la wallet desde el usuario |
| `/` | `pages/Home.tsx` | Hub: saludo, `XpWallet`, CTA escanear, proyecto de impacto en vivo, causa destacada, accesos a Marcas y Ranking, actividad reciente |
| `/escanear` | `pages/Scan.tsx` | **Lector QR real por cámara** (@zxing) + carga manual de material/unidades. Muestra el XP ganado y el proyecto al que sumó |
| `/mapa` | `pages/MapPoints.tsx` | Mapa esquemático (pines posicionados por `x`/`y` en %) + lista de puntos (abiertos primero) |
| `/beneficios` | `pages/Marketplace.tsx` | Catálogo de beneficios con filtro por categoría (`Tabs`). Canje → descuenta XP → genera **cupón con QR** |
| `/ranking` | `pages/Ranking.tsx` | Ranking mensual con scopes (Global / River / YPF), premio del mes y "tu posición" siempre visible |
| `/causas` | `pages/Causes.tsx` | Lista de causas (hospital, ONG, escuela, comedor) |
| `/causa/:id` | `pages/CauseDetail.tsx` | Historia de la causa, progreso en kg, **necesidades** y flujo de donación de puntos |
| `/marcas` | `pages/Marcas.tsx` | Sponsors ordenados por **Huella Verde**, con kg recuperados |
| `/proyecto/:id` | `pages/ImpactProjectPage.tsx` | Proyecto de impacto: `ImpactProgress`, hitos, top contribuyentes |
| `/trazabilidad/:projectId` | `pages/Traceability.tsx` | Línea de tiempo de las 7 etapas del material |
| `/qr-comercios` | `pages/CommerceQr.tsx` | **Utilidad de demo:** QR de los comercios para escanear y probar el circuito |
| `/perfil` | `pages/Profile.tsx` | Perfil, stats, Premium, **Mis cupones**, transferir XP, acceso al panel del comercio, **toggle de tema**, cerrar sesión |
| `*` | `pages/NotFound.tsx` | 404 |

## Flujos clave

### 1. Escaneo (el circuito central)
```
/escanear → cámara lee QR → payload = deep-link del punto
   → elegís material + unidades → api.scan()
   → XP sumados (reputationXp + spendableXp) → toast + proyecto impactado
   → queda en "actividad reciente" del Home
```

### 2. Deep-link por QR (IMPORTANTE — no romper)
Los QR de los comercios apuntan a la app con `?p=<pointId>`:
```
https://soyalantapia.github.io/reciclaje/?p=p_mcdonalds_palermo
```
- `pointDeepLink(pointId)` (en `lib/utils.ts`) genera esa URL.
- Al bootear, el punto se guarda en `sessionStorage` con la key
  **`reciclaxp-scan-point`**.
- `AppLayout` tiene un `useEffect` que, si esa key existe, **redirige a `/escanear`**.
- `parsePointFromQr()` interpreta lo leído por la cámara.

Hay un QR real commiteado en `public/qr-mcdonalds-palermo.png` para probar el circuito.

### 3. Canje de beneficio
`Marketplace` → confirmar → `spend(cost)` en `store/wallet` → `api.redeemBenefit()` →
se guarda en `store/coupons` → modal con **QrCoupon**. Si la API falla después de
descontar, **se devuelven los XP** (compensación explícita en el código).

### 4. Ganar XP comprando
`BuyFlow` (componente) → `api.purchase()` → XP según `XP_PER_PESO` (1 XP cada $50).
Aparece en la actividad como "Compra · <marca>".

## Premium
`Profile` permite pasar a Premium (demo, sin pago). Efecto real en la app: los beneficios
con `premiumCostXp` salen **más barato**. Perks listados: mejores canjes, transferir XP,
acceso anticipado, reportes personales.
