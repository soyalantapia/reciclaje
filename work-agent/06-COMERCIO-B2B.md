# 06 · Comercio (B2B)

Tres superficies: **landing** (captar) → **onboarding/login** (convertir) → **panel** (retener).

---

## 1. Landing — `/comercio/sumate`

Archivo: `src/pages/commerce/CommerceLanding.tsx` + `src/components/landing/LandingHeader.tsx`
Rediseñada en el commit `40dbc00` siguiendo el método *landing-builder*
(research → estrategia → copy → diseño → ship).

### Estrategia (lockeada)
- **Promesa (una sola):** tus clientes reciclan, ganan beneficios y **vuelven a tu local**.
- **Proof honesto:** capacidades reales del producto (panel, QR, reportes, Huella Verde),
  el mecanismo de impacto trazable, y el estado **fundador**. Sin métricas inventadas.
- **Offer doble:** `Registrá tu comercio` (auto-onboarding, lead frío) +
  `Hablar con un asesor` (WhatsApp, lead caliente).
- **Framework de copy:** PAS (Problema · Agitar · Solución) + Hormozi para el headline.

### `LandingHeader` — header sticky con pestañas
- Pestañas ancla: **Producto · Cómo funciona · Impacto · Planes · FAQ**.
- **Scroll-spy** con `IntersectionObserver` (`rootMargin: '-45% 0px -50% 0px'`):
  mantiene un `Set` de secciones visibles y marca la **primera en orden**; si no hay
  ninguna (estás en el hero) **no marca nada**.
- CTA `Registrá tu comercio` + link `Ingresar`, y **menú hamburguesa** en `<lg`.
- Scroll suave: la página agrega/quita `scroll-smooth` en `<html>` con un `useEffect`;
  cada sección ancla lleva `scroll-mt-24` para no quedar tapada por el header.

### Secciones (en orden)
1. **Hero** — badge "Para comercios y marcas", headline con `clamp()`, subhead, 2 CTAs,
   banner **"Por lanzarse · cupos fundadores"**, y un **mockup del panel** a la derecha
   en `lg` (Huella Verde + 4 tiles + gráfico decorativo, **sin números falsos**).
2. **Barra de confianza** — a quién sirve + impacto trazable (no logos de clientes).
3. **Problema** (agitar) — 3 dolores: competís por cada cliente · te piden
   sustentabilidad y no podés probarla · las promos regalan margen.
4. **Solución + Features** `#producto` — narrativa + 6 features (tráfico, RSE verificable,
   Huella Verde + placa, datos en vivo, beneficios/campañas, QR por punto).
5. **Cómo funciona** `#como-funciona` — 3 pasos.
6. **Impacto** `#impacto` — tapitas → hospitales, trazable ("tu RSE deja de ser un PDF lindo").
7. **Soluciones por rubro** — 6 verticales + chips de "Marcas que queremos sumar".
8. **Planes** `#planes` — 3 tiers, **Pro marcado "Más elegido"** y elevado.
9. **Por qué ahora** — cupos fundadores en Córdoba (escasez real, sin countdown falso).
10. **FAQ** `#faq` — 6 objeciones (instalación, datos, destino del material, espacio,
    cobro/cambio de plan, tiempo de arranque).
11. **CTA final** + **Footer** (WhatsApp, email, Córdoba, link a la app).

### ⚠️ Datos de contacto = PLACEHOLDER
```ts
const CONTACT = {
  whatsapp: '5493510000000',   // TODO: reemplazar por el real
  email: 'hola@reciclaxp.app', // TODO: reemplazar por el real
}
```
Están arriba del archivo. **Hay que cambiarlos antes de hacer publicidad.**

### Animación
Componente local `Reveal` = `motion.div` con `whileInView` + `viewport={{ once: true }}`
+ fade-up de 16px. Si `useReducedMotion()` es true, renderiza un `div` plano.

---

## 2. Login del comercio — `/comercio/login`

`CommerceLogin.tsx`. Flujo **OTP en 2 pasos** (email → código de 6 dígitos con `OtpInput`).

- **Cuenta de prueba destacada en pantalla:** `demo@reciclaxp.app` · código **`123456`**
  → entra como **McDonald's**.
- Otros comercios demo (chips): `ypf@`, `river@`, `starbucks@` `reciclaxp.app`.
- `resolveSponsor(email)` matchea el patrón `<slug>@reciclaxp.app` contra los sponsors.
- Es **simulado**: no hay envío de mail real. El código válido es siempre `123456`.

---

## 3. Auto-onboarding — `/comercio/onboarding`

`CommerceOnboarding.tsx`. Wizard de **3 pasos** con `Progress`:

1. **Tu comercio** — nombre, email, ciudad, rubro (chips → `SponsorCategory`).
2. **Tu primer punto** — nombre, dirección, tipo (depósito / máquina / tótem).
3. **Tu plan** — Básico / Pro / Enterprise.

Al finalizar (`finish()`):
- Crea un `Sponsor` (`id: s_new_<code>`, `greenScore: 70`, `kgRecovered: 1200`) y un
  `RecyclePoint` (`id: p_new_<code>`).
- `useCreatedCommerceStore.set(sponsor, point, plan)` + `loginAsCommerce(sponsor)`.
- Navega a `/comercio` → **el panel ya muestra datos de muestra** (ver más abajo).

---

## 4. Panel del comercio — `/comercio` (guard `RequireCommerce`)

| Sección | Archivo | Contenido |
|---|---|---|
| Resumen | `CommerceResumen.tsx` | Huella Verde + **descarga de placa SVG**, 6 KPIs (`StatCard`), gráfico de aportes por mes y por punto, CTA a reportes |
| Beneficios | `CommerceBenefits.tsx` | Lista + **crear** beneficio (modal), pausar/activar, eliminar los propios |
| Campañas | `CommerceCampaigns.tsx` | Premio del mes / multiplicador XP / desafío. Crear, pausar, eliminar |
| Puntos / QR | `CommercePoints.tsx` | Un card por punto con su **QR**, botones **Descargar** e **Imprimir** |
| Reportes | `CommerceReports.tsx` | Preview de métricas + **exportar CSV** + **imprimir/PDF** (ventana con HTML) |
| Plan | `CommercePlan.tsx` | Plan activo, próximo cobro, comparación de tiers, cambio de plan (demo) |

### Cómo se generan las métricas (importante)
Un comercio creado en el onboarding **no existe en el seed de MSW**, así que pedirle
métricas al backend mock daba 404. Solución: **`src/lib/metrics.ts`**

```ts
metricsFor(sponsor, points): SponsorMetrics
```
Deriva todo determinísticamente de `sponsor.kgRecovered`:
`contributions = kg*4.6` · `activeUsers = kg*0.9` · `xpEmitted = contributions*68` ·
`benefitsRedeemed = contributions*0.034` · `capsRecovered = kg*238` + serie de 5 meses
+ desglose por punto.

- Lo usan **las páginas del panel** (cliente) y también `handlers.ts` como fallback
  (`seeded ?? metricsFor(...)`), así no se duplica la lógica.
- Las páginas mergean el punto creado en el onboarding:
  `createdCommerce?.id === commerce.id ? [...points, createdPoint] : points`.

> ⚠️ Esos números son **datos de muestra** para que el panel de un comercio recién
> creado no se vea vacío. Fue una decisión explícita del dueño del proyecto. Si algún
> día se quiere un estado vacío honesto ("esperando tus primeros aportes"), es un cambio
> chico en las páginas del panel.
