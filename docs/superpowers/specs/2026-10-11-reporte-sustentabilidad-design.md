# Los datos del informe, ordenados para el Reporte de Sustentabilidad del club

Diseño aprobado por Alan el 11/10/2026 para la reunión con Talleres del martes 13/10.

## Por qué

Talleres pidió la reunión para «compartir las iniciativas que desde el Club ya implementamos y pensar de qué manera podrían articularse con su trabajo».

Desde 2023, el club incluye un **Reporte de Sustentabilidad** en su Memoria y Balance ([Cadena 3](https://www.cadena3.com/noticia/talleres/talleres-presentara-un-reporte-de-sustentabilidad-en-su-proxima-asamblea_351410)).
- Se inspira en GRI y en la Agenda 2030.
- Mide diez dimensiones. Entre ellas están la ambiental, la comunitaria y la de infraestructura.

Lo que más articula con lo que ya hacen es entregarles los datos del programa ordenados en su propio marco.

## Qué es

En el informe para la Comisión Directiva (`/comercio/informe`) entra una sección nueva, **«Para el Reporte de Sustentabilidad de <institución>»**. Va antes de «Lo que sigue» y sale también al imprimir. Trae:

- **una tabla agrupada por dimensión**, con los nombres que usa el reporte del club;
- **la nota al pie**: «Ordenado según las dimensiones del Reporte de Sustentabilidad del club y alineado con los estándares GRI y la Agenda 2030. No es una verificación: el armado y la verificación del reporte son del club. En la demo, datos de ejemplo; en el piloto, los kilos salen de los pesajes que registra el club.»;
- **el botón «Descargar indicadores (CSV)»**, que no sale al imprimir.

| Dimensión | Indicador | Valor | Referencia |
|---|---|---|---|
| Ambiental | Plástico recuperado para reciclar | `<kg> kg (<t> t)` | GRI 306-4 · ODS 12.5 |
| Ambiental | Tapitas recuperadas | tapitas | GRI 306-4 (plástico) |
| Ambiental | Puntos de recolección (Punto R) | cantidad de Punto R de la institución | GRI 306-2 |
| Comunitaria | Hinchas que participaron este mes | usuarios activos | GRI 413-1 |
| Comunitaria | Aportes registrados | aportes | — |
| Comunitaria | Beneficios canjeados por la hinchada | canjes | — |
| Infraestructura | `<nombre del producto> (meta <kg> kg)` | `<juntado> de <meta> tapitas · <%>` | ODS 12.5 |

- La fila de infraestructura se repite, una por cada producto de la institución.
- Los valores salen de las mismas métricas del informe (`useMetricasDelPanel`, con lo de la sesión) y de los productos que ya muestra.
- No aparece ningún número nuevo.

## El CSV

- Tiene una fila por indicador, con las columnas dimensión, indicador, valor (el número), unidad y referencia.
- La primera línea es `AVISO_DE_EJEMPLO`, y el archivo lleva la marca BOM para que Excel lea los acentos, como el CSV de Reportes.
- Se llama `indicadores-reporte-sustentabilidad-<slug>.csv`.

## Reglas

- **Lo que se dice:** «alineado con GRI», nunca «certificado» ni «verificado».
- **Las referencias:** sólo las que encajan sin forzar:
  - **306-4:** residuos no destinados a eliminación;
  - **306-2:** gestión de los residuos;
  - **413-1:** programas con la comunidad;
  - **ODS 12.5:** reducir desechos mediante el reciclado.
- **Lo que no encaja:** donde no hay una referencia que encaje, va «—».

## Pruebas

- **La lógica es pura** y vive en `src/lib/reporteSustentabilidad.ts`:
  - las filas, en orden y con sus valores;
  - kg y toneladas;
  - una fila por producto;
  - el CSV, con su BOM, el aviso y las columnas.
- **La página:**
  - el título con el nombre de la institución;
  - las tres dimensiones;
  - una fila con su valor y su referencia;
  - la nota;
  - el botón descarga el CSV y no sale al imprimir.
