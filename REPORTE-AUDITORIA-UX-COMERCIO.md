# 🕵️ Auditoría UX — "En la piel del COMERCIO" (B2B)
### ReciclaXP · v1.0 · 2026-05-28

**Plataforma:** ReciclaXP — lado **comercio / sponsor (B2B)**: panel de impacto, QR del punto, Huella Verde.
**Método:** navegación real en `http://localhost:5183` (y deploy https://soyalantapia.github.io/reciclaje/), viewport mobile + inspección de elementos accionables.
**Stack:** Vite + React 19 + TS + Tailwind 4 · datos mock (MSW).
**Idioma del producto:** español rioplatense.
**Foco:** 100% el comercio. NO se audita el lado usuario/reciclador (eso está en `REPORTE-AUDITORIA-UX.md`).
**Perfil del usuario auditado:** Martín, encargado de marketing/RSE de un comercio adherido (estación, local de marca o comercio de barrio). **Paga un fee** por estar en la red y entra a: ver su impacto, justificar la inversión, sacar el QR para el local y comunicar su "huella verde". Práctico, mira ROI, sin tiempo.

> Alcance: auditoría de **experiencia B2B**, no seguridad. **No se corrigió nada**: detectar y reportar.

---

## 1. Resumen ejecutivo

### Las 5 fricciones que más sangran (lado comercio)
1. **[C01] El comercio no tiene puerta de entrada ni identidad propia.** No hay login ni rol de comercio: el panel vive **escondido dentro del Perfil de un usuario reciclador** ("Panel para empresas"). Un dueño de comercio que paga el fee no tiene forma de "entrar como comercio", ni alta, ni onboarding. El lado que **financia el ecosistema** no tiene front door.
2. **[C02] El panel es 100% de solo-lectura: el comercio no puede *hacer* nada.** Lo único accionable en `/empresas` es volver y alternar entre dos sponsors. No puede crear beneficios, campañas, premios del mes, ni administrar sus puntos. Toda la promesa B2B de "activá tu comunidad" queda en mirar números.
3. **[C03] Promete "Reportes exportables para RSE y auditoría"… pero no hay botón de exportar.** El comercio entra justamente a *llevarse* algo para presentar (un PDF, un CSV, una placa) y se va con las manos vacías. Promesa incumplida en el lugar más sensible (justificar la plata).
4. **[C04] El QR del comercio no se puede descargar ni imprimir.** En `/qr-comercios` se ve el QR y el link, pero no hay "Descargar PNG" ni "Imprimir". El comercio necesita el QR para **pegarlo en el local**, y hoy tiene que sacar screenshot. (Arreglo de minutos.)
5. **[C07/C12] No existe un "hogar del comercio".** El panel (`/empresas`) y el QR (`/qr-comercios`) están **desconectados** entre sí, y el QR se alcanza desde la pantalla de *escaneo del usuario*. No hay un hub que junte impacto + QR + beneficios + campañas + plan.

### Sensación general
Para el **usuario reciclador**, la app está cuidada. Para el **comercio**, hoy es **una vidriera de números, no una herramienta de trabajo**. Se siente como un *preview de ventas* ("mirá lo lindo que se vería tu impacto") más que como el panel donde el comercio gestiona su participación. Falta exactamente lo que cierra y retiene la venta B2B: **entrar como comercio, hacer cosas (campañas/beneficios), llevarse reportes y el QR, y entender qué pagó y qué gana**. La base visual está; falta convertirla en producto B2B.

---

## 2. Diario del comercio (narrativa)

> *Soy Martín. Mi local está adherido a ReciclaXP y pago un abono mensual. Entro una vez por semana a ver cómo viene y a bajar material para mostrarle al dueño que la inversión sirve.*

**¿Por dónde entro?** Abro la app… y es la app del **reciclador**: me saluda "¡Hola de nuevo!", me muestra XP, rachas, beneficios para canjear. *Pero yo soy el comercio, no el que recicla.* Busco "mi panel" y no lo veo por ningún lado: ni en la barra de abajo, ni en un login de empresa. Después de dar vueltas lo encuentro **enterrado adentro de "Perfil" → "Panel para empresas"**. Raro: estoy entrando con una cuenta de reciclador para ver datos de empresa. Si yo fuera un dueño con poco tiempo, ya acá pensaría que esto "no es para mí".

**Entro al panel.** Ok, ahora sí: "Dashboard de impacto". Veo números grandes (usuarios, aportes, XP emitidos, kg, tapitas) y un gráfico que sube — lindo. **Pero arriba solo puedo elegir entre "YPF" y "River Plate".** Yo no soy ninguno de esos. *¿Dónde está MI comercio?* Y de paso, ¿por qué veo los números de YPF y de River como si nada? Esos son datos de otros.

**Quiero hacer algo.** Pienso: "buenísimo, voy a lanzar un beneficio para traccionar gente este finde". Busco un botón de **crear beneficio / campaña / premio del mes**… no hay. Busco **administrar mis puntos**… no hay. Toco por todos lados: lo único que puedo hacer es **volver** y **cambiar de sponsor**. El panel **no me deja hacer nada**, solo mirar.

**Vengo a justificar la plata.** Bajo hasta el final y leo: *"Reportes exportables para RSE y auditoría"*. ¡Perfecto, eso necesito! Busco el botón de **exportar / descargar**… **no existe**. La frase está, la acción no. Me tengo que ir con un screenshot para mostrarle al dueño. Flojo.

**Necesito el QR para el local.** Sé que hay una página de QR, pero la encuentro desde **"Escanear" → "¿Sos comercio? Generá tu QR"** (otra vez, metido en la pantalla del usuario). Entro y me muestra **el QR de los 9 puntos de toda la red** — incluido el de la competencia. Encuentro el mío, pero **no puedo descargarlo ni imprimirlo**: tengo que sacarle una foto a la pantalla. Para algo que va pegado en la caja, esperaba un "Descargar PNG" / "Imprimir" de una.

**¿Qué estoy pagando?** Antes de cerrar pienso: "¿cuánto pago, qué incluye mi plan, cuándo es el próximo cobro?". El panel **no dice nada** de eso. Y mi **Huella Verde** marca 88 — copado, pero *¿88 es bueno? ¿cómo la subo? ¿cómo la comunico?* Dice "comunicala en tus locales" pero no me da ninguna placa ni sticker para bajar.

**Cierro pensando:** *me mostraron una linda foto de lo que podría ser, pero como comercio no puedo trabajar acá: no entro como empresa, no hago campañas, no me llevo reportes ni el QR. Es una demo de ventas, no mi panel.*

---

## 3. Tabla priorizada — Matriz Impacto × Esfuerzo

| ID | Problema | Severidad | Esfuerzo | ¿Quick win? |
|----|----------|-----------|----------|-------------|
| C01 | Sin login/rol/alta de comercio; panel escondido en Perfil de usuario | Crítica | Alto | — |
| C02 | Panel 100% read-only: no se crean beneficios/campañas ni se gestionan puntos | Alta | Alto | — |
| C03 | "Reportes exportables para RSE" sin botón de exportar | Alta | Medio | — |
| C04 | El QR del comercio no se puede descargar ni imprimir | Alta | **Bajo** | ✅ |
| C05 | `/qr-comercios` muestra los QR de TODA la red, no los del comercio | Alta | Medio | — |
| C06 | El panel solo tiene YPF/River; las marcas (Coca, McDonald's, etc.) no existen ahí | Media | **Bajo** | ✅ |
| C07 | Panel y QR desconectados; no hay hub de comercio | Alta | Medio | — |
| C08 | Huella Verde no accionable (cómo sube, benchmark, placa para bajar) | Media | Medio | — |
| C09 | El panel deja ver datos de otros sponsors (no scopeado al comercio) | Media | Alto | — |
| C10 | Sin info de plan / fee / facturación / qué incluye | Media | Medio | — |
| C11 | Microcopy: "Panel B2B", "datos demo", "← App" (vuelve al perfil de usuario) | Baja | **Bajo** | ✅ |
| C12 | Sin navegación interna del panel (todo en una sola pantalla) | Media | Medio | — |
| C13 | Sin onboarding / empty-state para comercio nuevo (0 aportes) | Media | Medio | — |
| C14 | KPIs sin tendencia/contexto (% vs mes anterior, meta) ni tooltips | Media | **Bajo** | ✅ |
| C15 | Pensado mobile-first para una herramienta que se usa en desktop | Baja | Medio | — |

---

## 4. Hallazgos detallados

### 🚪 Entrada e identidad del comercio

```
[C01] NAVEGACIÓN/ARQUITECTURA — El comercio no tiene puerta de entrada ni identidad
📍 Ubicación:      acceso a /empresas (solo desde /perfil → "Panel para empresas")
👀 Qué vi:         No hay login ni rol de comercio. Se entra con una cuenta de usuario
                   reciclador y el panel está dentro de su Perfil. No hay alta/onboarding de comercio.
😖 Por qué molesta: El lado que paga el fee no tiene forma de "entrar como comercio". Se siente
                   que el B2B es un agregado del lado consumidor, no un producto propio.
🔥 Severidad:      Crítica
🔧 Esfuerzo:       Alto
✅ Recomendación:  Rol "comercio" con su propio login/landing (aunque sea mock en la demo) y un
                   onboarding mínimo: "Sumá tu comercio → configurá tu punto → generá tu QR →
                   publicá tu primer beneficio". A corto plazo: sacar el panel del Perfil del
                   usuario y darle una entrada propia clara (ej. /comercio con su login demo).
```

```
[C13] FEEDBACK/ONBOARDING — Sin estado "comercio nuevo" ni guía inicial
📍 Ubicación:      /empresas
👀 Qué vi:         El panel asume un comercio con miles de aportes. Un comercio recién sumado
                   (0 aportes) vería todo en cero, sin guía de qué hacer primero.
😖 Por qué molesta: El momento más frágil (recién entró, todavía no ve valor) no tiene
                   acompañamiento → abandono temprano.
🔥 Severidad:      Media
🔧 Esfuerzo:       Medio
✅ Recomendación:  Empty-state accionable: "Todavía no recibiste aportes. 1) Imprimí tu QR 2) Creá
                   un beneficio 3) Compartilo con tus clientes", con los botones que hagan eso.
```

### 🛠️ Gestión (lo que el comercio NO puede hacer)

```
[C02] FUNCIONES — El panel es de solo-lectura: no se puede gestionar nada
📍 Ubicación:      /empresas (únicos accionables: volver + tabs YPF/River)
👀 Qué vi:         No hay forma de crear beneficios, campañas, premios del mes, ni administrar
                   puntos/QR. Solo se miran métricas.
😖 Por qué molesta: La propuesta de valor B2B ("activá tu comunidad, lanzá campañas") no existe.
                   El comercio no puede operar, solo contemplar.
🔥 Severidad:      Alta
🔧 Esfuerzo:       Alto
✅ Recomendación:  Sección "Beneficios" (crear/editar/pausar, con stock y vigencia) y "Campañas"
                   (premio del mes, multiplicadores, desafíos). Aunque sea CRUD mock contra MSW.
```

```
[C03] FEEDBACK/MICROCOPY — "Reportes exportables" sin acción de exportar
📍 Ubicación:      /empresas → footer "Reportes exportables para RSE y auditoría · datos demo"
👀 Qué vi:         La frase promete exportación, pero no hay botón de exportar/descargar nada.
😖 Por qué molesta: El comercio entra a llevarse evidencia para RSE/dueño y no puede. Promesa
                   incumplida en el punto de mayor intención.
🔥 Severidad:      Alta
🔧 Esfuerzo:       Medio
✅ Recomendación:  Botón "Exportar reporte" → PDF de una página (logo del comercio + KPIs + Huella
                   Verde + gráfico) y/o CSV. Mínimo viable: "Descargar resumen (PNG/PDF)".
```

### 🔳 QR del comercio

```
[C04] FUNCIONES — El QR no se puede descargar ni imprimir
📍 Ubicación:      /qr-comercios (cada tarjeta de punto)
👀 Qué vi:         Se muestra el QR + el link, pero no hay botón "Descargar PNG" ni "Imprimir".
😖 Por qué molesta: El QR va pegado en el local; sin descarga el comercio saca screenshot (baja
                   calidad, recortado). Fricción tonta en un entregable físico clave.
🔥 Severidad:      Alta
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Botón "Descargar PNG" (ya generamos el PNG con la lib `qrcode`, falta exponerlo)
                   y "Imprimir" (window.print con una hoja lista: QR grande + nombre del punto +
                   "Reciclá acá y sumá XP"). Quick win.
```

```
[C05] ARQUITECTURA — La página de QR muestra TODA la red, no "mis" puntos
📍 Ubicación:      /qr-comercios (9 QR de todos los sponsors)
👀 Qué vi:         Lista los 9 puntos de todos los comercios (incluida la competencia), no solo
                   los del comercio logueado.
😖 Por qué molesta: El comercio quiere SU QR, no buscar entre los de otros. Además expone puntos
                   ajenos.
🔥 Severidad:      Alta
🔧 Esfuerzo:       Medio
✅ Recomendación:  Filtrar por el comercio logueado (cuando exista rol). En la demo: un selector
                   "Mostrar puntos de [comercio]" o agrupar por sponsor con el propio arriba.
```

### 🧭 Estructura del panel y comunicación

```
[C07] NAVEGACIÓN — Panel y QR desconectados; no hay hub del comercio
📍 Ubicación:      /empresas ↔ /qr-comercios
👀 Qué vi:         El panel no linkea al QR, y el QR se alcanza desde "Escanear" del usuario.
                   No hay un único lugar "Mi comercio" que junte todo.
😖 Por qué molesta: El comercio salta entre superficies sueltas, varias metidas en la app del
                   reciclador. No hay sensación de "mi espacio".
🔥 Severidad:      Alta
🔧 Esfuerzo:       Medio
✅ Recomendación:  Un hub "Mi comercio" con sub-navegación: Resumen · Beneficios · Campañas ·
                   Puntos/QR · Reportes · Plan.
```

```
[C12] NAVEGACIÓN — Sin navegación interna; "← App" vuelve al perfil del usuario
📍 Ubicación:      /empresas (header "← App")
👀 Qué vi:         Todo el panel es una sola pantalla scrolleable. El botón "← App" devuelve al
                   Perfil del usuario reciclador.
😖 Por qué molesta: Refuerza que el comercio "está de prestado" en la app del usuario. Sin
                   secciones, no escala a más funciones.
🔥 Severidad:      Media
🔧 Esfuerzo:       Medio
✅ Recomendación:  Tabs/secciones dentro del panel y un "Cerrar sesión / Volver" propio del comercio
                   (no "App").
```

```
[C10] NEGOCIO — Sin info de plan / fee / facturación
📍 Ubicación:      /empresas
👀 Qué vi:         Nada sobre el plan contratado, qué incluye, próximo cobro, o cómo escalar.
😖 Por qué molesta: El comercio paga un fee y no ve qué paga ni qué gana → mala retención y cero
                   upsell. Es el panel donde se justifica seguir pagando.
🔥 Severidad:      Media
🔧 Esfuerzo:       Medio
✅ Recomendación:  Tarjeta "Tu plan": nivel, fee, qué incluye (puntos, beneficios, campañas),
                   próximo cobro, y CTA de upgrade.
```

### 📊 Datos, Huella Verde y consistencia

```
[C06] CONSISTENCIA — El panel solo tiene YPF/River; las marcas de la red no aparecen
📍 Ubicación:      /empresas (selector de sponsor)
👀 Qué vi:         Coca-Cola, McDonald's, Starbucks, Grido y Adidas están en la red (marcas,
                   puntos, beneficios) pero NO en el panel B2B (no tienen métricas).
😖 Por qué molesta: Un comercio de esas marcas entra y no encuentra su panel. Incoherencia entre
                   "quién está en la red" y "quién tiene panel".
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Generar métricas mock para todas las marcas/comercios y que el selector liste
                   a todos (o, mejor, mostrar directamente el comercio logueado — ver C09).
```

```
[C14] UI/DATOS — KPIs sin tendencia, contexto ni explicación
📍 Ubicación:      /empresas (tarjetas de KPI)
👀 Qué vi:         Números sueltos ("XP emitidos 1.284.000 · pasivo de recompensas", "642").
                   Sin % vs mes anterior, sin meta, sin tooltip de qué significan.
😖 Por qué molesta: El comercio no sabe si un número es bueno o malo, ni si mejora. "Pasivo de
                   recompensas" es jerga.
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Agregar delta vs período anterior (↑12% este mes) y un tooltip por KPI. Cambiar
                   "pasivo de recompensas" por algo claro ("XP por canjear de tus clientes").
```

```
[C08] FUNCIONES — Huella Verde no es accionable ni comparable
📍 Ubicación:      /empresas (tarjeta Huella Verde)
👀 Qué vi:         Muestra el score (ej. 88/100, "Excelente") y dice "comunicala en tus locales",
                   pero no explica cómo sube, no hay benchmark, ni placa/sticker para descargar.
😖 Por qué molesta: Es el gancho RSE/marketing, pero el comercio no puede ni mejorarla con criterio
                   ni comunicarla (no hay material).
🔥 Severidad:      Media
🔧 Esfuerzo:       Medio
✅ Recomendación:  "Cómo subir tu Huella Verde" (acciones concretas) + comparativa ("top 10% de la
                   red") + botón "Descargar placa/sticker" para vidriera y redes.
```

```
[C09] ARQUITECTURA — El panel deja ver métricas de otros sponsors
📍 Ubicación:      /empresas (tabs YPF / River abiertas a cualquiera)
👀 Qué vi:         Cualquiera puede alternar y ver los números de YPF y River.
😖 Por qué molesta: Un panel B2B debería estar scopeado al comercio logueado; ver datos de otros
                   rompe la lógica (y en real sería un tema de privacidad de negocio).
🔥 Severidad:      Media
🔧 Esfuerzo:       Alto (requiere rol/auth de comercio)
✅ Recomendación:  Scopear el panel al comercio de la sesión; el selector multi-sponsor solo para
                   un rol "admin de plataforma".
```

```
[C11] MICROCOPY — "Panel B2B", "datos demo", "← App"
📍 Ubicación:      /empresas (header y footer)
👀 Qué vi:         "Panel B2B" (jerga), "← App" (vuelve al perfil del usuario), "· datos demo".
😖 Por qué molesta: Para un comercio, "B2B" y "App" no comunican; "datos demo" en producción se
                   vería poco serio.
🔥 Severidad:      Baja
🔧 Esfuerzo:       Bajo
✅ Recomendación:  "Panel de tu comercio" + el nombre del comercio en el header; "Volver"/"Salir"
                   en vez de "← App"; ocultar "datos demo" fuera de la demo.
```

```
[C15] RESPONSIVE — Pensado mobile-first para una herramienta de escritorio
📍 Ubicación:      /empresas (columna centrada max-w-2xl)
👀 Qué vi:         El panel es una columna angosta centrada; en desktop no aprovecha el ancho.
😖 Por qué molesta: Un comercio gestiona desde la compu; tablas, filtros y más densidad rendirían
                   mejor en pantalla grande.
🔥 Severidad:      Baja
🔧 Esfuerzo:       Medio
✅ Recomendación:  Layout responsive de dashboard en desktop (grilla más ancha, tabla de puntos,
                   filtros por fecha) manteniendo el mobile para consulta rápida.
```

---

## 5. Recomendaciones

### ✅ Quick wins (esta semana)
- **[C04]** Botón **"Descargar PNG" + "Imprimir"** del QR en `/qr-comercios` (el PNG ya se genera con `qrcode`). *Alto impacto para el comercio, esfuerzo mínimo.*
- **[C06]** Generar métricas mock para todas las marcas y listarlas en el selector (o mostrar el comercio logueado).
- **[C14]** Sumar **delta vs mes anterior** y tooltips a los KPIs; reescribir "pasivo de recompensas".
- **[C11]** Microcopy del panel ("Panel de tu comercio", "Volver", ocultar "datos demo").

### 🏗️ Mejoras estratégicas (lo que vuelve esto un producto B2B)
- **[C01 + C12 + C07]** Crear el **rol y hub "Mi comercio"** con entrada propia (login/landing) y sub-navegación: Resumen · Beneficios · Campañas · Puntos/QR · Reportes · Plan. Sacarlo de adentro del Perfil del usuario.
- **[C02]** **Gestión real**: crear/editar beneficios y campañas (premio del mes, multiplicadores) — CRUD mock contra MSW.
- **[C03]** **Exportar reporte RSE** (PDF/CSV) — convertir la promesa del footer en acción.
- **[C09 + C05]** **Scopear** panel y QR al comercio logueado (datos propios, QR propios).
- **[C08 + C10]** **Huella Verde accionable** (cómo subir + placa descargable) y **tarjeta de Plan** (fee, qué incluye, próximo cobro, upgrade) — lo que sostiene la venta y la retención.

---

*Auditoría enfocada 100% en el comercio. Conclusión: la capa de visualización está bien, pero el comercio todavía no puede **entrar como comercio, operar (campañas/beneficios), llevarse reportes ni su QR**. Esas cuatro cosas son las que convierten el panel en la herramienta por la que un comercio paga (y sigue pagando).*
