# Día de cancha · rediseño de los momentos clave

**Fecha:** 10/10/2026 · **Para:** la reunión con Talleres del martes 13/10 · **Rama:** `feat/dia-de-cancha`

## Objetivo

Que la demo emocione. Hoy es prolija pero se ve como cualquier app de puntos. Lo que la frena:
- el banco que construye la hinchada es un dibujo gris y quieto, completo aunque vaya al 14 %;
- el momento del aporte es un tilde y «+100 XP»;
- no se siente la cancha;
- el panel del club es un tablero administrativo donde no aparecen ni el banco ni la hinchada.

## Decisiones tomadas con Alan

- **Alcance A:** los cuatro momentos de mayor impacto, para el martes, sin tocar los circuitos ya verificados.
- **Dirección B, «Día de cancha»:** luminosa y fresca, con césped y líneas de cal.
- **Opción 1:** los cuatro momentos rediseñados a fondo, más una capa de cancha en toda la app (detalles, sin cambiar la estructura de las demás pantallas).

## Fuera de alcance

- Colores y escudo del club: esperan su permiso escrito.
- La estructura de las pantallas que no son los cuatro momentos.
- La navegación.
- El servidor.
- Datos nuevos: ningún número sale de algo que no exista hoy.
- La palabra «en vivo» y los horarios inventados. Se sacaron de la demo por no poder sostenerlos y no vuelven.

## Sistema visual

**Tokens nuevos** en `src/index.css`, con valores para claro y oscuro:
- `--color-cancha-claro` y `--color-cancha-oscuro`: los dos verdes de las franjas de césped.
- `--color-cal`: el blanco de las líneas.
- `--font-marcador`: **Barlow Condensed**, pesos 600 y 700, cargada desde Google Fonts junto a Plus Jakarta Sans. Se usa sólo para números grandes: tapitas, porcentajes y XP.

**Tus tapitas en ámbar.** En el banco, las tapitas de la hinchada van en verde (`eco`) y las de la persona en ámbar (`xp`).

## Piezas nuevas

### Lógica pura, con pruebas

**`src/lib/bancoDeTapitas.ts`**
- `tapitasEncendidas(progreso: number, total: number): number`. Recibe `progreso` entre 0 y 1.
  - En 0 da 0.
  - Si es mayor que 0, da al menos 1. Así un avance chico nunca se ve vacío por redondeo.
  - En 1 o más da `total`.
  - En los demás casos, redondea `progreso × total`.
- `estadosDelBanco({ total, progreso, propias }): EstadoTapita[]`.
  - `propias` es la parte del avance que aportó la persona, entre 0 y 1.
  - Devuelve, para cada tapita en orden de llenado (de abajo hacia arriba, de izquierda a derecha), `'vacia' | 'hinchada' | 'tuya'`.
  - Las tuyas son las últimas encendidas, así quedan arriba, a la vista.
  - Si la persona aportó algo, tiene al menos una tuya.

**`src/lib/ultimosAportes.ts`**
- `ultimosAportesDeLaHinchada(proyecto, actividad, nombreDelUsuario)`.
  - Primero, los aportes de la persona en esta sesión a ese proyecto, con su hora real.
  - Después, los que más aportaron al proyecto (`topContributors`), como acumulado: «Facu R. lleva 3.120 tapitas». No dice «dejó» ni «hace 2 min».
  - Como mucho 5.

### Componentes

En `src/components/features/`:

| Pieza | Props | Qué hace |
|---|---|---|
| `BancoDeTapitas` | `progreso`, `propias`, `animarTuyas?`, `className?` (el ancho lo da el contenedor) | Dibuja en SVG el banco: respaldo hecho de tapitas (16 × 5), asiento y patas de contorno. Con `animarTuyas`, las tapitas de la persona entran cayendo. Un aporte de 50 sobre una meta de 300.000 no enciende otra tapita del dibujo: lo que se anima es la tuya |
| `Marcador` | `valor`, `etiqueta`, `desde?` | Número grande en `--font-marcador`, con su etiqueta. Con `desde`, cuenta de un valor al otro |
| `Cancha` | `children`, `className?`, `conLinea?` | Fondo de franjas de césped, opcionalmente con una línea de cal |
| `UltimosAportes` | `items` | La lista de `ultimosAportesDeLaHinchada` |

Todas respetan `useReducedMotion()`: con movimiento reducido no se anima nada y se ve el estado final.

## Los cuatro momentos

### 1 · Inicio del hincha (`src/pages/Home.tsx`)

Arriba de todo va el **banco de la hinchada**, sobre `Cancha`:
- el `Marcador` de tapitas y el porcentaje;
- el `BancoDeTapitas`;
- `UltimosAportes`;
- el botón «Sumá tus tapitas», que va a escanear.

Usa el primer proyecto con meta (el del club), con `conAportesDeLaSesion`.

La billetera de XP baja debajo del banco, igual que hoy. El botón «Escanear un aporte» se va: lo reemplaza el del banco, y en la barra de abajo sigue «Escanear». Causas, marcas, ranking y actividad quedan donde están.

### 2 · Proyecto (`src/pages/ImpactProjectPage.tsx`)

- **Encabezado:** `Cancha`, el `BancoDeTapitas` grande y el `Marcador` («42.840 de 300.000»).
- **Hitos:** van como una línea de cal, con la etapa actual marcada.
- **Top aportantes:** se muestran como «Los titulares de la hinchada», con la persona destacada en ámbar.

### 3 · Festejo del aporte (pantalla de éxito de `src/pages/Scan.tsx`)

La secuencia dura unos 2 segundos:
1. Las tapitas del aporte entran al banco y se encienden en ámbar.
2. El `Marcador` sube del total anterior al nuevo, por ejemplo de 42.840 a 42.890.
3. Aparece «+100 XP» estilo tablero y «Tus 50 tapitas ya suman al banco de la hinchada». Dice «suman» y no «están» porque falta el pesaje del lote.
4. Siguen los botones de siempre: ver el proyecto, la trazabilidad y escanear otro.

Tocar la pantalla salta al estado final. Con movimiento reducido, se ve todo quieto.

**Fuente de los datos:** el resultado del aporte (`result`) y el proyecto con los aportes de la sesión. El total anterior es el actual menos las unidades del aporte.

### 4 · Panel del club (`src/pages/commerce/CommerceResumen.tsx`)

Arriba del resumen va «El banco de tu hinchada»:
- `Cancha`, el `BancoDeTapitas` y el `Marcador` con el avance;
- `UltimosAportes`;
- los cinco que más aportaron.

Sólo aparece si el comercio o la institución tiene un proyecto (`getProjects` filtrado por `sponsorId`). En la demo general, McDonald's no lo tiene y su panel no cambia. Los indicadores y gráficos de hoy quedan debajo, sin cambios.

## La capa de cancha en el resto

- Los números grandes que ya existen pasan a `--font-marcador`: la billetera de XP, los indicadores del panel y el XP del ranking.
- Nada más cambia de estructura.
- Las líneas de cal se usan sólo sobre césped (`Cancha`), porque sobre el fondo claro no se ven.

## Reglas que se mantienen

- El aviso «Demo · los números son de ejemplo» va en cada pantalla.
- No se usan colores ni escudo del club, ni marcas reales en la demo del club.
- Lo que el hincha hace se ve en el panel del mismo navegador (`metricasConLaSesion`), y el banco del panel usa los mismos números.
- `grid-cols-1` de base en toda grilla nueva: lo vigila `src/lib/grillas.test.ts`.

## Verificación

- **Pruebas unitarias:**
  - `tapitasEncendidas`: 0, casi cero, 14 %, 100 % y más de 100 %;
  - `estadosDelBanco`: las tuyas al final, al menos una si aportaste, la suma correcta;
  - `ultimosAportesDeLaHinchada`: lo de la sesión primero, el acumulado después y el tope de 5.

  Medidas en rojo antes de implementar.
- **La suite completa, `tsc -b` y el lint**, con los mismos avisos que main.
- **Recorrido en el navegador**, sobre el build local de las dos demos:
  - a 390 y 1280 px, sin desborde;
  - con movimiento reducido;
  - en modo oscuro;
  - el festejo de punta a punta: el marcador pasa de 42.840 a 42.890 y el panel muestra el mismo banco.

## Publicación

1. Capturas de los cuatro momentos y un video corto del festejo, para Alan.
2. **La demo del martes no cambia hasta el OK de Alan.** Con el OK, se publica por PR a `main`, con su deploy y verificación en producción, igual que los cambios anteriores.

## Riesgos

- **Que se rompa un circuito verificado.** Se mitiga con la suite completa y repitiendo los recorridos de los PR #13 a #20.
- **Que la fuente nueva cargue lenta.** Se mitiga con `display=swap` y sólo dos pesos.
- **Que el festejo moleste si se repite.** Se mitiga con el salto al tocar y la duración corta.
