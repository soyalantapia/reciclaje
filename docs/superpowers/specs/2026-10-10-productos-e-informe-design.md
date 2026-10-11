# El club elige qué construye su hinchada (E1.3) y el informe para la Comisión Directiva (E4.2)

Diseño aprobado por Alan el 10/10/2026 para la reunión con Talleres del martes 13/10. Las dos piezas
muestran, en la demo, dos entregables del piloto (`docs/producto/desglose-piloto.md`): E1.3, el
producto del club con meta en kilos y su Punto R, y E4.2, el informe del piloto para la comisión
directiva.

## Reglas que no se negocian

- No aparecen números nuevos. Todo sale de los datos de ejemplo que ya existen o de una cuenta
  que ya usa la demo: 238 tapitas por kilo (`src/lib/metrics.ts`).
- Ningún texto dice «en vivo» ni «tiempo real», y ninguna fecha se inventa. Un producto nuevo no
  tiene fecha estimada: dice «A definir».
- No se usan los colores ni el escudo del club.
- Cada pantalla sigue mostrando «Demo · los números son de ejemplo». El informe impreso lleva
  `AVISO_DE_EJEMPLO` arriba y «Datos de ejemplo de la demo» al pie.
- Lo que el club publica vive en el navegador, como los beneficios que crea: lo ven el panel y la
  app del hincha abiertos en el mismo navegador, aunque estén en dos pestañas.

## E1.3 · Productos del club

### En el panel: «Productos»

- El menú suma «Productos», sólo para instituciones (`esInstitucion`): un club o un estadio. Un
  comercio no lo ve, y si entra a `/comercio/productos` vuelve al resumen.
- La pantalla lista los productos del club:
  - el banco de suplentes del seed;
  - los publicados desde el panel, con la marca «Nuevo».
- Cada producto muestra:
  - su dibujo de tapitas con el avance;
  - el título;
  - la meta en kilos y en tapitas;
  - en qué Punto R junta;
  - las tapitas juntadas y el porcentaje.

  Los publicados desde el panel tienen además «Eliminar».
- «Nuevo producto» abre un formulario con:
  - **Forma**, elegida entre cuatro tarjetas con su dibujo:
    - Banco de suplentes, con el nombre propuesto «Banco de suplentes visitante»;
    - Butacas, con «Butacas para la platea»;
    - Arco para las inferiores, con «Arco para las inferiores»;
    - Otro, sin nombre propuesto.

    La forma elegida de entrada es Butacas.
  - **Nombre**, obligatorio.
  - **Meta en kilos**, 500 de entrada. Debajo dice cuántas tapitas son, a 238 por kilo.
  - **Punto R**, un `<select>` nativo con los puntos del club. De entrada va el último, la Sede
    social, porque el estadio junta para el banco. Debajo explica que lo que la hinchada deje ahí
    suma a este producto.
  - El botón **«Publicar para la hinchada»**. Si ese Punto R ya junta para otro producto del panel,
    no publica y dice por qué: un producto abierto por punto.

### El producto

Un producto publicado desde el panel es un `ImpactProject` con estos valores:

| Campo | Valor |
|---|---|
| `title` | el nombre que se cargó |
| `goalUnits` | kilos × 238 |
| `collectedUnits`, `myContributionUnits` | 0 |
| `estimatedDate` | `''` |
| `illustration` | `'bench'` |
| `forma` | `'banco'`, `'butacas'`, `'arco'` o `'libre'` |
| `puntoId` | su Punto R |
| `creadoEn` | cuándo se publicó |
| hitos | los cuatro del banco, sin hacer |
| `topContributors` | vacío |

Con `illustration: 'bench'` usa todo lo que ya existe para el banco: el festejo, el recorrido de
la tapita y el banco de la hinchada. `forma` decide el dibujo.

### Adónde va un aporte

Un aporte en un Punto R va a uno de dos destinos:
- el producto más nuevo publicado para ese punto;
- si no hay ninguno, el del club, como hasta hoy.

Los aportes de antes no cambian de producto.

### El dibujo de tapitas

`BancoDeTapitas` suma la prop `forma`. Las 80 tapitas (16 × 5) se llenan igual en las cuatro
formas, de abajo hacia arriba; lo que cambia es el contorno:

| Forma | Contorno |
|---|---|
| banco | el de hoy: asiento y dos patas |
| butacas | respaldos separados cada cuatro columnas, cuatro asientos, larguero y patas |
| arco | palos y travesaño alrededor de las tapitas, y la línea del arco |
| libre | un marco redondeado con su base |

Ninguna tapita se sale del dibujo. La etiqueta accesible nombra la forma: «Butacas de tapitas:
N de 80 encendidas».

### Lo que ve el hincha

- **Inicio.** Si el club tiene más de un producto, arriba del banco de la hinchada aparecen
  pestañas con el nombre de cada uno:
  - el banco queda elegido de entrada y sigue en su 14 %;
  - los productos nuevos llevan «nuevo»;
  - con un producto nuevo elegido, «Sumá tus tapitas» abre el escáner con su Punto R ya elegido.
- **Festejo.** El rótulo y la frase nombran el producto: «Tus 50 tapitas ya suman a «Butacas para
  la platea»». El banco del club sigue diciendo «al banco de la hinchada».
- **Lista del banco de la hinchada.** Se titula «La hinchada que suma» para un producto nuevo y
  «La hinchada en el banco» para el banco.
- **Recorrido.** Son las mismas siete etapas, con el nombre del producto, y ninguna está hecha.
  - Antes del primer aporte dice «Tu tapita todavía no entró a este recorrido».
  - Después del primer aporte marca «Tu aporte».
- **Página del proyecto.** Muestra el dibujo con su forma y la fecha «A definir».

## E4.2 · Informe para la Comisión Directiva

Es una página del panel en `/comercio/informe`, sólo para instituciones (un comercio vuelve a
Reportes). Se llega desde una tarjeta en Reportes. Usa sólo datos que el panel ya tiene, con lo
que la hinchada hizo en esta sesión.

### Lo que lleva

1. **Encabezado.**
   - «Informe para la Comisión Directiva», el nombre del club y la fecha de emisión (hoy).
   - `AVISO_DE_EJEMPLO`.
2. **En números.**
   - Kilos recuperados, tapitas, aportes, hinchas que participaron este mes y beneficios
     canjeados.
   - La Huella Verde y el puesto en la red.
3. **Lo que construye la hinchada.** Cada producto con:
   - su dibujo;
   - lo juntado, la meta y el porcentaje;
   - en qué Punto R junta;
   - la etapa actual.
4. **Partido por partido.**
   - La tabla con sus columnas: partido, fecha, kilos, tapitas e hinchas.
   - Sin ningún número: una fila dice «Se completa con el pesaje de cada partido, desde la etapa
     1 del piloto.»
5. **Aportes por mes y por Punto R.** Barras con el valor escrito, para que se lea en papel.
6. **Los que más aportan.** Los cinco primeros, sumando todos los productos del club.
7. **Lo que sigue.**
   - La próxima etapa del recorrido del banco y quién la hace.
   - Las cuatro etapas del piloto: preparación (días 1 a 20), lanzamiento controlado (21 a 35),
     operación en partidos (36 a 75) y evaluación y decisión (76 a 90).
8. **Pie.** «Datos de ejemplo de la demo».

### Imprimir

- «Imprimir o guardar PDF» llama a `window.print()`. «Descargar CSV» baja el mismo CSV que
  Reportes.
- Al imprimir:
  - no salen el menú, el encabezado del celular, el aviso de la demo ni los botones (atributo
    `data-no-imprimir`);
  - las secciones no se cortan entre páginas;
  - las barras se imprimen con su color;
  - el informe sale en claro aunque la app esté en modo oscuro.

### Las mismas métricas

El cálculo de las métricas del panel con la sesión hoy está copiado en el resumen y en Reportes.
Pasa a un hook, `useMetricasDelPanel`, que usan el resumen, Reportes y el informe: los tres
muestran los mismos números.

## Fuera de alcance

- Un servidor, otros dispositivos o la carga de pesajes. Eso es E1.4.
- Elegir el producto al escanear. Eso es E3.2, y acá cada punto tiene un solo producto.
- Editar un producto publicado o ponerle fecha.
- Ventanas de otro tamaño para el informe.

## Pruebas

- **La lógica de los productos es pura y tiene pruebas:** crear, kilos de la meta, adónde va un
  aporte, el recorrido, el destino del festejo, los puntos de cada producto y el top de la
  hinchada.
- **El simulador tiene pruebas con `getResponse` de MSW:** los proyectos con los creados, el
  recorrido de uno creado y un aporte en su Punto R.
- **Cada pantalla tiene pruebas con Testing Library:**
  - las formas del dibujo, incluida la de que ninguna tapita se sale;
  - el festejo, el recorrido y la fecha «A definir»;
  - el menú;
  - la pantalla «Productos», incluido publicar;
  - las pestañas del inicio;
  - el informe: sus secciones, «Partido por partido» sin números y el botón de imprimir.
- **En el navegador:**
  - crear un producto, verlo en el inicio y aportar en su punto;
  - ver el festejo y el recorrido;
  - ver el informe en pantalla y como impresión;
  - todo a 390 y 1280 px, en modo oscuro y con movimiento reducido.
