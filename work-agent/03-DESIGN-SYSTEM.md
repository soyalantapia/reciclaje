# 03 · Design System

Todo vive en **`src/index.css`** usando la sintaxis de Tailwind 4 (`@theme inline`).
No hay `tailwind.config.js`.

## Paletas de marca

```css
--color-eco-*   /* VERDE = primario. 50 #ecfdf5 … 500 #10b981 · 600 #059669 (marca)
                   · 700 #047857 · 800 #065f46 · 900 #064e3b · 950 #022c22 */
--color-xp-*    /* ÁMBAR = recompensas/XP. 400 #fbbf24 · 500 #f59e0b · 600 #d97706 */
--color-ink-*   /* Neutrales con tinte frío. 50 #f6f8f7 … 900 #131917 */

--color-success #16a34a · --color-warning #f59e0b
--color-danger  #e11d48 · --color-info    #0ea5e9
```

**Uso semántico:** `eco-600` = acción primaria/marca. `xp-500` = todo lo que sea XP,
premios o el CTA principal sobre fondo verde. `danger` = errores y "eliminar".

## Tokens semánticos (light/dark)

Definidos como CSS vars en `:root` y `.dark`, expuestos vía `@theme inline`:

| Token | Light | Dark |
|---|---|---|
| `background` | `#f3faf6` | `#0a1512` |
| `foreground` | `#0c1f1a` | `#e7f3ed` |
| `card` | `#ffffff` | `#11201b` |
| `muted` | `#e8f1ec` | `#16271f` |
| `muted-foreground` | `#5b6b66` | `#9bb0a6` |
| `border` / `input` | `#dde7e1` | `#1f342b` |
| `ring` | `#10b981` | `#34d399` |

**Regla:** usá siempre los tokens semánticos (`bg-card`, `text-muted-foreground`,
`border-border`) — nunca colores hardcodeados. Así el dark mode sale gratis.

**Dark mode:** por clase `.dark` en `<html>` (`@custom-variant dark (&:is(.dark *))`).
Se controla desde `store/ui.ts` (`theme`, `toggleTheme`) + `hooks/useThemeEffect.ts`.
Toggle visible en **Perfil**.

## Tipografía y forma

- Fuente: **Plus Jakarta Sans** (`--font-sans` y `--font-display`).
- Radio base: `--radius: 0.9rem` → escala `radius-sm/md/lg/xl/2xl`.
- Títulos grandes usan `clamp()` para escalar fluido, p.ej.:
  `[font-size:clamp(1.6rem,3vw,2.5rem)]`.

## Utilidades propias (`@layer utilities` / `base`)

| Clase | Qué hace |
|---|---|
| `.bg-eco-grid` | Patrón de puntos radial verde (fondos de hero/secciones) |
| `.no-scrollbar` | Oculta la barra de scroll (usado en navs horizontales) |
| `.pt-safe` / `.pb-safe` | Respeta el safe-area del notch en PWA |

## Primitivas UI (`src/components/ui/`)

### `<Button>` — cva
- `variant`: `primary` (eco-600) · `xp` (ámbar, CTA sobre verde) · `secondary` (card+borde)
  · `outline` · `ghost` · `danger` · `link`
- `size`: `sm` (h-9) · `md` (h-11) · `lg` (h-14) · `icon`
- `block`: ancho completo
- Ya trae `focus-visible:ring-2 ring-ring` y `active:scale-[0.98]`.

### `<Container>` — cva + polimórfico
Reemplaza los `mx-auto max-w-*` dispersos. Props: `size` y `as`.
- `size="prose"` → `max-w-md` (formularios, onboarding)
- `size="app"` → `max-w-5xl` (contenido estándar) — **default**
- `size="wide"` → `max-w-7xl` (marketing y dashboards)
- Padding incluido: `px-4 sm:px-6 lg:px-8`
- `as="section" | "header" | ...` para HTML semántico

⚠️ **No lo uses dentro de un contenedor que ya tiene padding horizontal** o vas a
duplicar el padding (por eso `AppLayout` maneja su padding a mano, no con Container).

### `<CardGrid>` — cva
Grid responsive para listas de tarjetas. `cols`: `2` · `3` (default, 1→2→3) · `4` ·
`stats` · `auto` (auto-fill minmax 15rem). Gap `gap-3 md:gap-4`.

### Otras
`Card`, `Badge` (variants eco/xp/success/warning/neutral), `Input`, `Label`, `Modal`,
`Progress`, `Skeleton`, `Tabs` (genérico tipado `TabItem<T>`), `Avatar`,
`OtpInput` (6 casillas, avance/backspace/paste automáticos).

## Componentes de dominio destacados (`src/components/features/`)

- **`ImpactProgress`** — la viz estrella: ilustración del proyecto (banco/tótem) que
  pasa de gris a color según el % de avance, con animación.
- **`HuellaVerde`** — muestra el score 0-100 con etiqueta cualitativa; tiene modo `compact`.
- **`TraceabilityTimeline`** — línea de tiempo de las 7 etapas de trazabilidad.
- **`XpWallet`** — tarjeta de nivel + XP reputación vs canjeable + progreso al siguiente nivel.
- **`QrScanner`** — cámara real con @zxing. **`QrImage`/`QrCoupon`** — generación de QR.
- **`StatCard`** — KPI del panel B2B, con `tooltip` y `delta` (↑/↓ %).

## Convenciones de estilo

1. **Mobile-first siempre.** Clases base = mobile; agregás `md:` / `lg:` encima.
2. `cn()` de `@/lib/utils` para combinar clases (clsx + tailwind-merge).
3. Componentes con variantes → **cva**, siguiendo el patrón de `button.tsx`.
4. Animaciones: framer-motion, sutiles y de un solo sentido
   (`whileInView` + `viewport={{ once: true }}`), respetando `useReducedMotion()`.
5. Íconos: lucide-react, tamaño 14–22 según contexto.
