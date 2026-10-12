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

### 15. Octubre 2026 — plan de producto y escenario club (rama `tarea/T1-T3-demo-caso-club`)
Preparación de la reunión con un club por el piloto de 90 días. El plan sale de los grupos de
WhatsApp del proyecto y de la reunión del 03/08 (acta en `docs/producto/reuniones/`).
- `171cfae` **docs(producto)**: lista de lo prometido contra lo que existe
  (`docs/producto/prometido-vs-demo.md`).
- `cd2e597` **feat(demo)**: escenario club (`npm run dev:club`): Punto R, banco de suplentes de la
  hinchada, ranking de la hinchada, recompensas del club; claves de almacenamiento propias.
- `ec4b17e` **fix(demo)**: aviso «Demo · los números son de ejemplo» en todas las pantallas;
  multiplicador de XP como «próximamente»; reporte sin «auditoría»; Premium sin cobro rotulado.
- `cbf983b` **fix**: las fechas sin hora ya no se muestran un día antes.
- `a30358c` **build**: `deploy:club` publica el escenario club en otro repo (`reciclaje-club`).
- `7676a8f` **docs(producto)**: desglose técnico del piloto por entregable
  (`docs/producto/desglose-piloto.md`).

### 16. Octubre 2026 — publicación en Railway (proyecto «reciclaXP»)
- PR #3 (`baa0e52`): `server.mjs` + `server/estatico.mjs` sirven las dos apps desde un solo servicio
  (general en `/`, club en `/club/`), con `build:railway` y `railway.json`.
- Primer deploy (10/10): `railway up` no aplicó el `railway.json`, corrió `npm run build` y `/club/` dio
  502 con el chequeo de salud en verde. Se cargó la configuración en el servicio y se republicó.
- Rama `fix/railway-arranque-verifica-builds`: el servidor no arranca si falta el `index.html` de una de
  las dos apps, y una app sin build responde 503 en vez de cortar la conexión.
- `reciclaxp.xnod.tech` activo (10/10): registros CNAME y TXT en Cloudflare, certificado de Let's Encrypt.
- Rama `fix/landing-sin-promesas-del-piloto`: la landing de comercios deja de afirmar «RSE verificable»,
  «en vivo», «tiempo real», «auditoría» y el multiplicador; un candado de render lo vigila.
- Rama `ci/railway-publica-desde-main`: cada push a `main` corre tipos, pruebas y build en GitHub Actions
  y, si pasa, publica en Railway con un token del proyecto (secreto `RAILWAY_TOKEN`).
- Rama `fix/aporte-suma-al-proyecto`: un aporte registrado en la demo ahora mueve el proyecto (total, «tu
  aporte» y la fila de la persona entre los que más aportan). Antes la pantalla de éxito decía que sumaba y
  el proyecto seguía igual; se notó recorriendo en celular el link que se le mandó al socio de ventas.
- Rama `fix/ranking-suma-xp-de-la-sesion`: la gemela del anterior. El XP ganado ahora sube la fila «vos»
  del ranking del mes (el global cuenta todo; cada sede, sólo lo ganado ahí) y reordena las posiciones.
  Las pestañas declaran su sede (`pestanasDelRanking`) y una prueba verifica, en los dos escenarios,
  que cada una tenga su ranking y que su sede exista.
- Rama `fix/demo-club-panel-y-traza`: repaso del panel del club antes del martes.
  - En el gráfico por mes, los meses terminan en el actual (en octubre mostraba Ene…May).
  - Los aportes por punto suman el total (antes daban 766 contra 828).
  - La trazabilidad muestra el aporte recién registrado y no promete «hitos verificables».
  - Ninguna pantalla dice «Reportes RSE» (lo vigila `src/pages/promesas.test.ts`).
- Rama `fix/demo-club-sin-precios`, decidido el 10/10:
  - La demo del club no muestra precios de lista: el panel no tiene «Plan» y la landing y el alta dicen «A convenir».
  - La demo general sigue igual.
  - El menú del panel y su etiqueta salen de un solo lugar para escritorio y celular, y en escritorio ya dice «Panel de la institución».
- Rama `fix/beneficios-del-panel-llegan-al-hincha`, en el mismo navegador:
  - un beneficio publicado en el panel aparece en la app del hincha y se puede canjear (antes el simulador respondía «Beneficio no encontrado»);
  - uno pausado deja de verse.
- Rama `fix/talleres-en-vez-de-river` (pedido de Alan, 10/10):
  - las dos demos dicen Talleres;
  - la demo general ya no tiene a River: el sponsor, el punto, el proyecto, los beneficios, el ranking, el premio y las métricas, también en los ids;
  - lo guardado en el navegador con los nombres viejos se descarta al cargar (`src/store/versionDeDatos.ts`).
- Rama `fix/demo-club-detalles`, después de recorrer las dos demos pantalla por pantalla en el celular y en la compu:
  - Campañas, la gemela de los beneficios: el panel muestra el premio que la hinchada ya ve, y lo que lanza o pausa (premio del mes y desafíos) aparece en el ranking de la hinchada (`src/lib/campanasDeLaRed.ts`).
  - El «Top 12% de la red» estaba escrito fijo para todos; ahora se calcula el puesto real por Huella Verde (`src/lib/posicionEnLaRed.ts`).
  - El panel de una institución ya no habla de «comercio», «clientes», «vidriera» ni «local», tampoco en el login ni en el perfil (`src/lib/vocabulario.ts`).
  - La demo del club pasa en Córdoba: los puntos de la red y el historial del hincha, con fechas de septiembre. Se va el municipio de Vicente López.
  - 13 grillas sin columnas de base en el celular: tres se desbordaban (el mapa, y Beneficios y Campañas del panel). El candado es `src/lib/grillas.test.ts`.
  - Textos: se van «recicladores certificados» y «subí posiciones por sede».
- Rama `fix/panel-ve-lo-de-la-sesion`, la cuarta gemela: el hincha aportaba y veía el banco en 42.890, pero el panel del club, en el mismo navegador, seguía en 42.840. Ahora el resumen y el reporte del panel suman lo que la comunidad hizo en la sesión (`metricasConLaSesion` en `src/lib/aportesDeLaSesion.ts`):
  - aportes, tapitas, kilos y la cuenta por punto y por mes;
  - el XP de aportes y compras;
  - los canjes de sus beneficios.
- En la demo del club, el login y la pantalla de escanear del hincha ya no dicen «¿Sos comercio?».
- Rama `fix/demo-club-sin-marcas-reales`:
  - en la demo del club, las marcas reales de la demo general (YPF, Coca-Cola, McDonald's, Starbucks, Adidas, Grido) pasan a nombres de ejemplo: Norte Energía, Bebidas Serranas, Burger Plaza, Café Andino, Deportiva Centro y Helados del Parque. Antes aparecían en «Marcas de la red» como si fueran aliadas;
  - los ids no cambian;
  - la demo general sigue igual;
  - el inicio ya no nombra marcas.
- Rama `fix/talleres-igual-en-las-dos-demos`: la demo general, la de la dirección corta, tenía otro Talleres, con «Máquinas del estadio», «Validación automática · Sensor IoT» y el banco al 62 % (312.400 de 500.000).
  - Ahora las dos demos usan el mismo caso: `casoDelClub` y `conElCasoDelClub` en `src/services/mocks/escenarioClub.ts`.
  - Se sacaron de `data.ts` los bloques del Talleres viejo.
- Rama `fix/csv-del-reporte-con-aviso`: el CSV del reporte arranca diciendo que son datos de ejemplo, como el PDF, y lleva la marca BOM para que Excel lea bien los acentos (`src/lib/reporte.ts`).
- Rama `feat/dia-de-cancha`: el rediseño de los cuatro momentos (inicio, proyecto, festejo del aporte y panel del club) con la dirección «Día de cancha» (Alan aprobó la dirección; las capturas finales esperan su OK antes de mergear).
  - El banco de suplentes se dibuja con tapitas que se llenan con el avance real; las de la persona van en ámbar.
  - El festejo hace subir el marcador de 42.840 a 42.890.
  - El panel arranca con «El banco de tu hinchada».
  - Se hizo tarea por tarea con subagentes, cada una con su revisión: 9 tareas y 3 arreglos por revisión.
- Rama `feat/recorrido-de-la-tapita`: la trazabilidad de un banco pasa a ser «El recorrido de tu tapita». Alan aprobó la maqueta («me encanta»).
  - Es una línea de cal sobre césped, con tu tapita en ámbar en la etapa actual.
  - El pesaje que hace el club va destacado como «lo que sigue».
  - Las etapas que faltan dicen «pendiente», sin fechas.
  - El destino es el banco, con el mismo avance que el inicio.
  - Los proyectos que no son banco conservan la lista de hoy.
- Rama `feat/productos-e-informe`: dos entregables del piloto en la demo, aprobados por Alan para la reunión con Talleres. Diseño: `docs/superpowers/specs/2026-10-10-productos-e-informe-design.md`.
  - **E1.3, el club elige qué construye su hinchada.** En el panel, «Productos» (sólo para un club o un estadio) publica un producto con:
    - forma: banco, butacas, arco u otro;
    - nombre;
    - meta en kilos, a 238 tapitas por kilo;
    - su Punto R.
  - La hinchada ve ese producto en una pestaña del inicio. Los aportes en su Punto R suman a él, y el festejo, el recorrido y la página del producto lo nombran y dibujan su forma.
  - Hay un producto abierto por punto. Vive en el navegador, como los beneficios, y se sincroniza entre dos pestañas.
  - **E4.2, el informe para la Comisión Directiva** (`/comercio/informe`, desde Reportes). Trae:
    - los números del panel;
    - los productos;
    - «Partido por partido», con su estructura y sin números;
    - los aportes por mes y por punto;
    - los que más aportan;
    - lo que sigue, con las cuatro etapas del piloto.
  - El informe se imprime o se guarda en PDF sin menú ni botones, en claro aunque la app esté en oscuro, y con el aviso de datos de ejemplo arriba y al pie.
  - Las métricas del panel salen de un solo hook, `useMetricasDelPanel`. Sus Punto R incluyen el del alta (`usePuntosDelPanel`).
  - El `localStorage` de Node 25, que no anda en las pruebas, se arregla una vez en `src/test/setup.ts`.
  - Se hizo en seis tareas con subagentes, cada una con su revisión, más una revisión final de la rama.
  - La verificación en el navegador sumó tres cosas: las butacas de tribuna, el arco apoyado sobre su línea y, en el informe, el top con lo de todos los productos.
- Rama `feat/reporte-sustentabilidad`: el informe para la Comisión Directiva suma «Para el Reporte de Sustentabilidad de <institución>». Alan la eligió entre cinco ideas para la reunión con Talleres. Diseño: `docs/superpowers/specs/2026-10-11-reporte-sustentabilidad-design.md`.
  - Talleres publica un Reporte de Sustentabilidad con su Memoria y Balance desde 2023, inspirado en GRI y en la Agenda 2030. La sección le entrega los datos del programa ordenados en tres de sus dimensiones: ambiental, comunitaria e infraestructura.
  - Cada fila lleva la referencia que encaja sin forzar (GRI 306-4, 306-2 y 413-1, ODS 12.5), o «—».
  - Dice «alineado», nunca «certificado» ni «verificado». La nota al pie aclara que el armado y la verificación del reporte son del club.
  - No suma números: salen de las mismas métricas y productos del informe (`src/lib/reporteSustentabilidad.ts`).
  - «Descargar indicadores (CSV)» baja una fila por indicador, con el aviso de datos de ejemplo y la marca BOM. El botón no sale al imprimir.
- Rama `feat/informe-en-reportes-y-marca`: dos pedidos de Alan para la reunión con Talleres. Diseño: `docs/superpowers/specs/2026-10-11-informe-en-reportes-y-marca-del-club-design.md`.
  - **Reportes es el informe del club.** Para una institución, «Reportes» muestra el informe para la Comisión Directiva. Arriba tiene «Descargar PDF», que abre la ventana del navegador para guardarlo, y «Descargar CSV». `/comercio/informe` redirige ahí. Un comercio sigue con el reporte de impacto.
  - **La marca del club, cargada en el panel.** «Marca» es sólo para instituciones.
    - Sube el escudo: PNG, JPG, SVG o WebP, hasta 2 MB. Se achica a 256 px y se guarda en PNG.
    - El color se toma del escudo y se puede cambiar.
    - El panel entero y el informe, también el PDF, usan el escudo y la paleta. También los modales: la paleta va en `<html>` mientras el panel está abierto y se saca al salir.
  - **No se publica.** La marca se guarda sólo en el navegador (`src/store/marcaDelClub.ts`). El escudo y los colores del club no van al repo ni a la dirección publicada, que son públicos.
  - **Cómo funciona:** la paleta `eco-*` pasa por variables (`--eco-*` en `src/index.css`). `src/lib/marca.ts` arma la de la marca con `color-mix` y oscurece un color claro hasta que el texto blanco se lea (4,5:1).
  - **Lo que sumó la revisión final:**
    - «Descargar PDF» trae una línea de ayuda, «elegí Guardar como PDF», que no se imprime.
    - Un escudo del que no sale ningún color deja la paleta de siempre: el verde de ReciclaXP no cuenta como color propio.
    - Lo guardado roto en el navegador ya no tumba el panel.
  - Se hizo en cuatro tareas con subagentes, cada una con su revisión.
- Rama `feat/mapa-de-cordoba-y-pulido`: cinco pedidos de Alan para la app del hincha. Diseño: `docs/superpowers/specs/2026-10-11-mapa-de-cordoba-y-pulido-design.md`.
  - **El césped sin franjas:** `.bg-cancha` pasa a un verde liso con un degradé suave.
  - **Los íconos que se mueven:**
    - En la barra de abajo y en el menú lateral, la pestaña entera se achica al apretar y el ícono rebota en cada toque, también en la pestaña en la que ya estás.
    - Escanear hace un pulso.
    - Con «reducir movimiento», nada se mueve (`IconoQueSeMueve.tsx`).
  - **«Pasate a Premium» sin negro:** pasa a un dorado claro, al tono de la corona.
  - **Todo en Córdoba capital:**
    - Los puntos de las dos demos van donde de verdad hay un local de su rubro en el Centro y Nueva Córdoba, según OpenStreetMap.
    - El Punto R del estadio va en el Kempes, y el de la sede frente a la Plaza San Martín (de fuentes públicas, hay que confirmarlo con el club).
    - `RecyclePoint` pasa de `x`/`y` a `lat`/`lng`.
    - En la demo general, el municipio pasa a «Municipio de ejemplo», y beneficios, historial y Perfil van en Córdoba. Las causas quedan como estaban.
    - `VERSION_DE_LOS_DATOS` sube a 3: los navegadores arrancan la demo de cero una vez, y eso incluye la marca del club cargada.
  - **El mapa de verdad:**
    - Leaflet con teselas de OpenStreetMap; CARTO sin clave pinta «API KEY REQUIRED».
    - Abre en el Centro y Nueva Córdoba.
    - Tiene chips («Abiertos ahora» y por material) y una tarjeta del punto con «Cómo llegar» (Google Maps) y «Reciclar acá» (Escanear con el punto elegido).
    - «Cerca mío» ordena por distancia y la escribe; «Ver todos» encuadra todo.
    - La lista va junto al mapa.
    - Se precarga en un momento libre y el `index.html` abre antes la conexión a las teselas. La lógica es pura, en `src/lib/mapa.ts`.
  - Se hizo en cuatro tareas con subagentes, dos de ellas en paralelo en worktrees aparte, cada una con su revisión.

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
