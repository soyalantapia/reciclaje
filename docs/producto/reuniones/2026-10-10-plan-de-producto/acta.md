# Plan de producto · 2026-10-10 · reciclaxp

**Fuente:** grupo del proyecto con el socio industrial (18/06 al 22/09/2026), grupo interno de los socios de Xnod (08/10 al 10/10), tramos del chat de trabajo y del chat entre socios (03/07, 21/09 y 08/10), videollamada de los cuatro del 03/08 (31 minutos), un tramo de costos de otra llamada del 03/08, y cuatro adjuntos: la presentación general, el resumen ejecutivo para el club, una postulación a financiamiento y el mapa del piloto que armó el referente de la cámara empresarial.

**Panel:** cinco roles votando a ciegas y en paralelo (producto, CTO, back, front y seguridad), con dos rondas y una causa replanteada y revotada.

**Análisis parcial:** 51 audios del grupo con el socio industrial (junio a agosto) no se pudieron transcribir. Ver «Pérdida conocida».

## Dónde está el proyecto

- **La demo es la de mayo.** Hay app de la persona, landing de comercios y panel de comercio. Los datos son de ejemplo y viven en el navegador de cada uno, y no hay servidor. El último cambio de código y la última publicación son del 30/05.
- **El financiamiento por otra vía se cayó.** Lo confirmó el socio de producto el 10/10. Ahora se juega con un club de fútbol de Córdoba, que pidió reunirse el martes 13/10 al mediodía para contar sus iniciativas ambientales y ver cómo se articulan.
- **Lo que se le ofreció al club.** El resumen ejecutivo lo invita a sumarse como socio fundador e inversor. Su financiamiento completaría el desarrollo.
- **Lo que vuelve a pedir la cámara empresarial.** Si la reunión sale bien, mandar un plan piloto de 90 días, un acuerdo preliminar y un presupuesto de desarrollo desglosado.
- **Lo que promete el material comercial y la demo no hace:**
  - que la persona elija a qué producto va su material;
  - el certificado de RSE;
  - el ranking por producto con multiplicadores;
  - el panel de institución;
  - el pesaje.
- **Lo que sí existe y sólo hay que adaptar:**
  - el punto con su QR (es el Punto R sin ese nombre);
  - el premio-experiencia por sponsor;
  - el proyecto con meta y aporte individual;
  - la trazabilidad.

## Qué se decidió

| Causa | Decisión | Cómo se decidió | Condiciones principales |
|---|---|---|---|
| c5 · el producto quedó como en mayo y el martes hay que mostrar algo más | A: versión de demostración del caso club, aparte de la demo publicada | la más reversible tras la ronda 2 (4 a 1) | no pisa la demo vigente ni su almacenamiento; datos de ejemplo rotulados; sin escudo del club sin permiso; si no se muestra la app en vivo, alcanza con un recorrido guionado |
| c6 · el discurso promete más de lo que hay y los precios no coinciden | A: matriz de lo prometido contra lo que existe y una sola tabla de precios | unanimidad | una fila por promesa con su estado; nada marcado «falta» se presenta como hecho |
| c8 · no está definido qué recibe el club, la cámara ni los socios | A: página de posición escrita por los dos socios que van, antes del martes | la más reversible tras la ronda 2 (5 a 0, con un veto) | el martes no se ofrece participación societaria ni se cierra ningún monto; la titularidad del código no se negocia; lo que queda sujeto al socio ausente, marcado |
| c7 · hay que mandar plan, acuerdo y presupuesto y no hay entregables ni costos | A: presupuesto por entregable alineado a las cuatro etapas del piloto, con pago contra entrega | la más reversible tras la ronda 2 (5 a 0, con un veto) | criterio de aceptación comprobable por entregable; operación separada del desarrollo; cláusula de datos de los hinchas; acuerdo no vinculante hasta la firma |
| c1 · no hay servidor ni datos reales | C: no construir servidor hasta firmar; es el primer entregable de la etapa 1 | la más reversible tras la ronda 2 (5 a 0, con vetos a no hacer nada) | ningún hincha usa la app hasta que un aporte cargado en un celular se vea en otro dispositivo; el servidor calcula XP, saldo y kilos; login por institución; ningún secreto en el repo |
| c3 · la propuesta para clubes pide funciones que la demo no tiene | D: un producto abierto por punto, salvo que el club confirme dos o más a la vez, en cuyo caso la persona elige | replanteada y revotada; la más reversible tras la ronda 2 (3 a 2 entre dos opciones casi iguales) | la constancia sale sólo de datos registrados; elección, ranking por producto y multiplicadores como segunda fase con su costo; no se cobra como nuevo lo que ya existe |
| c2 · el aporte cuenta unidades y el piloto mide kilos | A: pesaje manual por lote y por partido, cargado desde el panel | unanimidad | los kilos de reportes salen sólo de los pesajes; carga autenticada y con registro de quién; el hincha no espera un pesaje |
| c4 · nadie decidió si el club va con su marca o con la de la app | A: una sola app con el espacio del club adentro | la más reversible tras la ronda 2 (4 a 1) | logo y color como datos de la institución; nada del club publicado sin su permiso escrito |

## Promesas nuestras

- **Encarar la app para la reunión del martes** · dueño: el socio de producto · plazo: 13/10.
- **Volver a montar el entorno donde trabajaba y mostrárselo al socio de ventas** · dueño: el socio de producto · plazo: 09/10. No consta que se haya hecho.
- **Juntarse el lunes para definir qué recibe el club** · dueños: los dos socios que van · plazo: 12/10.
- **Información, presentación y proyecciones para el martes** · dueño: el socio de ventas · plazo: 13/10.
- **Plan piloto, acuerdo preliminar y presupuesto desglosado** · dueños: el socio de ventas con el de producto · plazo: después del 13/10, si la reunión sale bien.
- **Las tres presentaciones que pidió un posible inversor ángel el 03/08:** la de ReciclaXP se entregó el 04/08; las otras dos quedaron sin objeto.

## Preguntas abiertas

**Al club o a la cámara**, ordenadas por cuántas tareas destraban:

1. **¿El club va a tener dos o más productos abiertos a la vez en un mismo punto?** Si la respuesta es sí, la persona elige el producto (T10); si es no o no hay respuesta, un producto por punto (T9).
2. **¿El club o la cámara quieren ver datos reales antes de firmar, por ejemplo una prueba en un partido?** Si quieren, el servidor se construye antes de firmar (T7, T8, T9, T11); si no, después.
3. **¿Quién pesa el material, con qué y cuándo?** ¿La maquinaria del socio industrial trae balanza con salida de datos? Si la trae, la balanza se integra en el punto; si no, el pesaje es manual (T8).
4. **¿El club quiere su marca o su espacio dentro de la app?** ¿Autoriza usar su escudo y sus colores? (T3, T11)
5. **¿El martes se muestra la app en vivo o la reunión es para escuchar al club?** Si es para escuchar, alcanza con un recorrido guionado (T3).
6. **¿Quién es responsable de los datos de los hinchas durante el piloto?** ¿Alcanza con un alias o se piden datos personales? (T6, T7)

**Entre los socios:**

1. **¿Quién es el titular del código y quién firma por ReciclaXP?** El código está hoy en un repo público de una cuenta personal. (T4, T6)
2. **¿Qué dice exactamente la propuesta que el club ya recibió?** ¿Quién puso la primera parte del aporte? Dos audios lo cuentan distinto. (T4)
3. **¿Qué era el servidor que se cayó y tenía datos?** (T12, T7)
4. **¿Quién rehace la planilla de proyecciones, que no abre bien?** (T6)
5. **¿El documento de RSE se va a llamar certificado y quién lo firma?** (T9)
6. **¿Cuál es la tabla de precios que rige para comercios, instituciones y Premium?** (T2)

## Lo que no entra en este plan

- **Bloqueado hasta que decidan los socios:**
  - el reparto de participación entre socios y la regla de dilución;
  - cuánto invertiría la empresa de logística de residuos;
  - el inversor que el socio industrial iba a presentar;
  - el recupero de lo que ya se invirtió en la demo;
  - el aporte inicial de cada socio;
  - la aprobación del socio industrial, que vuelve el 19.
- **Backlog:**
  - el panel de logística que pediría la empresa de logística de residuos;
  - el informe de composición y reciclabilidad para sus clientes;
  - la integración con sus sistemas;
  - una app propia para un gremio con ReciclaXP adentro;
  - Premium para usuarios;
  - otros segmentos (estaciones, universidades, municipios);
  - un modelo replicable en otros clubes.
- **Descartado o ya hecho:**
  - el financiamiento por la otra vía, que se cayó;
  - la presentación de la cámara y el folleto para la comisión directiva;
  - el resumen ejecutivo enviado al club;
  - el grupo interno;
  - el concurso que vencía en agosto.

## Pérdida conocida

- **51 audios del grupo con el socio industrial, del 18/06 al 05/08, sin transcribir.** Sólo vuelven exportando el chat desde un teléfono con los archivos adjuntos. La re-vinculación del 10/10 recuperó los 10 audios del 08/10.
- **Tres páginas del pitch** (una página resumen, comercios e inversores) **y la planilla de proyecciones** no están disponibles.
- **Dos capturas de los sistemas de la empresa de logística y un video**, tampoco.
- **Varias transcripciones automáticas salieron marcadas como dudosas.** Entre ellas, las de los montos del 08/10 y del 10/10.
