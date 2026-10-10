# Lo prometido contra lo que existe en la demo

Corte: 10/10/2026 · código en `main` @ `81790ab` (demo publicada el 30/05/2026).

Fuentes de lo prometido: la presentación general, el resumen ejecutivo para el club, la postulación a financiamiento, el mapa del piloto de 90 días y la landing de comercios de la propia app.

**Estados**
- **Existe**: funciona en la demo; los datos pueden ser de ejemplo.
- **A medias**: está la pantalla pero con datos fijos, de una fórmula o sin validación real.
- **Falta**: no hay nada en el código.
- **Dejar de prometer**: hoy no se puede sostener y no está en el piloto.

**Esfuerzo** (con desarrollo asistido por IA): **S** = horas · **M** = 1 a 3 días · **L** = más de 3 días.

**Va en**: **demo** = la versión del caso club para la reunión · **piloto** = etapas 1 a 4 · **fase 2** = después del piloto.

## La persona que recicla

| Promesa | Estado | Dónde está | Qué falta | Esfuerzo | Va en |
|---|---|---|---|---|---|
| Escanear el QR del punto y registrar el aporte | A medias | `src/pages/Scan.tsx:44`, `:83`; lector de cámara en `src/components/features/QrScanner.tsx` | La cantidad la declara la persona, el estado «validado» es fijo (`src/services/mocks/handlers.ts:154`) y queda guardado sólo en su navegador | M | piloto |
| Punto R con su QR | A medias | El punto con QR para descargar e imprimir: `src/pages/commerce/CommercePoints.tsx:36-38` | Llamarlo «Punto R» | S | demo |
| Sumar XP de mérito y XP canjeables | A medias | `src/store/wallet.ts:44-57` | Se calcula en el navegador; en el piloto lo tiene que calcular el servidor | M | piloto |
| Canjear beneficios en comercios y recibir un cupón con QR | A medias | `src/services/mocks/handlers.ts:106-122` | El comercio no tiene cómo validar el cupón; el saldo se descuenta en el navegador | M | piloto |
| Elegir a qué producto va el aporte | Falta | Hoy el proyecto lo define el punto: `src/services/mocks/handlers.ts:139` | Elección al escanear, sólo si el club tiene dos o más productos a la vez | M | fase 2, o piloto si el club lo pide |
| Ver el producto con meta, barra de avance y aporte propio | A medias | `src/services/mocks/data.ts:239-266`, `src/components/features/ImpactProgress.tsx` | Los valores son fijos, la meta está en unidades y no en kilos, y la barra no se mueve con los aportes | M | demo (con ejemplo) y piloto (real) |
| Trazabilidad del material hasta el producto | A medias | `src/pages/Traceability.tsx`, `src/services/mocks/data.ts:297-355` | Las 7 etapas son fijas; nadie registra lote, retiro ni planta | L | piloto, al menos lote y pesaje |
| Causas: tapitas que se vuelven insumos de hospital | A medias | `src/pages/Causes.tsx`, `src/services/mocks/data.ts:696-761` | Datos de ejemplo | S | fase 2 |
| Ranking general del mes | A medias | `src/pages/Ranking.tsx:9-14`, `src/services/mocks/data.ts:596-621` | Datos fijos; las pestañas por sede están escritas en el código | S | demo |
| Ranking por producto o por hinchada | Falta | — | Pestaña del club en la demo; cálculo real en el servidor | S en demo · M real | demo y piloto |
| Multiplicadores x2, x1,5 y x1,25 a los tres primeros del mes | Falta | — | Cierre mensual en el servidor | M | fase 2 |
| Premio-experiencia para quien más aporta | A medias | Premio del mes por sponsor: `src/services/mocks/data.ts:631-638` | Que la institución lo defina desde su panel | S | demo y piloto |
| Recompensas del club: entradas, camisetas, entrenamientos | A medias | Beneficios de tipo entrada, merch y experiencia: `src/services/mocks/data.ts:410-421` | Cargar los del club | S | demo |
| La app es gratis | Existe | — | — | — | — |
| Premium: mejores canjes | A medias | Precio preferencial en los beneficios (`premiumCostXp`) | Se activa con un botón, sin cobro (`src/pages/Profile.tsx:64-66`) | M | fase 2; en la demo, rotulado |
| Premium: transferir XP | A medias | `src/pages/Profile.tsx:69` | Se hace en el navegador | M | fase 2 |
| Premium: acceso anticipado y reportes personales | Falta | Sólo texto: `src/pages/Profile.tsx:35-36` | Todo | M | fase 2 |

## El comercio o la institución

| Promesa | Estado | Dónde está | Qué falta | Esfuerzo | Va en |
|---|---|---|---|---|---|
| Alta en tres pasos | Existe | `src/pages/commerce/CommerceOnboarding.tsx`; el rubro club o estadio está en la línea 19 | — | — | — |
| Panel de institución (club) | A medias | El club usa el mismo panel del comercio | Vistas propias: producto con meta, hinchada, pesajes y constancia | M | piloto |
| La institución crea su producto con meta de kilos | Falta | Los proyectos son fijos: `src/services/mocks/data.ts:239` | Alta de producto desde el panel | M | piloto |
| Resumen con Huella Verde, seis indicadores y aportes por mes y por punto | A medias | `src/pages/commerce/CommerceResumen.tsx`; números de una fórmula en `src/lib/metrics.ts:9-34` | Datos reales | M | piloto |
| Publicar beneficios | Existe | `src/pages/commerce/CommerceBenefits.tsx` | Se guardan en el navegador | S | piloto |
| Campañas: premio del mes y desafíos | A medias | `src/pages/commerce/CommerceCampaigns.tsx` | No impactan en nada fuera del panel | M | fase 2 |
| Campaña «Multiplicador XP» | Dejar de prometer por ahora | `src/pages/commerce/CommerceCampaigns.tsx:16` | No cambia los XP de nadie; hay que ocultarla o rotularla «próximamente» | S | demo |
| QR de cada punto para descargar e imprimir | Existe | `src/pages/commerce/CommercePoints.tsx:36-38` | — | — | — |
| Exportar en planilla o PDF | A medias | `src/pages/commerce/CommerceReports.tsx:29`, `:71` | Sale de la fórmula y no trae la trazabilidad | S | piloto |
| Certificado de RSE | Falta | — | Constancia por producto hecha con aportes y pesajes registrados, con identificador verificable | M | piloto, etapa 4 |
| «RSE verificable», reportes «para auditoría», panel «en vivo» (landing y reporte) | Dejar de prometer hasta el piloto | `src/pages/commerce/CommerceLanding.tsx:65`, `:105`; `src/pages/commerce/CommerceReports.tsx:45`, `:81` | Hoy los datos son de ejemplo: rotular o cambiar el texto | S | demo |
| Plan activo, próximo cobro y cambio de plan | A medias | `src/pages/commerce/CommercePlan.tsx` | No hay cobro; los precios no coinciden con los que se recuerdan | M | fase 2 |
| Login con código por mail | A medias | Código fijo: `src/pages/commerce/CommerceLogin.tsx:17` | Login real por institución | M | piloto |

## Lo que pide el piloto (mapa de 90 días)

| Promesa | Estado | Qué falta | Esfuerzo | Va en |
|---|---|---|---|---|
| Lectura de QR y pesaje | A medias | El QR existe; el pesaje falta: carga por lote y por partido desde el panel | M | piloto |
| Datos y seguridad de los hinchas | Falta | Servidor, login, datos mínimos y consentimiento | M | piloto |
| Informe de resultados para la comisión directiva | Falta | Kilos, participación, funcionamiento y costos del piloto | M | piloto, etapa 4 |
| Banco de suplentes u otro producto con el plástico de la hinchada | A medias | La pantalla existe con ejemplo; la fabricación es operación del socio industrial | S en software | demo y piloto |
| Modelo replicable en otros clubes | A medias | Los sponsors ya son varios en el modelo; falta que cada institución tenga identidad propia | M | fase 2 |

## Lo que no es software

- **Máquinas o sensores que pesan y cuentan solos.** Hoy un texto de ejemplo lo afirma en `src/services/mocks/data.ts:311` y hay que rotularlo. Depende de la maquinaria del socio industrial.
- **Fabricar el producto al llegar a la meta**: operación.
- **Logística de retiro y la llegada a los 100 Punto R**: operación y ventas.

## Resumen

- **Existe**, aunque sea con datos de ejemplo: la app de la persona entera, el alta y el panel del comercio, el QR de cada punto, la trazabilidad, el proyecto con meta y el premio por sede.
- **Falta lo que hace real al piloto**:
  - servidor y login;
  - pesaje;
  - producto creado por la institución;
  - constancia o certificado;
  - datos de los hinchas;
  - informe del piloto.
- **Hay que dejar de afirmar ya** «RSE verificable», «para auditoría», «en vivo», «la máquina pesó» y el multiplicador de XP. En la demo del caso club van rotulados o fuera.
