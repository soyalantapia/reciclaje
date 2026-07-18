# 10 · Estado actual y pendientes

**Fecha de corte:** 2026-07-18 · **Commit:** `40dbc00` · **Estado:** MVP completo,
desplegado y funcional end-to-end. Producto **pre-lanzamiento** (sin clientes reales).

---

## ✅ Qué está hecho y verificado

### App de usuario (B2C)
- Login demo, Home hub, **escaneo real por cámara** (@zxing), deep-link `?p=<pointId>`.
- Mapa esquemático + lista, marketplace con filtros y **canje → cupón QR**, ranking con
  scopes y premio, causas + detalle + donación, marcas con Huella Verde, proyecto de
  impacto con la viz `ImpactProgress`, trazabilidad de 7 etapas, perfil completo
  (Premium, cupones, transferir XP, tema, logout).
- **16/16 hallazgos** de la auditoría UX (R01–R16) resueltos.

### Comercio (B2B)
- **Landing de alta conversión** `/comercio/sumate` con header de pestañas + scroll-spy
  + menú mobile, 13 secciones, copy PAS+Hormozi.
- **Login OTP** con cuenta de prueba visible.
- **Auto-onboarding** de 3 pasos que crea comercio + punto y entra al panel.
- **Panel** con 6 secciones: Resumen (KPIs + placa SVG), Beneficios, Campañas,
  Puntos/QR (descargar + imprimir), Reportes (CSV + PDF), Plan.

### Transversal
- **Responsive completo**: sidebar en tablet/desktop para ambas apps, grids por página,
  anchos de lectura. Verificado a 375 / 768 / 1280 en light y dark.
- Dark mode, PWA, MSW, deploy automatizado a GitHub Pages.
- `build` + `lint` (0 errores) + `test` (14/14) en verde.

---

## 🔴 Pendientes bloqueantes (antes de mostrar a un cliente real)

| # | Qué | Dónde | Notas |
|---|---|---|---|
| 1 | **Reemplazar datos de contacto** | `CommerceLanding.tsx` → const `CONTACT` | `whatsapp: '5493510000000'` y `email: 'hola@reciclaxp.app'` son placeholders con `// TODO`. Los CTAs de WhatsApp no llevan a ningún lado |
| 2 | **Definir si el panel nuevo muestra datos de muestra** | páginas de `pages/commerce/` + `lib/metrics.ts` | Hoy un comercio recién creado ve métricas derivadas. Alternativa honesta: estado vacío "esperando tus primeros aportes" |

---

## 🟡 Pendientes de calidad (no bloquean, mejoran)

| Qué | Detalle |
|---|---|
| **Lighthouse nunca se corrió** | El presupuesto de performance del método landing-builder (LCP <2.5s, CLS <0.1, JS <100kb gz) **no fue medido**. Hay MCP de chrome-devtools con `lighthouse_audit` disponible |
| **OG/meta por ruta** | El `index.html` tiene meta global, pero la landing no tiene `og:title`/`og:image` propios. Requiere un head manager (react-helmet o similar) — no está instalado |
| **`Scan.tsx` sin cap de ancho** | Es la única página que en desktop queda a ancho completo. Se dejó así a propósito: tocar el visor de cámara era riesgoso |
| **Sin tests de componentes ni E2E** | Solo 14 tests unitarios de `lib/`. No hay tests de render ni de flujos |
| **Warnings de lint** | 7 warnings benignos: `react-refresh/only-export-components` (archivos que exportan constante + componente, mismo patrón que `button.tsx`) y un `eslint-disable` no usado en `Scan.tsx` |
| **Bundle de `Scan`** | ~482 kB (125 kB gz) por @zxing. Candidato a lazy-load más agresivo si importa el peso |
| **Sin backend real** | Todo es MSW. `api.ts` ya está listo para el swap; ver `build:no-msw` y el comentario de `vite.config.ts` sobre volver a `injectRegister: 'auto'` |

---

## 🚀 Próximos pasos sugeridos (en orden de valor)

1. **Cargar contacto real** y volver a desplegar → la landing pasa a ser usable comercialmente.
2. **Medir Lighthouse** en la landing de producción y cerrar el presupuesto de performance.
3. **OG/meta por ruta** para que la landing comparta bien en WhatsApp (canal principal del ICP).
4. **Prueba de campo**: imprimir el QR de un punto real y recorrer el circuito completo
   (escanear → XP → canje) en un celular de verdad.
5. **Backend real** cuando haya tracción: reemplazar handlers MSW, activar
   `build:no-msw`, revertir la config de PWA a Workbox.
6. **Tests E2E** del circuito crítico (escaneo → canje) y del onboarding B2B.
7. Cuando existan clientes reales: reemplazar la sección aspiracional de marcas por
   **logos y testimonios reales** — respetando la regla de honestidad.

---

## Cosas que NO hay que hacer

- ❌ Poner métricas/testimonios inventados en la UI (ver [09](09-DECISIONES.md)).
- ❌ Reintroducir el `BottomNav` en desktop o romper el mobile con cambios de desktop.
- ❌ Registrar Workbox mientras MSW sea el backend (rompe `/api/*`).
- ❌ Cambiar la forma de un store persistido sin `version` + `migrate`.
- ❌ Trabajar desde `~/Desktop/Programacion/reciclaje` (iCloud rompe esbuild).
