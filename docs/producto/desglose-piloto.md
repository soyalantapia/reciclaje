# Desglose técnico del piloto de 90 días

Corte: 10/10/2026. Sale del mapa del piloto (cuatro etapas) y de la lista `prometido-vs-demo.md`.

**Qué tiene cada entregable**
- **Criterio de aceptación**: un recorrido que se puede comprobar. El pago va contra un entregable aceptado.
- **Esfuerzo**: en días de desarrollo, con rango, porque es una estimación gruesa y honesta.
- **Reusa**: lo que ya existe en la demo. Eso no se cobra como nuevo, sólo se cobra pasarlo a datos reales.

Los **montos** no van acá (el repo es público): salen de multiplicar estos días por la tarifa acordada. La **operación mensual** va en un renglón aparte, separada del desarrollo.

## Etapa 1 · días 1 a 20 · preparación y validación técnica

| Id | Entregable | Criterio de aceptación | Reusa | Esfuerzo |
|---|---|---|---|---|
| E1.1 | **Servidor y base de datos** detrás de la capa de API actual. Cuentas, puntos, aportes, XP, saldo y canje se calculan en el servidor. Rechaza material no aceptado por el punto, cantidades sin tope y reenvíos repetidos | Un aporte cargado en un celular aparece en el panel del club abierto en otro dispositivo. Las mismas pruebas de contrato pasan contra el simulador y contra el servidor | Tipos y capa de API (`src/services/api.ts`) | 5 a 8 días |
| E1.2 | **Login real**: hinchas por mail (alias y consentimiento registrado) y panel por institución sin el código fijo de la demo | Una institución no puede ver ni tocar datos de otra (prueba con dos instituciones). Sin consentimiento no se registra el primer aporte | Pantallas de login | 2 a 3 días |
| E1.3 | **Producto del club con meta en kilos** y **Punto R**: el club crea su producto desde el panel; un producto abierto por punto | El club crea el producto, imprime el QR de su Punto R y un aporte escaneado ahí suma a ese producto | Pantalla del proyecto, barra de avance, QR de cada punto | 2 a 3 días |
| E1.4 | **Carga de pesajes** por lote y por partido, con quién cargó y cuándo | El total de kilos del panel es la suma de los pesajes; un partido sin pesar no se muestra como cero | — | 1 a 2 días |
| E1.5 | **Publicación en un dominio propio**, app instalable y aviso de errores | La app abre e instala en Android y en iPhone desde el dominio del piloto; un error forzado llega al aviso | App instalable actual | 1 a 2 días |
| E1.6 | **Prueba en el estadio sin público** | Recorrido completo en el estadio: escanear, aportar, pesar y ver el panel | — | medio día |

**Subtotal de la etapa 1: 11,5 a 18,5 días.**

## Etapa 2 · días 21 a 35 · lanzamiento controlado

| Id | Entregable | Criterio de aceptación | Reusa | Esfuerzo |
|---|---|---|---|---|
| E2.1 | **Material para los Punto R**: QR para imprimir, piezas para cartelería e instructivo para el personal que pesa | El personal del club pesa y carga un lote sin ayuda, siguiendo el instructivo | QR imprimibles | 1 día |
| E2.2 | **Ranking de la hinchada y premio-experiencia** definidos por el club desde su panel | El club carga el premio del mes y el ranking sale de los aportes registrados | Pantalla de ranking y premio del mes | 2 días |
| E2.3 | **Recompensas del club y validación del cupón** en el punto de canje | El personal escanea el cupón, queda usado y no se puede usar dos veces | Catálogo de beneficios y cupón con QR | 2 días |
| E2.4 | **Acompañamiento del primer partido**: soporte y ajustes | Se resuelven los problemas que aparezcan en el primer partido, con registro | — | 1 día |

**Subtotal de la etapa 2: 6 días.**

## Etapa 3 · días 36 a 75 · operación en partidos

| Id | Entregable | Criterio de aceptación | Reusa | Esfuerzo |
|---|---|---|---|---|
| E3.1 | **Panel con datos reales** por partido y por punto: kilos, aportes y participación | Ningún número sale de una fórmula; donde no hay dato dice «sin datos» | Resumen del panel | 2 días |
| E3.2 | **Elección de producto al escanear** (sólo si el club tiene dos o más productos abiertos a la vez en un punto) | La elección aparece sólo con dos o más productos; el servidor rechaza un producto de otra institución o cerrado | — | 2 a 3 días, opcional |

**Subtotal de la etapa 3: 2 días, o 4 a 5 días con la opcional.** El soporte de cada partido es operación y va en el renglón mensual.

## Etapa 4 · días 76 a 90 · evaluación y decisión

| Id | Entregable | Criterio de aceptación | Reusa | Esfuerzo |
|---|---|---|---|---|
| E4.1 | **Constancia por producto** con aportes y pesajes registrados, con un identificador que se puede verificar | Un producto sin pesajes no emite constancia; si cambia un pesaje, cambia la constancia; no trae datos personales | Reporte imprimible | 2 a 3 días |
| E4.2 | **Informe del piloto** para la comisión directiva: kilos, participación, funcionamiento y costos | Se genera desde los datos registrados y se exporta | Reportes CSV y PDF | 2 días |

**Subtotal de la etapa 4: 4 a 5 días.**

## Total de desarrollo del piloto

**23,5 a 31,5 días de desarrollo**, o **25,5 a 34,5** con la elección de producto. La etapa 1 es la más cargada: 11,5 a 18,5 días de trabajo en 20 días corridos.

## Operación mensual (renglón aparte)

- Servidor y base de datos gestionada.
- Dominio y certificado.
- Envío de mails (códigos de acceso).
- Aviso de errores.
- Soporte en días de partido y mantenimiento.

## Fase 2: después del piloto, se cotiza aparte

- Ranking por producto y multiplicadores mensuales para los tres primeros.
- Premio por producto definido por la institución.
- App con la marca propia del club (a medida).
- Panel de logística para un operador de residuos.
- Premium para usuarios con cobro.
- Varias instituciones a la vez y escala a los 100 Punto R.

## Lo que no es desarrollo

- Las balanzas.
- El retiro del material y la fabricación del producto, que hace el socio industrial.
- Las piezas gráficas impresas.
- La cartelería física en el estadio.
