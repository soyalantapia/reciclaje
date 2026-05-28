# 🕵️ Auditoría UX — "En la piel del usuario"
### ReciclaXP · v1.0 · 2026-05-28

**Plataforma:** ReciclaXP — PWA de reciclaje incentivado (XP, beneficios, trazabilidad, comunidad, panel B2B).
**Método:** navegación real en `http://localhost:5183` (viewport mobile 375×812, también desktop 1280 y modo oscuro).
**Stack:** Vite + React 19 + TS + Tailwind 4 · datos mock (MSW).
**Idioma del producto:** español rioplatense.
**Perfil del usuario:** Camila, recicladora recurrente (varias veces por semana), práctica, sin paciencia para la fricción.

> Alcance: auditoría de **experiencia**, no de seguridad ni de código. Recorrido sin acciones destructivas, con datos de prueba. **No se corrigió nada**: esto es para detectar y reportar.

---

## 1. Resumen ejecutivo

### Las 5 fricciones que más sangran
1. **[R01] Pantallas en blanco sin explicación cuando falla la carga de datos.** Entré al **Mapa** y me quedé mirando un recuadro gris vacío para siempre: ni un punto, ni un mensaje, ni un botón de reintentar. Reproducible: tras moverme entre secciones, las llamadas a datos dejan de responder y *toda* la pantalla queda en estado de carga eterno. Es lo más grave: el usuario queda atascado sin saber si está roto o cargando.
2. **[R02] Ninguna pantalla muestra estado de error.** La causa de fondo del punto anterior: el sistema sabe que algo falló, pero nunca me lo dice. Afecta Mapa, Beneficios, Ranking, Proyecto, Trazabilidad y Panel B2B por igual.
3. **[R03] El gráfico "Aportes por mes" del Panel B2B no muestra barras.** Un sponsor que entra a ver su impacto ve un recuadro vacío con los nombres de los meses abajo y nada más. En un panel que se vende como "dashboard de impacto", una métrica fantasma resta toda credibilidad. (Y es un arreglo de minutos.)
4. **[R04] El modo oscuro queda a medio hacer.** Tarjetas y chips que deberían ser oscuros se quedan claros/brillantes (la card "Tu aporte", los hitos), como parches blancos sobre el fondo negro. Se siente sin terminar.
5. **[R05] El Ranking —corazón de la gamificación— está escondido.** No está en la barra de navegación: solo se llega tocando un banner del Inicio. Para algo que motiva el uso recurrente, debería estar a un toque.

### Sensación general del recorrido
Cuando los datos cargan, **ReciclaXP se siente cuidada, moderna y con identidad**: la wallet de dos saldos es clarísima, el flujo de escaneo es ágil y gratificante (+XP con animación y vínculo al proyecto), el canje termina en un cupón real, y la **feature estrella —el banco que se pinta de blanco y negro a color— funciona y emociona**. El problema no es el "qué", es la **resiliencia**: en cuanto un dato no llega, la app no tiene red de contención y deja al usuario frente a una pantalla muda. Hoy la experiencia es **buena en el camino feliz y frágil en el borde**. Cerrar esa brecha (estados de error + un par de bugs visuales) la llevaría de "demo linda" a "producto confiable".

---

## 2. Diario del usuario (narrativa)

> *Soy Camila. Reciclo en la estación de la esquina y en las máquinas del Monumental. Abro la app un par de veces por semana.*

**Entro.** La pantalla de login ya tiene mi mail puesto y un botón grande "Ingresar". Toco y entro de una. Lindo: un "¡Hola, Camila! 🌱" y arriba veo mis dos saldos —reputación y canjeable— bien separados. *Me gusta que no me mezclen "lo que valgo" con "lo que puedo gastar".* Abajo, mi banco de suplentes pintándose de a poco. Me da ganas de sumar más.

**Voy a registrar un aporte.** Toco el botón verde del medio. Aparece un escáner con una línea que se mueve —entiendo al toque que es para el QR— y, como es demo, me deja elegir el punto a mano. Elijo la YPF, marco "Aluminio", pongo 50 y toco "Registrar". *Bien:* animación de tilde, "+200 XP", y me dice a qué proyecto fue mi aporte con botones para ver el proyecto o la trazabilidad. Esto está muy logrado. **Pero** dudé un segundo en "Cantidad": me pide "unidades", y sin embargo en mi historial veo aportes en "1.4 kg". ¿Cuento tapitas? ¿Bolsas? ¿Gramos? No me queda claro qué estoy cargando.

**Quiero ver los puntos en el mapa.** Toco "Mapa"… y me quedo mirando un recuadro gris. Vacío. No hay pines, no hay lista, no hay "cargando…", no hay "algo salió mal". Nada. *¿Se colgó? ¿Me quedé sin internet? ¿Toco de nuevo?* Si fuera una usuaria de verdad, acá pensaría que la app está rota. (Recargando la página entera vuelve a aparecer todo, pero yo eso no lo sé, y un usuario común tampoco va a "recargar".)

**Voy a canjear algo.** Beneficios carga bien. Veo "20% en tu próxima carga" por 1.200 XP. Toco "Canjear", me confirma costo y saldo resultante, confirmo y… ¡cupón con QR y código! Mi saldo bajó de 5.400 a 4.200. Impecable, esto genera confianza. *Detalle:* arriba veo mi saldo dos veces, pegaditos (el del header y el de la página). Me sobra uno.

**Miro el ranking.** No lo encuentro en la barra de abajo. Termino entrando desde un banner del Inicio. Está lindo —medallas, premio del mes— pero yo estoy en el puesto 7 y para verme tengo que scrollear. *Quiero verme primero, es lo que me importa.*

**Me tienta Premium.** En mi perfil me lo ofrecen bien: lista de beneficios, botón claro. Toco "Hacerme Premium" y se confirma al toque. Pero cuando estaba en Beneficios, **nunca me dijeron que con Premium algunos canjes salen menos XP**. Me habría convencido más verlo ahí, en el momento de la tentación.

**De curiosa, entro al Panel B2B.** Las métricas grandes están buenas (usuarios, aportes, tapitas). Pero el gráfico "Aportes por mes" está **vacío**: veo Ene, Feb, Mar… abajo y ninguna barra arriba. Para un sponsor que paga por "ver su impacto", esto es un papelón.

**Pruebo el modo oscuro.** La mayoría queda bien, pero la tarjeta "Tu aporte" y los chips de hitos se quedan **blancos**, como si me hubieran olvidado de pintarlos. Desentona.

**Cierro pensando:** *cuando anda, me encanta. Pero me dejó sola dos veces (mapa en blanco, gráfico vacío) y eso me hace dudar de si puedo confiar en ella para algo importante.*

---

## 3. Tabla priorizada — Matriz Impacto × Esfuerzo

| ID | Problema | Severidad | Esfuerzo | ¿Quick win? |
|----|----------|-----------|----------|-------------|
| R01 | Pantalla en blanco / skeleton infinito si falla la carga | Crítica | Medio | — |
| R02 | Ninguna pantalla consume el estado de error de `useApi` | Crítica | Medio | — |
| R03 | Gráfico "Aportes por mes" (B2B) sin barras (height:0) | Alta | **Bajo** | ✅ |
| R04 | Modo oscuro: tokens claros hardcodeados (`bg-eco-50/100`) | Media | Bajo | ✅ (calidad) |
| R05 | Ranking fuera de la navegación principal | Alta | Bajo | ✅ |
| R06 | Premium no se promociona en el Marketplace | Media | Bajo | ✅ |
| R07 | Saldo XP duplicado en la pantalla de Beneficios | Baja | **Bajo** | ✅ |
| R08 | Mapa esquemático sin orientación real (calles/distancia) | Media | Alto | — |
| R09 | Escaneo pide "unidades" para materiales que van por kg | Media | Bajo | ✅ |
| R10 | El usuario actual queda bajo el fold en el Ranking | Media | Bajo | ✅ |
| R11 | Impacto visual: primer frame 100% gris (parece sin pintar) | Media | Bajo | ✅ |
| R12 | Chip de racha "🔥 12" sin etiqueta ("días") | Baja | Bajo | ✅ |
| R13 | Botones Google/Apple logean en silencio (sin aviso de demo) | Baja | Bajo | ✅ |
| R14 | Desktop: columna phone-width sobre fondo vacío | Baja | Medio | — |
| R15 | Sin historial de cupones; stock no decrementa tras canje | Media | Medio | — |
| R16 | "Puntos cercanos" no están ordenados por cercanía | Baja | Medio | — |

---

## 4. Hallazgos detallados

### 🚧 Carga, estados y resiliencia

```
[R01] FRICCIÓN/FEEDBACK — Pantalla en blanco cuando falla la carga de datos
📍 Ubicación:      /mapa (y todas las pantallas con datos: /beneficios, /ranking, /proyecto/:id, /trazabilidad/:id, /empresas)
👀 Qué vi:         Entré a Mapa y quedó un recuadro gris vacío, sin pines, sin lista, sin mensaje. Permanente. En consola: decenas de "[api] Recibí HTML en vez de JSON para /points / /sponsors" (MSW dejó de interceptar tras navegar dentro de la app; solo se recupera recargando la página entera).
😖 Por qué molesta: El usuario no distingue "cargando" de "roto" de "sin conexión". No hay forma de salir del estado salvo recargar, algo que un usuario común no hace. Se siente que la app se colgó.
🔥 Severidad:      Crítica
🔧 Esfuerzo:       Medio
✅ Recomendación:  (a) Endurecer el arranque de MSW para que no pierda el control en navegación SPA (o documentar que con backend real desaparece). (b) Más importante y permanente: NUNCA dejar una pantalla muda — ver R02.
```

```
[R02] FEEDBACK — El estado de error existe pero ninguna pantalla lo muestra
📍 Ubicación:      hook src/hooks/useApi.ts (devuelve `error`) consumido en todas las páginas
👀 Qué vi:         `useApi` expone `{ data, loading, error, reload }`, pero las páginas solo renderizan `{!data && <Skeleton/>}`. El `error` nunca se usa. Resultado: cualquier fallo de red = skeleton eterno.
😖 Por qué molesta: En la demo (MSW) ya provoca pantallas en blanco; con un backend real, cualquier hipo de red dejaría al usuario igual de varado, sin reintentar.
🔥 Severidad:      Crítica
🔧 Esfuerzo:       Medio
✅ Recomendación:  Crear un componente `<EstadoError onReintentar={reload} />` con copy tipo "No pudimos cargar esto. Reintentar." y mostrarlo en cada página cuando `error` no es null. Es un patrón reusable: se aplica una vez y cubre las 7 pantallas.
```

### 📊 Panel B2B

```
[R03] UI VISUAL — El gráfico "Aportes por mes" no dibuja barras
📍 Ubicación:      /empresas → tarjeta "Aportes por mes" (src/pages/B2BDashboard.tsx)
👀 Qué vi:         Solo se ven las etiquetas de meses (Ene…May). Las barras tienen altura 0 (confirmado por inspección: la barra mide height:0px aunque el ancho y el color son correctos).
😖 Por qué molesta: Es el gráfico central del dashboard que se le vende a un sponsor. Vacío, transmite que el producto está roto o que no hay datos.
🔥 Severidad:      Alta
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Es un colapso de flex: el contenedor `flex h-40 items-end` hace que las columnas se encojan al contenido y el `height:%` de la barra no tenga contra qué resolver. Darle a las columnas altura definida (p. ej. contenedor `items-stretch` + wrapper de barra `flex-1 min-h-0` o calcular la altura en px). Quick win.
```

### 🎨 Modo oscuro y consistencia visual

```
[R04] UI VISUAL — Tokens claros hardcodeados rompen el modo oscuro
📍 Ubicación:      ImpactProgress (card "Tu aporte" con bg-eco-50, chips de hitos bg-eco-100), y otros usos de text-eco-700/800 sobre fondo oscuro
👀 Qué vi:         En modo oscuro, la card "Tu aporte" queda blanca brillante y los chips de hitos quedan verde claro, como parches sin pintar sobre el fondo negro.
😖 Por qué molesta: Da sensación de inconsistencia / falta de terminación, justo en la pantalla de la feature estrella.
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Reemplazar `bg-eco-50/100` y colores fijos por variantes que respeten el tema (p. ej. `bg-eco-50 dark:bg-eco-900/30`, `text-eco-700 dark:text-eco-300`) o tokens semánticos. Auditar todos los `bg-eco-50`, `bg-eco-100`, `text-eco-700/800` del proyecto.
```

### 🧭 Navegación y descubribilidad

```
[R05] NAVEGACIÓN — El Ranking no está en la barra principal
📍 Ubicación:      BottomNav (Inicio/Mapa/Escanear/Beneficios/Perfil) — /ranking solo se alcanza desde un banner del Inicio
👀 Qué vi:         Para ver mi ranking tuve que volver al Inicio y tocar un banner. No hay acceso directo.
😖 Por qué molesta: El ranking es el motor de recurrencia (gamificación). Esconderlo baja el engagement que la app quiere generar.
🔥 Severidad:      Alta
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Llevar Ranking a un lugar de primer nivel: reemplazar "Mapa" en la barra (el mapa puede vivir dentro de Escanear/Beneficios) o sumar un acceso fijo en el header del Inicio. Evaluar 5 ítems de nav + ranking.
```

```
[R10] FRICCIÓN — En el ranking, el usuario no se encuentra a sí mismo
📍 Ubicación:      /ranking
👀 Qué vi:         Estoy en el puesto 7 (resaltado), pero queda bajo el fold; hay que scrollear para verme.
😖 Por qué molesta: Lo primero que querés saber es "¿en qué puesto voy?". Obligar a scrollear agrega fricción a la pregunta más importante.
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Fijar una "fila propia" sticky arriba o abajo ("Vos · #7 · 2.180 XP"), y/o auto-scrollear a la fila del usuario al cargar.
```

### 💰 Economía XP y conversión

```
[R06] MICROCOPY/NEGOCIO — Premium no se promociona donde se decide el canje
📍 Ubicación:      /beneficios (BenefitCard) para usuario NO premium
👀 Qué vi:         Varios beneficios tienen precio premium más barato (p. ej. 1.000 vs 1.200 XP), pero al usuario no premium no se le muestra nada de eso.
😖 Por qué molesta: Se pierde el momento de mayor intención de compra (el usuario mirando un beneficio que casi puede pagar). Además, el principal perk de Premium ("mejores canjes") es invisible justo donde importa.
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  En cada card, para no-premium, mostrar un guiño: "Con Premium: 1.000 XP 👑" o un badge "Ahorrás 200 con Premium". Enlazar al upsell.
```

```
[R09] MICROCOPY/FORMULARIO — "Unidades" para materiales que se miden en kg
📍 Ubicación:      /escanear → paso "Cantidad"
👀 Qué vi:         Al escanear cualquier material el contador dice "unidades", pero el historial muestra plástico/vidrio en kg (ej. "1.4 kg").
😖 Por qué molesta: Inconsistencia confusa: el usuario no sabe qué está cargando (¿tapitas sueltas? ¿peso? ¿bolsas?).
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Adaptar la unidad al material: "tapitas" para tapitas, "kg" para los que van por peso; o explicitar "unidades (tapitas)". Coherente con cómo se muestra después en el historial.
```

### ⭐ Feature estrella (impacto visual)

```
[R11] UI VISUAL — El impacto arranca 100% gris y tarda en pintarse
📍 Ubicación:      ImpactProgress (Inicio y /proyecto/:id)
👀 Qué vi:         Al cargar, el banco aparece completamente gris con la "línea de agua" abajo, y recién a los ~1.3s se colorea hasta el 62%. En una mirada rápida (o si navegás veloz) parece sin pintar/roto. Además, la base en gris está a opacity-25, así que la parte "pendiente" se ve lavada/blancuzca más que un blanco y negro claro.
😖 Por qué molesta: La feature estrella es justo "ver el avance a color"; si el primer impacto visual es "todo gris", se diluye el wow.
🔥 Severidad:      Media
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Animar desde un piso ya pintado (no desde 0%), o reducir/saltar la animación en primer render; subir el contraste de la base (grayscale más marcado, menos transparencia) para que el "B&N → color" se lea fuerte. Respetar `prefers-reduced-motion`.
```

### 🗺️ Mapa y puntos

```
[R08] UI/UTILIDAD — El mapa esquemático no ayuda a orientarse
📍 Ubicación:      /mapa
👀 Qué vi:         Pines de colores flotando sobre un fondo punteado, sin calles, sin etiquetas hasta tocarlos, sin distancias ni "más cercano".
😖 Por qué molesta: Un usuario que quiere "ir al punto más cercano" no obtiene ninguna ayuda geográfica real; el mapa es decorativo.
🔥 Severidad:      Media
🔧 Esfuerzo:       Alto
✅ Recomendación:  Mediano plazo: mapa real (geolocalización + distancias + "cómo llegar"). Corto plazo: etiquetar los pines y ordenar la lista por cercanía/estado (Abierto primero).
```

```
[R16] MICROCOPY — "Puntos cercanos" no están ordenados por cercanía
📍 Ubicación:      /escanear → "Puntos cercanos"
👀 Qué vi:         La lista dice "cercanos" pero muestra todos los puntos sin orden de distancia (no hay geolocalización).
😖 Por qué molesta: El label promete algo que no cumple; erosiona la confianza en los textos.
🔥 Severidad:      Baja
🔧 Esfuerzo:       Medio
✅ Recomendación:  O usar geolocalización real y ordenar, o cambiar el texto a "Puntos de la red".
```

### ✨ Detalles que pulen

```
[R07] UI VISUAL — Saldo XP duplicado en Beneficios
📍 Ubicación:      /beneficios
👀 Qué vi:         El chip verde del header (4.200) y un chip idéntico en el encabezado de la página, pegados.
😖 Por qué molesta: Redundancia visual; ocupa espacio sin agregar info.
🔥 Severidad:      Baja
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Quitar el chip de la página (el del header ya es global) o, si se quiere reforzar, darle otra función (ej. "Cómo gano más XP").
```

```
[R12] MICROCOPY — Chip de racha "🔥 12" sin contexto
📍 Ubicación:      header (todas las pantallas)
👀 Qué vi:         "🔥 12" sin etiqueta. Un usuario nuevo-ish puede no saber que son días de racha.
😖 Por qué molesta: Información ambigua en un lugar prominente.
🔥 Severidad:      Baja
🔧 Esfuerzo:       Bajo
✅ Recomendación:  "🔥 12 días" si entra, o un tooltip/acceso que explique la racha al tocarlo.
```

```
[R13] MICROCOPY — Login social sin aviso de demo
📍 Ubicación:      /login (botones Google / Apple)
👀 Qué vi:         "Google" y "Apple" hacen el mismo login demo en silencio, sin indicar que es una demo.
😖 Por qué molesta: Menor, pero puede confundir a quien evalúa el producto (¿conecté mi cuenta real?).
🔥 Severidad:      Baja
🔧 Esfuerzo:       Bajo
✅ Recomendación:  Etiqueta "demo" o toast "Login social próximamente — entrás como demo".
```

```
[R14] RESPONSIVE — En desktop, columna angosta sobre fondo vacío
📍 Ubicación:      toda la app (layout max-w-md centrado)
👀 Qué vi:         En 1280px la app es una columna de ~448px centrada con grandes márgenes vacíos.
😖 Por qué molesta: Esperable en PWA mobile-first, pero se ve desangelado en escritorio.
🔥 Severidad:      Baja
🔧 Esfuerzo:       Medio
✅ Recomendación:  Tratamiento de fondo en desktop (ilustración/marco de teléfono) o un layout específico. Baja prioridad si el target es 100% mobile.
```

```
[R15] FRICCIÓN — Sin historial de cupones; stock no decrementa
📍 Ubicación:      /beneficios (post-canje)
👀 Qué vi:         Tras canjear, el cupón aparece una vez pero no queda guardado en ningún "mis cupones", y el stock del beneficio no baja visualmente.
😖 Por qué molesta: Si cierro el modal, ¿dónde recupero mi cupón QR para mostrarlo en el comercio?
🔥 Severidad:      Media
🔧 Esfuerzo:       Medio
✅ Recomendación:  Sección "Mis cupones" (en Perfil o Beneficios) con los canjes activos y su QR/código.
```

---

## 5. Recomendaciones

### ✅ Quick wins (esta semana)
- **[R03]** Arreglar el colapso del gráfico de barras del B2B (CSS flex). *Alto impacto, minutos de trabajo.*
- **[R05]** Subir el **Ranking** a la navegación principal (o un acceso fijo en el header).
- **[R02]** Implementar un único **`<EstadoError onReintentar/>`** y consumir `error` de `useApi` en las 7 pantallas. Es la mejora con mejor relación impacto/esfuerzo de todo el reporte.
- **[R09]** Unidad del escaneo según material (tapitas vs kg).
- **[R06]** Mostrar el precio Premium en las cards de Beneficios para no-premium.
- **[R10]** Fila propia sticky / auto-scroll en el Ranking.
- **[R04]** Pasada de modo oscuro: eliminar `bg-eco-50/100` y colores fijos.
- **[R07] [R12] [R13]** Pulidos rápidos: saldo duplicado, etiqueta de racha, aviso de demo en login.

### 🏗️ Mejoras estratégicas (rediseños / fondo)
- **[R01]** Endurecer la capa de datos: garantizar que MSW no pierda intercepción en navegación SPA (o validar que con backend real desaparece) y, sobre todo, que **ningún fallo deje una pantalla muda**. Resiliencia como principio de diseño.
- **[R08] [R16]** Mapa real con geolocalización, distancias y "cómo llegar" — hoy el mapa es el punto más débil en utilidad.
- **[R15]** "Mis cupones" como sección de primer nivel: cierra el loop de canje → uso en el comercio.
- **[R11]** Refinar la animación de la feature estrella para maximizar el "wow" del blanco y negro → color desde el primer frame.

---

*Auditoría realizada navegando la app en vivo (mobile, desktop y modo oscuro). Camino feliz sólido; la oportunidad está en la resiliencia y en dos o tres bugs visuales de bajo esfuerzo y alto impacto.*
