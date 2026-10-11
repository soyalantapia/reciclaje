# El mapa de Córdoba y tres retoques de la app del hincha

Diseño aprobado por Alan el 11/10/2026 («Dale con todo»), para la reunión con Talleres del martes 13/10.

## Lo que pidió Alan

1. «No me gusta el fondo con una celda pintada y la otra sí y la otra no»: las franjas del césped.
2. «Cuando toco inicio o mapa o beneficios o perfil o escanear que haga alguna animación el icono».
3. «El fondo negro de pasate a premium ponelo en otro color más claro».
4. «El mapa hacé que cargue más rápido, que sea todo de Córdoba capital y poné todo ejemplos válidos de Nueva Córdoba y los centros».
5. «Hacé que el mapa sea más interactivo».

## 1. El césped sin franjas

- `.bg-cancha` (`src/index.css`) deja de pintar franjas alternadas (`repeating-linear-gradient`).
- Pasa a un verde liso, con un degradé muy suave de arriba (`--cancha-claro`) hacia abajo (`--cancha-oscuro`).
- Cambia en todos los lugares que lo usan: el banco del inicio, el proyecto, el recorrido, el festejo y los productos del panel.
- La línea de cal de arriba queda.

## 2. Los íconos de la barra de abajo se mueven

En `BottomNav`, con `framer-motion`, que ya está en el proyecto:
- Al apretar un ícono, se achica (`scale` 0,85).
- Al quedar elegido, rebota: sube unos píxeles y crece un poco, y vuelve.
- Escanear, el botón del medio, hace un pulso.
- Con «reducir movimiento» del sistema (`useReducedMotion`), no se anima.
- La navegación y la accesibilidad (`aria-label`, el enlace activo) quedan igual.

## 3. «Pasate a Premium» sin negro

- La tarjeta (`src/pages/Profile.tsx`) deja el degradé `ink-800 → ink-900` con texto blanco.
- Pasa a un dorado claro: degradé `xp-50 → xp-100` con borde `xp-200`, título y corona en `xp-700` y texto oscuro.
- En modo oscuro, un ámbar apagado.
- El botón «Probar Premium» sigue en ámbar, y la nota «Demo: no se cobra.» se mantiene.

## 4. El mapa de Córdoba, rápido

### Un mapa de verdad

- **La librería:** Leaflet (`leaflet` 1.9 y `react-leaflet` 5), con las teselas del estilo claro de CARTO sobre OpenStreetMap. La atribución es obligatoria: «© OpenStreetMap © CARTO».
- **La vista inicial:** el Centro y Nueva Córdoba. «Ver todos» encuadra todos los puntos, también el del estadio.
- **Los pines:** un círculo del color de la marca, con un ícono según el tipo de punto. El elegido se agranda.
- **El costo:** unos 45 kB comprimidos. Sólo se bajan con la pantalla del mapa.
- **Para el piloto:** con tráfico real hace falta un proveedor de teselas con plan comercial (MapTiler, Mapbox o CARTO pago). Para la demo alcanza con el gratuito.

### Todos los puntos en Córdoba capital

- Cada punto de ejemplo va donde de verdad hay un local de su rubro según OpenStreetMap (consultado el 11/10/2026): el negocio es de ejemplo, el lugar es real.
- Una sola tabla de ubicaciones (`src/services/mocks/data.ts`) sirve a las dos demos: la del club cambia los nombres de las marcas con el reemplazo que ya tiene (`MARCAS_DE_EJEMPLO`).

| id | Demo general | Demo del club | Dirección | lat, lng |
|---|---|---|---|---|
| `p_ypf_libertador` | YPF Bv. Perón | Norte Energía Bv. Perón | Bv. Perón, Centro | -31.418470, -64.176348 |
| `p_ypf_cabildo` | YPF San Luis | Norte Energía San Luis | San Luis, Güemes | -31.422153, -64.189875 |
| `p_ypf_pana` | YPF Humberto Primo | Norte Energía Humberto Primo | Humberto Primo, Centro | -31.409436, -64.184583 |
| `p_muni_plaza` | Punto Verde Plaza de la Intendencia | (no está) | Plaza de la Intendencia, Centro | -31.417111, -64.191230 |
| `p_lumen_palermo` | Café Lúmen Nueva Córdoba | Café Lúmen Nueva Córdoba | Ituzaingó 1202, Nueva Córdoba | -31.430756, -64.187332 |
| `p_mcdonalds_palermo` | McDonald's Nueva Córdoba | Burger Plaza Nueva Córdoba | Obispo Trejo 1154, Nueva Córdoba | -31.428794, -64.190979 |
| `p_starbucks_recoleta` | Starbucks Nueva Córdoba | Café Andino Nueva Córdoba | San Lorenzo 25, Nueva Córdoba | -31.423175, -64.186960 |
| `p_grido_lanus` | Grido Bv. San Juan | Helados del Parque Bv. San Juan | Bv. San Juan 125, Nueva Córdoba | -31.420568, -64.187765 |
| `p_club_estadio` | Punto R · Estadio | Punto R · Estadio | Estadio Mario Alberto Kempes, ingreso principal en días de partido | -31.368847, -64.246145 |
| `p_club_sede` | Punto R · Sede social | Punto R · Sede social | Rosario de Santa Fe 15, frente a la Plaza San Martín | -31.415995, -64.183657 |

- **Los ids no cambian:** los QR impresos y los enlaces siguen andando.
- **El tipo:** `RecyclePoint` cambia `x`/`y` (el mapa esquemático) por `lat`/`lng`. `city` pasa a ser `'Córdoba'` en todos.
- **La sede de Talleres:** la dirección sale de fuentes públicas (Guía Senior e Infonegocios: frente a la Plaza San Martín). Hay que confirmarla con el club.
- **El estadio:** es el Kempes, donde el club juega de local.

### Lo que deja de estar en Buenos Aires en la demo general

- **Los puntos:** los de la tabla.
- **La ciudad de los beneficios:** `Córdoba`.
- **El municipio:** «Municipio de Vicente López» pasa a «Municipio de ejemplo» (slug `municipio-de-ejemplo`). No va «Municipalidad de Córdoba», porque parecería que ya trabaja con ReciclaXP.
- **El historial del hincha** (el `pointName` de los aportes) y las métricas por punto usan los nombres nuevos.
- **Las causas** (Hospital de Niños, comedor, escuela) no van en el mapa y quedan como están.

### Que cargue rápido

- **Sin esperar a los datos:** el mapa se dibuja enseguida y los pines aparecen cuando llegan los puntos. No queda el esqueleto gris tapando el mapa.
- **La pantalla, precargada:** mientras el hincha está en la app, en un momento libre (`requestIdleCallback`, o `setTimeout` si no está), se baja el código del mapa.
- **Las teselas:** `index.html` hace `preconnect` a los servidores de CARTO.
- **Sin internet:** se ven los pines sobre un fondo liso. La lista sigue andando.

### La versión de los datos

- **Sube a 3** (`VERSION_DE_LOS_DATOS`), porque cambian los nombres de los puntos que guarda el historial de la sesión.
- **Cada navegador arranca la demo de cero una vez,** y eso incluye la marca del club que se haya cargado.

## 5. El mapa interactivo

- **Moverse:** arrastrar y hacer zoom con los dedos o la rueda.
- **Tocar un pin** abre una tarjeta sobre el mapa con:
  - el nombre, la dirección y de quién es;
  - qué materiales recibe, y si está abierto ahora;
  - la distancia, si se sabe dónde estás;
  - «Cómo llegar»: abre Google Maps con el destino (`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`) en otra pestaña;
  - «Reciclar acá»: como el inicio, deja el punto pendiente (`sessionStorage`, clave `claveDeAlmacenamiento('scan-point')`) y va a Escanear, con el punto ya elegido;
  - una cruz para cerrarla.
- **Filtros, como chips arriba del mapa:**
  - «Abiertos ahora»;
  - uno por cada material que aparece en la red.

  Filtran el mapa y la lista juntos. Si no queda ningún punto, lo dice y ofrece «Ver todos».
- **«Cerca mío»:** pide la ubicación del navegador y la muestra en el mapa. Ordena la lista por distancia y escribe la distancia en cada punto: «a 350 m», «a 1,2 km».
  - Si se niega el permiso o falla, lo dice sin romper nada.
  - Si la ubicación queda a más de 50 km del centro de Córdoba, lo avisa y no mueve el mapa.
- **«Ver todos»:** encuadra todos los puntos.
- **La lista y el mapa van juntos:** tocar un punto de la lista lo elige y el mapa vuela hasta su pin. Elegir un pin marca su tarjeta en la lista.
- **El orden:** primero los abiertos; con ubicación, por distancia.

## Cómo se parte

- `src/lib/mapa.ts` es lógica pura y se prueba sola: filtros, distancia, orden, enlace de «Cómo llegar», texto de la distancia y los recuadros.
- `src/components/features/MapaDeCordoba.tsx` es el componente de Leaflet: pines, recuadros, volar al elegido y la ubicación. En las pruebas de la página se reemplaza.
- `src/pages/MapPoints.tsx` es la pantalla: chips, tarjeta, «Cerca mío», «Ver todos» y la lista.

## Pruebas

- **Lógica:**
  - el filtro por abierto y por material;
  - la distancia (Haversine) entre dos lugares conocidos;
  - el orden por abierto y por distancia;
  - el enlace de Google Maps;
  - el texto de la distancia en metros y en kilómetros.
- **Datos:**
  - todos los puntos de las dos demos tienen `lat`/`lng` adentro de Córdoba capital, y `city` es `'Córdoba'`;
  - no quedan nombres de Buenos Aires en los puntos ni en los beneficios;
  - la demo del club usa los nombres de ejemplo;
  - los ids no cambian.
- **La página, con el mapa reemplazado:**
  - elegir de la lista elige el pin;
  - la tarjeta muestra lo que tiene que mostrar, y sus enlaces van a donde tienen que ir;
  - los chips filtran;
  - «Cerca mío» con permiso ordena y muestra distancias, y sin permiso lo dice;
  - sin puntos que cumplan el filtro, lo dice.
- **El retoque visual:**
  - `.bg-cancha` ya no tiene `repeating-linear-gradient`;
  - la tarjeta de Premium no usa `ink-800` ni `ink-900`;
  - la barra de abajo sigue navegando, con sus etiquetas.
