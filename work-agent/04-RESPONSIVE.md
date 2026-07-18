# 04 · Sistema Responsive

Implementado en los commits `bb775a5` → `d91dfa3`. La app es **mobile-first** y la
experiencia mobile es la primaria (es una PWA). Tablet y desktop **agregan** capas.

## Breakpoints (Tailwind por defecto, sin screens custom)

`sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`

## Regla de oro

> Las clases base son mobile. Todo lo de tablet/desktop se agrega con `md:` / `lg:` / `xl:`.
> **Ningún cambio puede alterar lo que ve el celular.**

## Los dos "shells" (lo más importante)

### App de usuario — `AppLayout.tsx`
```
< md  (mobile)        │  ≥ md (tablet + desktop)
──────────────────────┼───────────────────────────────
Header sticky         │  Header oculto (md:hidden)
(logo, racha, XP,     │
 ranking)             │
Contenido 1 columna   │  SideNav FIJA a la izquierda (w-60, sticky, h-dvh)
BottomNav fija        │  BottomNav oculto (md:hidden)
(5 tabs + FAB)        │  Contenido: mx-auto max-w-5xl, px-8
```
- `SideNav.tsx` (md+): marca, bloque **XP canjeable** + **racha**, y 8 ítems —
  Inicio · Escanear · Mapa · Beneficios · Ranking · Causas · Marcas · Perfil.
- `BottomNav.tsx` (<md): 5 tabs con **FAB central de Escanear**. Lleva `md:hidden`.

### Hub de comercio — `CommerceLayout.tsx`
```
< lg  (mobile+tablet) │  ≥ lg (desktop)
──────────────────────┼───────────────────────────────
Header con marca +    │  Header oculto (lg:hidden)
"Salir" + pill-nav    │  CommerceSideNav FIJA (w-64) con marca, 6 ítems y "Salir"
horizontal scrollable │
Contenido max-w-6xl   │  Contenido max-w-6xl, px-8
```
- `CommerceSideNav.tsx` exporta también **`COMMERCE_NAV`** (fuente única de los 6 ítems),
  que `CommerceLayout` importa para su pill-nav. **No dupliques ese array.**

> Nota: el usuario tiene sidebar desde **md**, el comercio desde **lg** (su contenido es
> más denso y la pill-nav funciona bien en tablet).

## Patrones aplicados por página

| Página | Patrón responsive |
|---|---|
| `Home` | Dashboard **2/3 + 1/3** en `lg` (principal: XpWallet+escanear+impacto · lateral: causa, marcas, ranking). Actividad reciente en 2 columnas |
| `Marketplace`, `Causes`, `Marcas` | `<CardGrid cols={3}>` → 1 → 2 → 3 columnas |
| `MapPoints` | `lg:grid-cols-5`: **mapa sticky** (3 col) + **lista** (2 col) lado a lado |
| `Ranking` | Centrado a `max-w-2xl` (una lista muy ancha se lee mal) |
| `Profile`, `CommercePlan` | Centrado a `max-w-2xl` |
| `CauseDetail`, `ImpactProjectPage`, `Traceability`, `CommerceQr`, `CommerceReports` | Centrado a `max-w-3xl` (ancho de lectura) |
| `CommerceResumen` | KPIs `grid-cols-2 lg:grid-cols-3` + los 2 gráficos lado a lado en `lg` |
| `CommerceBenefits`, `CommerceCampaigns` | `sm:grid-cols-2 xl:grid-cols-3` |
| `CommercePoints` | `sm:grid-cols-2 lg:grid-cols-3` (tarjetas con QR) |
| `Login`, `CommerceLogin`, `CommerceOnboarding` | Card `max-w-md` centrada + `md:justify-center` (centrado vertical en desktop) |
| `CommerceLanding` | Full-width, ver [06-COMERCIO-B2B.md](06-COMERCIO-B2B.md) |

## Cómo decidir para una página nueva

- ¿Lista de tarjetas? → `<CardGrid>`.
- ¿Texto/formulario/detalle? → centrar a `max-w-2xl` o `max-w-3xl` (ancho de lectura).
- ¿Dashboard? → grid de KPIs + gráficos en 2 columnas en `lg`.
- ¿Marketing? → `<Container size="wide">` y secciones full-bleed.

## Cómo verificar

Anchos obligatorios: **375** (mobile) · **768** (tablet) · **1280** (desktop),
en **light y dark**. Chequear que no haya scroll horizontal ni solapamientos.

⚠️ **Gotcha de la herramienta de preview:** después de un `window.scrollTo(...)` la
captura suele desincronizarse y salir en negro. **Workaround:** cambiar el viewport
(ej. de 1280 a 1281) justo antes del screenshot — eso fuerza el re-sync. Verificar por
DOM (`preview_eval`) es siempre más confiable que la captura.
