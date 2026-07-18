# 11 · Historial del trabajo (commit por commit)

14 commits. Orden cronológico real (`git log --reverse`).

---

### 1. `f251862` — chore: scaffold inicial ReciclaXP MVP (PWA + MSW)
Arranque completo: Vite 8 + React 19 + TS + Tailwind 4, modelo de dominio en
`types/index.ts`, seed en `mocks/data.ts`, handlers MSW, `api.ts`, stores zustand,
primitivas UI + tokens, componentes de dominio (incluida la viz `ImpactProgress`),
páginas y routing, assets PWA, tests. Repo GitHub + symlink desde Desktop.

### 2. `2458df7` — feat: fixes de auditoría UX + ecosistema + lector QR real
Tres bloques en uno:
- **Auditoría UX del usuario** → `REPORTE-AUDITORIA-UX.md` con 16 hallazgos (R01–R16),
  **todos corregidos**: `ErrorState` + autorecuperación de MSW, barras del gráfico B2B,
  tokens de dark mode, nav a ranking, racha, "Mis cupones", ranking sticky, animación
  de impacto, etc.
- **Ecosistema de producto** (pedido del dueño): **Causas** (tapitas → hospital),
  **Marcas + Huella Verde**, y **ganar XP comprando**.
- **QR real**: lector por cámara con @zxing, generación con `qrcode`, deep-link
  `?p=<pointId>` y QR real commiteado en `public/`.

### 3. `45978f1` — fix: Links que envolvían cards quedaban inline
Bug reportado con captura: los `<Link>` que envolvían tarjetas renderizaban `<a>` inline,
el `margin-top` se ignoraba, la caja colapsaba a 19px y las cards se superponían.
**Fix:** `className="block"` en esos links.

### 4. `91ee6b7` — feat(comercio): hub B2B "Mi comercio"
Auditoría UX enfocada 100% en comercio (`REPORTE-AUDITORIA-UX-COMERCIO.md`, C01–C15) y
luego el hub completo: sesión de comercio en el store, `CommerceLayout` +
`RequireCommerce`, y las 6 secciones del panel (Resumen, Beneficios, Campañas,
Puntos/QR, Reportes, Plan) + `metricsFor` para todos los sponsors.

### 5. `516e728` — feat(comercio): login OTP + registro (stub)
Login del comercio en 2 pasos con `OtpInput` (6 casillas), cuenta de prueba visible
(`demo@reciclaxp.app` / `123456`) y botón de registro que en ese momento era un stub.

### 6. `63ac594` — feat(comercio): landing B2B + auto-onboarding con datos de muestra
El registro deja de ser stub: **landing de ventas** en `/comercio/sumate` y **wizard de
3 pasos** que crea comercio + punto, loguea y entra al panel. Para que el panel no se
viera vacío se creó `lib/metrics.ts` (métricas client-side derivadas de `kgRecovered`).

### 7. `53675aa` — fix(comercio): landing honesta — sin métricas infladas
🔴 **Corrección del dueño:** *"No mientas por las dudas"*. Se eliminaron
"+24k usuarios", "9 marcas aliadas" y "24 tn recuperadas", reemplazados por
**"Por lanzarse · 100 puntos en Córdoba Capital"**. "Marcas que ya están" →
**"Marcas que queremos sumar"**. Nació la regla de honestidad del proyecto.

### 8. `207f778` — feat(comercio): landing con ojos de cliente
Revisión de la landing **poniéndome en el lugar del comprador B2B**. Cambios:
CTA "Hablar con un asesor" (WhatsApp) en hero/planes/CTA final, **FAQ** que mata
objeciones, banda de **impacto** (tapitas→hospital), footer con contacto y ubicación,
reordenar valores para poner "Clientes que vuelven" primero, y "Por lanzarse" convertido
en **"cupos fundadores"** (urgencia honesta).

### 9. `bb775a5` — feat(responsive): shells con sidebar + primitivas
Arranca el rediseño responsive (ejecutando un prompt experto que el dueño pidió y
devolvió para ejecutar). Primitivas **`<Container>`** y **`<CardGrid>`**;
**`SideNav`** para la app de usuario en `md+` (BottomNav → `md:hidden`) y
**`CommerceSideNav`** para el panel en `lg+`.

### 10. `f3f76a1` — feat(responsive): landing full-width
La landing sale del molde `max-w-md`: hero 2 columnas en `lg`, valores `md:2/lg:4`,
pasos 3-col, planes 3-col, FAQ 2-col, footer multi-columna. `Container` gana la prop
polimórfica `as`.

### 11. `60225fd` — feat(responsive): grids en páginas y dashboards
Home pasa a **dashboard 2/3 + 1/3**; Beneficios/Causas/Marcas a `CardGrid`; Mapa a
**mapa sticky + lista** lado a lado; Ranking centrado; Resumen del comercio con KPIs a
3 columnas y gráficos lado a lado; Beneficios y Puntos del comercio en grid.

### 12. `e4132fd` — feat(responsive): caps de lectura, grid de campañas y auth centrado
Reportes/Plan/Perfil centrados a ancho de lectura, Campañas en grid, y los tres flujos
de auth (login usuario, login comercio, onboarding) centrados verticalmente en `md+`.

### 13. `d91dfa3` — feat(responsive): cap de ancho en páginas de detalle
`CauseDetail`, `ImpactProjectPage`, `Traceability` y `CommerceQr` a `max-w-3xl`.
(`Scan` quedó sin cap a propósito — ver [10](10-ESTADO-Y-PENDIENTES.md).)

### 14. `40dbc00` — feat(landing): rediseño de alta conversión con header de pestañas
Último estado. Ejecución completa del método **landing-builder**:
- **Research real** (Reciclos/Ecoembes, Reaquila, Segrega) → hallazgo: son apps de
  ciudadano/municipio; el hueco es el **ángulo B2B con panel + RSE**.
- **Estrategia**: promesa única, proof honesto, oferta doble.
- **Copy** PAS + Hormozi; headline *"Tus clientes reciclan, ganan beneficios y vuelven a
  tu local."*
- **Build**: `LandingHeader` sticky con pestañas + **scroll-spy** + menú mobile, y 13
  secciones (incluye mockup del panel sin números falsos, problema/solución, verticales,
  "por qué ahora" y FAQ ampliada).

---

## Trabajo hecho que NO quedó en commits

- **Auditorías UX**: la del usuario (16 hallazgos) y la del comercio (C01–C15) —
  sus reportes sí están commiteados en la raíz del repo.
- **Verificación visual** repetida a 375/768/1280 en light y dark con la herramienta de
  preview (screenshots de hero desktop, hero mobile, menú mobile, panel B2B, planes en
  tablet, etc.).
- **Deploys** a GitHub Pages tras cada etapa grande (el deploy publica `dist/` a la rama
  `gh-pages`, no genera commits en `main`).
- **Prompts expertos** redactados a pedido del dueño: uno para el rediseño responsive y
  otro para la landing de conversión. Ambos fueron devueltos por él para ejecutarlos, y
  se ejecutaron completos.
