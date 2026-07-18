# 01 · Producto

## Qué es ReciclaXP

PWA de **reciclaje incentivado** con dos caras:

- **B2C (la persona):** escanea un QR en un punto de reciclaje, registra su aporte,
  gana **XP** y los canjea por **beneficios reales** en los comercios de la red.
- **B2B (el comercio/marca):** paga una suscripción mensual y obtiene **tráfico de
  clientes**, **RSE verificable**, **Huella Verde** (reputación ambiental pública) y un
  **panel con datos en vivo**.

El diferencial frente a competidores (Reciclos/Ecoembes, Reaquila, Segrega) es el
**ángulo B2B**: ellos son apps para el ciudadano/municipio con sorteos; acá el comercio
tiene panel, reportes RSE y el canje ocurre **en su local** (por eso genera tráfico real).

## Circuito completo del producto

```
Persona escanea QR del comercio
   → registra aporte (tapitas/plástico/vidrio/papel/aluminio)
   → gana XP  ──────────────► reputationXp (mérito, NO se gasta)
                └──────────► spendableXp  (saldo canjeable)
   → canjea beneficio en el comercio  → cupón con QR
   → el material queda TRAZADO (lote → clasificación → transformación → producto)
   → suma a una CAUSA (ej. tapitas → insumos para hospitales)

El comercio ve todo eso en su panel: aportes, usuarios, kg, XP emitidos,
beneficios canjeados, Huella Verde, y exporta reportes RSE (CSV/PDF).
```

## Dos vías de ganar XP

1. **Reciclando** — `XP_PER_UNIT`: tapitas 2, plástico 3, vidrio 1, papel 1, aluminio 4.
2. **Comprando** en comercios de la red — `XP_PER_PESO = 1/50` (1 XP cada $50).

## Modelo de negocio (B2B)

| Plan | Precio | Incluye |
|---|---|---|
| Básico | $45.000/mes | 1 punto · beneficios básicos · reporte mensual |
| **Pro** (destacado) | $90.000/mes | Hasta 5 puntos · campañas ilimitadas · reportes RSE · Huella Verde + placa |
| Enterprise | A medida | Multi-sede · API · datos agregados · account manager |

Definidos en `src/pages/commerce/CommerceLanding.tsx` (TIERS) y
`src/pages/commerce/CommercePlan.tsx` (TIERS del panel).

## ICP (a quién le vendemos)

- **Dueño/encargado de comercio**: café, restó, kiosco, estación de servicio, super.
  Dolor: competir por cada cliente; promos que regalan margen sin traer gente nueva.
- **Responsable de marketing / sustentabilidad / RSE de una marca**.
  Dolor: le piden mostrar sustentabilidad y no tiene datos verificables (todo termina
  en "un PDF lindo").

Verticales contempladas en la landing: comercios, estaciones de servicio, marcas,
clubes/estadios, municipios, cadenas multi-sede.

## Conceptos propios del producto (vocabulario)

- **XP** — puntos. Se dividen en `reputationXp` (mérito/ranking, no se gasta) y
  `spendableXp` (canjeable).
- **Huella Verde** — puntaje 0-100 de reputación ambiental de un sponsor
  (`Sponsor.greenScore`). Se puede descargar como **placa SVG** para la vidriera.
- **Punto** (`RecyclePoint`) — depósito, máquina o tótem donde se recicla. Cada uno
  tiene su **QR**.
- **Causa** (`Cause`) — institución beneficiaria (hospital, ONG, escuela, comedor) a la
  que va lo recaudado por el material.
- **Trazabilidad** — cadena de 7 etapas: aporte → validación → lote → retiro →
  clasificación → transformación → producto.
- **Campaña** — premio del mes, multiplicador de XP o desafío, que lanza el comercio.

## Estado del negocio: PRE-LANZAMIENTO

⚠️ **Crítico para cualquier cambio de UI/copy:** el producto **todavía no está lanzado**.
No hay usuarios reales, ni kg recuperados, ni comercios clientes, ni testimonios.

La narrativa honesta que usa toda la comunicación es:
> **"Por lanzarse · cupos fundadores — primeros 100 puntos en Córdoba Capital"**

Las marcas que aparecen (Coca-Cola, McDonald's, YPF, River, Starbucks, Grido, Adidas,
Municipio de Vicente López, Café Lúmen) son **datos de demo / aspiracionales** y en la
landing están etiquetadas como *"Marcas que queremos sumar"*. **Nunca** presentarlas
como clientes actuales.
