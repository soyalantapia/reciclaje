# Reportes abre el informe, y el club carga su marca en el panel

Diseño aprobado por Alan el 11/10/2026 («Continua con todo»), para la reunión con Talleres del martes 13/10.

## 1. Reportes abre el informe

### Lo que pidió Alan

«En la parte de reportes que me deje ver el informe perfecto y adentro que aparezca descargar en pdf o csv».

### Lo que cambia

- **Reportes es el informe.** Para una institución (club o estadio, `esInstitucion`), `/comercio/reportes` muestra el informe para la Comisión Directiva, sin la tarjeta intermedia. Para un comercio sigue el «Reporte de impacto» de siempre.
- **Los botones, arriba del informe:**
  - «Descargar PDF» (el principal) abre la ventana de impresión del navegador, donde se elige «Guardar como PDF». Es el PDF A4 de 3 hojas que ya está verificado, con texto nítido que se puede seleccionar. Se descartó generar el archivo en el navegador: el texto queda como imagen, los cortes de hoja hay que resolverlos a mano y suma una librería a dos días de la reunión.
  - «Descargar CSV» baja el mismo CSV de hoy (`csvDelReporte`).
  - Desaparece el link «← Reportes»: el informe ya es Reportes.
- **La dirección vieja sigue andando:** `/comercio/informe` redirige a `/comercio/reportes`. La tarjeta que llevaba ahí desaparece.
- **El aviso de la demo** sigue sin imprimirse en el informe, que trae el suyo arriba y al pie. Ahora el informe está en `/comercio/reportes` cuando la sesión es de una institución, y `CommerceLayout` lo detecta así.

## 2. La marca del club, cargada en el panel

### Lo que pidió Alan

«Si es el comercio de talleres, pongamos los colores en toda esa página de ellos y el logotipo de talleres así queda brandeada».

### La restricción

El repo y la dirección de la demo son públicos. En la corrida de la reunión quedó escrito, como condición de la decisión c4, que el escudo y los colores del club no se suben al repo ni a la dirección publicada sin permiso escrito del club. Por eso **el escudo y los colores no van en el código**: los carga quien usa el panel, y quedan guardados sólo en su navegador, como los beneficios y los productos de la demo.

### Qué es

- **«Marca» en el menú del panel**, sólo para una institución (como «Productos»), en `/comercio/marca`. Ahí:
  - «Subir el escudo»: PNG, JPG, SVG o WebP, hasta 2 MB. Se achica a 256 px de lado y se guarda en PNG.
  - **El color sale del escudo:** se toma el color con saturación más frecuente. Se puede cambiar con un selector de color.
  - **Se aplica al instante,** sin botón de guardar: el panel entero cambia de color mientras se mira.
  - «Volver a los colores de ReciclaXP» borra la marca.
  - La nota: «Se guarda sólo en este navegador: no se publica. El escudo y los colores son del club; usalos con su permiso.»
- **Dónde se ve:** en todo el panel de esa institución:
  - el escudo en lugar de la inicial, en la barra lateral y en el encabezado del celular;
  - los colores en botones, menú, destacados y gráficos;
  - en el informe, el escudo en el encabezado y los colores también en el PDF.
- **Dónde no:** en la app del hincha y en los paneles de otras marcas. Nada de esto se publica.

### Cómo funciona

- **Los tokens `eco-*` pasan por una variable** (`src/index.css`):
  - `:root` define `--eco-50` … `--eco-950` con los mismos valores de hoy.
  - `@theme inline` apunta cada `--color-eco-*` a su variable. Así `bg-eco-600` compila a `var(--eco-600)`.
  - Los valores no cambian. Cambia sólo el mecanismo, para que un contenedor pueda pisarlos. Es el «token del espacio» que pide la condición del front en c4.
- **`src/lib/marca.ts`** es lógica pura, con pruebas:
  - `paletaDeMarca(color)` devuelve los 11 tonos, con el color en el 600:
    - los claros, con `color-mix(in oklab, <color> N%, white)`;
    - los oscuros, con `color-mix(in oklab, <color> N%, black)`.
  - Si el color es tan claro que el texto blanco no se lee encima (contraste menor a 4,5:1), se oscurece hasta que se lea.
  - `estiloDeMarca(color)` devuelve las variables `--eco-*` listas para el `style` de un contenedor.
  - `colorDominante(pixeles)` recibe los bytes RGBA de una imagen y devuelve el color saturado más frecuente, o `null`. No cuenta lo transparente, lo blanco, lo negro ni lo gris.
- **`src/lib/escudo.ts`** usa el navegador, y en las pruebas se reemplaza: `prepararEscudo(archivo)` lee el archivo, lo dibuja en un canvas de hasta 256 px y devuelve `{ escudo, color }`. `escudo` es una data URL PNG y `color` sale de `colorDominante`. Si el archivo pasa de 2 MB o no es una imagen, lo rechaza con un mensaje.
- **El store `src/store/marcaDelClub.ts`** guarda `{ [sponsorId]: { escudo?, color } }`:
  - usa `persist` con `claveDeAlmacenamiento('marca-del-club')` y `conVersionDeLosDatos`;
  - escucha `storage`, así otra pestaña del mismo navegador también lo ve.
- **`useMarcaDelPanel()`** devuelve `{ escudo, color, estilo }` si la sesión es de una institución con marca, o `null`. Con eso:
  - `CommerceLayout` pone `style={estilo}` en el contenedor del panel;
  - la barra lateral, el encabezado del celular y el informe muestran el escudo.

## Pruebas

- **Reportes:**
  - un club ve el informe con «Descargar PDF» y «Descargar CSV»;
  - «Descargar PDF» llama a la impresión, y los botones no se imprimen;
  - un comercio ve el reporte de impacto;
  - `/comercio/informe` lleva a `/comercio/reportes`;
  - el aviso de la demo no se imprime en el informe.
- **`marca.ts`:**
  - la paleta trae 11 tonos, con el color en el 600;
  - un color claro se oscurece hasta el contraste;
  - `colorDominante` encuentra el azul de un escudo azul y blanco sintético, y devuelve `null` en una imagen blanca o transparente;
  - `estiloDeMarca` devuelve las 11 variables.
- **El store:** guarda y borra por institución, y persiste con su clave.
- **La pantalla «Marca»:**
  - subir un escudo (con `prepararEscudo` reemplazado) lo guarda con su color;
  - el selector cambia el color;
  - «Volver a los colores de ReciclaXP» borra la marca;
  - un comercio no la ve.
- **Dónde se aplica:** con una marca guardada:
  - el contenedor del panel lleva `--eco-600` con el color;
  - la barra lateral muestra «Escudo de Talleres»;
  - el informe muestra el escudo.
- **Sin marca,** todo sigue como hoy.
