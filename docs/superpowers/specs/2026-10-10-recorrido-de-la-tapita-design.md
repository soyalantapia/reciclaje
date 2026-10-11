# El recorrido de tu tapita · rediseño de la trazabilidad

**Fecha:** 10/10/2026 · **Rama:** `feat/recorrido-de-la-tapita` · **Sigue a:** `2026-10-10-dia-de-cancha-design.md`

## Decisiones de Alan

- Alan pidió enfocar todo en la trazabilidad.
- Aprobó la **opción A**: una línea de cal vertical sobre césped. La maqueta la aprobó con «me encanta».
- Se descartó la **B**, una cancha horizontal de arco a arco, porque en el celular los textos no entran.

## Qué se ve (proyectos que se dibujan como banco)

**Encabezado sobre `Cancha`:**
- «Trazabilidad · {club}»;
- el título «El recorrido de tu tapita».

**Resumen:**
- **Dónde está tu tapita:** «Tu tapita está en el **{punto}**». Si no hay punto, «Tu tapita ya está en el recorrido».
- **Lo que sigue:** «Lo que sigue: **{etapa siguiente}**, a cargo de {quien la hace}». El texto sale de la etapa y su `operator`.
- **El avance:** «Etapa N de M».

**La línea de cal vertical con las etapas:**
- Las hechas llevan un tilde verde.
- La actual lleva **tu tapita en ámbar**, que entra cayendo, salvo con movimiento reducido. Tiene `aria-current="step"`.
- La siguiente va destacada, con la etiqueta «lo que sigue» y su detalle (por ejemplo, el pesaje que hace el club).
- Las que faltan dicen «pendiente», sin fechas inventadas.

**El destino:** el banco de tapitas chico, con el mismo avance que el inicio y el proyecto (por ejemplo, 42.840 de 300.000 · 14 %).

Al final queda el enlace «← Volver al proyecto», como hoy.

**Los proyectos que no son un banco** conservan la pantalla de hoy (`TraceabilityTimeline`).

## Datos (ninguno nuevo)

- **Las etapas:** `api.getProjectTrace` con `conAporteDeLaSesionEnLaTraza`, como hoy.
- **El proyecto:** `api.getProject` con `conAportesDeLaSesion`, para que el destino muestre los mismos números que el inicio.
- **El punto de tu tapita:** el aporte más reciente de la sesión a ese proyecto y material. Si no hay, el de tu historial (`api.getContributions`). Si tampoco, no se nombra un punto.

## Piezas

- **`src/lib/recorridoDeLaTapita.ts`** (puro, con pruebas):
  - `estadoDelRecorrido(eventos)` → `{ actual, siguiente, total }`:
    - `actual` es la última etapa hecha, o -1;
    - `siguiente` es la primera no hecha después de `actual`, o `null`.
  - `puntoDeTuTapita(proyecto, actividad, historial)` → `string | undefined`.
- **`src/components/features/iconosDeEtapa.ts`:** los íconos por etapa, compartidos con `TraceabilityTimeline`.
- **`src/components/features/RecorridoDeLaTapita.tsx`:** la pantalla de arriba.
- **`src/pages/Traceability.tsx`:** usa `RecorridoDeLaTapita` para los bancos y `TraceabilityTimeline` para el resto.

## Reglas

- No hay números nuevos.
- No dice «en vivo» ni inventa fechas.
- No usa colores ni escudo del club.
- Con movimiento reducido, nada se anima.
- Toda grilla con columnas por ancho lleva `grid-cols-1`.
- La línea de cal no va como hija directa de un `<ol>`, porque eso es HTML inválido.

## Verificación

- Pruebas unitarias de la lógica y de render del componente y de la página: el banco, el que no es banco y el punto que sale del historial y de la sesión.
- La suite completa, `tsc -b`, el lint y el build.
- Recorrido en el navegador:
  - a 390 y 1280 px, sin desborde;
  - con movimiento reducido;
  - en modo oscuro;
  - después de un aporte, «Tu aporte» muestra el de la sesión y el destino suma.
