# Diagramas · plan de producto 2026-10-10

## 1. Flujo de la persona y de la institución: hoy y propuesto para el piloto

Los pasos marcados con (cambia) o (nuevo) son los que mueve el plan.

```mermaid
flowchart TD
  subgraph hoy["Hoy: demo en el navegador"]
    a1["La persona abre la demo"] --> a2["Escanea el QR de un punto"]
    a2 --> a3["Elige material y cantidad en unidades"]
    a3 --> a4["El aporte queda guardado en su propio navegador"]
    a4 --> a5["Suma XP calculados en su navegador"]
    a5 --> a6["Ve el proyecto fijo del sponsor del punto"]
    a5 --> a7["Canjea un beneficio"]
    b1["El comercio entra con un código fijo"] --> b2["Panel con métricas de una fórmula"]
    b2 --> b3["Reporte imprimible sin datos reales"]
  end
  subgraph piloto["Propuesto: piloto de 90 días en el club"]
    c1["El hincha escanea el Punto R del club (cambia: nombre)"] --> c2["Registra su aporte en unidades, igual que hoy"]
    c2 --> c3["El servidor valida el aporte y suma XP (nuevo)"]
    c3 --> c4["El aporte va al producto abierto del punto o elige si hay dos o más (nuevo)"]
    c4 --> c5["Ve el avance del producto del club y el ranking de la hinchada (cambia)"]
    c5 --> c6["Canjea premios del club"]
    d1["El club entra con su propia cuenta (nuevo)"] --> d2["Crea su producto con meta de kilos (nuevo)"]
    d2 --> d3["Carga los pesajes por lote y por partido (nuevo)"]
    d3 --> d4["Panel con kilos reales (cambia)"]
    d4 --> d5["Constancia por producto con datos registrados (nuevo)"]
    d4 --> d6["Informe del piloto para la comisión directiva (nuevo)"]
  end
```

## 2. Arquitectura: qué partes se tocan

```mermaid
flowchart LR
  subgraph pantallas["Pantallas de la app"]
    p1["Escanear"]
    p2["Proyecto e impacto"]
    p3["Ranking"]
    p4["Panel de comercio"]
    p5["Panel de institución (nuevo)"]
    p6["Carga de pesajes (nuevo)"]
    p7["Constancia por producto (nuevo)"]
  end
  api["Capa de API única de la app"]
  subgraph hoy["Hoy"]
    m1["Simulador en el navegador"]
    m2["Almacenamiento local del navegador"]
  end
  subgraph despues["Etapa 1 del piloto"]
    s1["Servidor: cuentas, aportes, productos, pesajes, ranking y reportes (nuevo)"]
    s2["Base de datos gestionada (nuevo)"]
  end
  pub["Publicación estática actual"]
  p1 --> api
  p2 --> api
  p3 --> api
  p4 --> api
  p5 --> api
  p6 --> api
  p7 --> api
  api --> m1
  m1 --> m2
  api -.-> s1
  s1 --> s2
  pantallas --> pub
```

## 3. Mapa de tareas (generado desde tareas.json)

```mermaid
flowchart TD
  n1["T1 · Matriz de lo prometido contra lo que existe · el socio de producto · pendiente"]
  n2["T2 · Una sola tabla de precios acordada entre los socios · todos los socios · pendiente"]
  n3["T3 · Versión de demostración del caso club para el martes · el socio de producto · pendiente"]
  n4["T4 · Página de posición antes del martes · los socios · pendiente"]
  n5["T5 · Desglose técnico por entregable alineado a las cuatro etapa… · el socio de producto · pendiente"]
  n6["T6 · Plan piloto, acuerdo preliminar y presupuesto con montos pa… · el socio de ventas · bloqueada"]
  n7["T7 · Backend del piloto detrás de la capa de API actual · el socio de producto · bloqueada"]
  n8["T8 · Carga de pesajes por lote desde el panel · el socio de producto · bloqueada"]
  n9["T9 · Productos de la institución con meta, Punto R y constancia… · el socio de producto · bloqueada"]
  n10["T10 · Elección de producto al escanear · el socio de producto · bloqueada"]
  n11["T11 · Espacio de la institución dentro de ReciclaXP · el socio de producto · bloqueada"]
  n12["T12 · Que el socio de ventas vuelva a ver el proyecto · el socio de producto · pendiente"]
  n1 --> n3
  n1 --> n5
  n2 --> n6
  n4 --> n6
  n5 --> n6
  n6 --> n7
  n7 --> n8
  n7 --> n9
  n8 --> n9
  n9 --> n10
  n7 --> n11
  classDef pendiente fill:#f1f0ea,stroke:#8a877c,color:#1f1f1f
  classDef en_curso fill:#fff1c9,stroke:#a8790b,color:#1f1f1f
  classDef en_pr fill:#e6defa,stroke:#6a4fb0,color:#1f1f1f
  classDef hecha fill:#dcf1e2,stroke:#2f7d4f,color:#1f1f1f
  classDef bloqueada fill:#fbdcd6,stroke:#b0402a,color:#1f1f1f
  classDef descartada fill:#ececec,stroke:#9a9a9a,color:#6b6b6b,stroke-dasharray: 4 3
  classDef desconocido fill:#ffffff,stroke:#555555,color:#1f1f1f,stroke-dasharray: 2 2
  class n1,n2,n3,n4,n5,n12 pendiente
  class n6,n7,n8,n9,n10,n11 bloqueada
```
