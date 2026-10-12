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
| Mapa de los Punto R de la ciudad | Existe (demo) | Desde el 11/10/2026, `/mapa` es un mapa de Córdoba (Leaflet, teselas de OpenStreetMap), con los puntos en lugares reales del Centro y Nueva Córdoba. Tiene chips de filtro, una tarjeta con «Cómo llegar» y «Reciclar acá», y «Cerca mío» (`src/pages/MapPoints.tsx`, `src/lib/mapa.ts`) | Los Punto R reales del piloto, y un proveedor de teselas con plan comercial: OpenStreetMap no admite tráfico de producto. Se configura al compilar con `VITE_TESELAS_URL` y `VITE_TESELAS_ATRIBUCION`, sin tocar código. Desde el 12/10/2026 el mapa usa Leaflet directo (BSD-2), sin `react-leaflet` | S | piloto |
| Sumar XP de mérito y XP canjeables | A medias | `src/store/wallet.ts:44-57` | Se calcula en el navegador; en el piloto lo tiene que calcular el servidor | M | piloto |
| Canjear beneficios en comercios y recibir un cupón con QR | A medias | `src/services/mocks/handlers.ts:106-122` | El comercio no tiene cómo validar el cupón; el saldo se descuenta en el navegador | M | piloto |
| Elegir a qué producto va el aporte | Falta | Hoy lo define el punto: el producto que el club publicó para ese Punto R o, si no hay, el del club (`proyectoDelPunto` en `src/lib/productosDelClub.ts`) | Elección al escanear, sólo si el club tiene dos o más productos a la vez | M | fase 2, o piloto si el club lo pide |
| Ver el producto con meta, barra de avance y aporte propio | A medias | `src/services/mocks/data.ts:239-266`, `src/components/features/ImpactProgress.tsx` | Los valores son fijos, la meta está en unidades y no en kilos, y la barra no se mueve con los aportes | M | demo (con ejemplo) y piloto (real) |
| Trazabilidad del material hasta el producto | A medias | `src/pages/Traceability.tsx`, `src/services/mocks/data.ts:297-355` | Las 7 etapas son fijas; nadie registra lote, retiro ni planta | L | piloto, al menos lote y pesaje |
| Causas: tapitas que se vuelven insumos de hospital | A medias | `src/pages/Causes.tsx`, `src/services/mocks/data.ts:696-761` | Datos de ejemplo | S | fase 2 |
| Ranking general del mes | A medias | `src/pages/Ranking.tsx:9-14`, `src/services/mocks/data.ts:596-621` | Datos fijos; las pestañas por sede están escritas en el código | S | demo |
| Ranking por producto o por hinchada | Falta | — | Pestaña del club en la demo; cálculo real en el servidor | S en demo · M real | demo y piloto |
| Multiplicadores x2, x1,5 y x1,25 a los tres primeros del mes | Falta | — | Cierre mensual en el servidor | M | fase 2 |
| Premio-experiencia para quien más aporta | A medias | Premio del mes por sponsor: `src/services/mocks/data.ts:631-638` | Desde el 10/10/2026 la institución lo cambia o lo pausa desde Campañas y la hinchada lo ve, en el mismo navegador. Falta el servidor para que pase entre aparatos | S | demo y piloto |
| Recompensas del club: entradas, camisetas, entrenamientos | A medias | Beneficios de tipo entrada, merch y experiencia: `src/services/mocks/data.ts:410-421` | Cargar los del club | S | demo |
| La app es gratis | Existe | — | — | — | — |
| Premium: mejores canjes | A medias | Precio preferencial en los beneficios (`premiumCostXp`) | Se activa con un botón, sin cobro (`src/pages/Profile.tsx:64-66`) | M | fase 2; en la demo, rotulado |
| Premium: transferir XP | A medias | `src/pages/Profile.tsx:69` | Se hace en el navegador | M | fase 2 |
| Premium: acceso anticipado y reportes personales | Falta | Sólo texto: `src/pages/Profile.tsx:35-36` | Todo | M | fase 2 |

## El comercio o la institución

| Promesa | Estado | Dónde está | Qué falta | Esfuerzo | Va en |
|---|---|---|---|---|---|
| Alta en tres pasos | Existe | `src/pages/commerce/CommerceOnboarding.tsx`; el rubro club o estadio está en la línea 19 | — | — | — |
| Panel de institución (club) | A medias | El club usa el mismo panel del comercio. Desde el 11/10/2026 carga su marca en «Marca»: el escudo y el color, que se toma del escudo. Todo su panel y su informe la usan. Se guarda sólo en el navegador: no va al repo ni a la dirección publicada (`src/pages/commerce/CommerceMarca.tsx`, `src/lib/marca.ts`) | Vistas propias: hinchada, pesajes y constancia. La marca guardada en el servidor, con permiso escrito del club | M | piloto |
| La institución crea su producto con meta de kilos | A medias | Desde el 10/10/2026, «Productos» en el panel: forma, nombre, meta en kilos y Punto R (`src/pages/commerce/CommerceProducts.tsx`, `src/lib/productosDelClub.ts`). La hinchada lo ve y le suma, en el mismo navegador | Que se guarde en el servidor y pase entre aparatos (E1.1) | S | piloto |
| Resumen con Huella Verde, seis indicadores y aportes por mes y por punto | A medias | `src/pages/commerce/CommerceResumen.tsx`; números de una fórmula en `src/lib/metrics.ts:9-34` | Datos reales. La posición en la red ya no es un «Top 12%» fijo: se calcula con la Huella Verde (`src/lib/posicionEnLaRed.ts`) | M | piloto |
| Publicar beneficios | Existe | `src/pages/commerce/CommerceBenefits.tsx` | Se guardan en el navegador. Desde el 10/10/2026 la app del hincha los muestra y los deja canjear, y lo pausado no se ve, en el mismo navegador; entre aparatos distintos hace falta el servidor (E1.1) | S | piloto |
| Campañas: premio del mes y desafíos | A medias | `src/pages/commerce/CommerceCampaigns.tsx` | Desde el 10/10/2026, el premio del mes y los desafíos que el panel lanza o pausa se ven en la pestaña del ranking de ese sponsor, en el mismo navegador (`src/lib/campanasDeLaRed.ts`). Falta que pase entre aparatos (servidor, E1.1) y en los comercios sin pestaña propia, que el panel avisa | M | fase 2 |
| Campaña «Multiplicador XP» | Dejar de prometer por ahora | `src/pages/commerce/CommerceCampaigns.tsx:16` | Resuelto el 10/10/2026: se muestra «próximamente», no se puede lanzar y la landing ya no la ofrece | S | demo |
| QR de cada punto para descargar e imprimir | Existe | `src/pages/commerce/CommercePoints.tsx:36-38` | — | — | — |
| Exportar en planilla o PDF | A medias | Comercio: `src/pages/commerce/CommerceReports.tsx:14`, `:59`. Club: «Descargar PDF» y «Descargar CSV» arriba del informe (`src/pages/commerce/CommerceInforme.tsx`) | Sale de la fórmula y no trae la trazabilidad | S | piloto |
| Certificado de RSE | Falta | — | Constancia por producto hecha con aportes y pesajes registrados, con identificador verificable | M | piloto, etapa 4 |
| «RSE verificable», reportes «para auditoría», panel «en vivo» (landing y reporte) | Dejar de prometer hasta el piloto | `src/pages/commerce/CommerceLanding.tsx:65`, `:105`; `src/pages/commerce/CommerceReports.tsx:69`, `:90` | Resuelto el 10/10/2026: el reporte dice que son datos de ejemplo y ninguna pantalla lo afirma: tampoco «Reportes RSE» en los planes ni «hitos verificables» en la trazabilidad. Lo vigilan `src/pages/commerce/CommerceLanding.test.tsx` y `src/pages/promesas.test.ts` | S | demo |
| Plan activo, próximo cobro y cambio de plan | A medias | `src/pages/commerce/CommercePlan.tsx` | No hay cobro; los precios no coinciden con los que se recuerdan. En la demo del club no se muestran: sin «Plan» en el panel y «A convenir» en la landing y el alta (decidido el 10/10/2026, hasta cerrar la tabla de precios) | M | fase 2 |
| Login con código por mail | A medias | Código fijo: `src/pages/commerce/CommerceLogin.tsx:17` | Login real por institución | M | piloto |

## Lo que pide el piloto (mapa de 90 días)

| Promesa | Estado | Qué falta | Esfuerzo | Va en |
|---|---|---|---|---|
| Lectura de QR y pesaje | A medias | El QR existe. Desde el 12/10/2026 la demo tiene «Pesajes» en el panel: partido, fecha, Punto R y kilos; al guardar, el recorrido del hincha marca el pesaje hecho y el informe llena «Partido por partido» (`src/pages/commerce/CommercePesajes.tsx`, `src/lib/pesajes.ts`). Vive en el navegador: falta guardarlo en el servidor y agruparlo en lotes | M | piloto |
| Datos y seguridad de los hinchas | Falta | Servidor, login, datos mínimos y consentimiento | M | piloto |
| Informe de resultados para la comisión directiva | A medias | Desde el 10/10/2026, en la demo: el informe es la pantalla «Reportes» del club (desde el 11/10/2026, con «Descargar PDF» y «Descargar CSV»; `/comercio/informe` redirige ahí), imprimible, con los datos del panel y «Partido por partido» sin números (desde el 12/10/2026, con los pesajes que el club carga en «Pesajes»). Desde el 11/10/2026 trae también esos datos ordenados para el Reporte de Sustentabilidad del club, alineados con GRI y la Agenda 2030 (no verificados), con su CSV. Falta lo real: los pesajes por partido (E1.4) y los costos del piloto | M | piloto, etapa 4 |
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
  Hecho el 10/10/2026 en las dos demos: reporte, campañas, trazabilidad y landing de comercios.
