# work-agent · Documentación de handoff para IA — ReciclaXP

> **Propósito:** que un agente de IA (o un dev nuevo) pueda retomar este proyecto
> **al detalle** sin contexto previo. Todo lo de acá está verificado contra el código
> real del repo, no es de memoria.
>
> **Última actualización:** 2026-07-18 · **Commit de referencia:** `40dbc00`

---

## Leé en este orden

| # | Archivo | Qué responde |
|---|---|---|
| 1 | [01-PRODUCTO.md](01-PRODUCTO.md) | Qué es ReciclaXP, para quién, cómo gana plata, en qué estado está |
| 2 | [02-ARQUITECTURA.md](02-ARQUITECTURA.md) | Stack, estructura de carpetas, routing, capas, PWA |
| 3 | [03-DESIGN-SYSTEM.md](03-DESIGN-SYSTEM.md) | Tokens, colores, tipografía, primitivas UI, dark mode |
| 4 | [04-RESPONSIVE.md](04-RESPONSIVE.md) | Sistema responsive: shells con sidebar, breakpoints, patrones |
| 5 | [05-APP-USUARIO.md](05-APP-USUARIO.md) | Todas las pantallas del usuario final (B2C) |
| 6 | [06-COMERCIO-B2B.md](06-COMERCIO-B2B.md) | Landing, login OTP, onboarding y panel del comercio |
| 7 | [07-MODELO-DATOS.md](07-MODELO-DATOS.md) | Tipos del dominio, MSW, API, stores, métricas |
| 8 | [08-DEV-DEPLOY.md](08-DEV-DEPLOY.md) | Comandos, puertos, deploy y **troubleshooting** |
| 9 | [09-DECISIONES.md](09-DECISIONES.md) | **Reglas que NO se negocian** + decisiones tomadas y por qué |
| 10 | [10-ESTADO-Y-PENDIENTES.md](10-ESTADO-Y-PENDIENTES.md) | Qué está hecho, qué falta, próximos pasos |
| 11 | [11-HISTORIAL.md](11-HISTORIAL.md) | Cronología commit por commit de todo el trabajo |

---

## TL;DR para arrancar en 60 segundos

```bash
cd ~/dev/reciclaje          # ⚠️ los archivos REALES viven acá, no en ~/Desktop
npm install
npm run dev                 # http://localhost:5183  (base "/" en dev)
```

- **App usuario:** http://localhost:5183/ · demo `camila@reciclaxp.app` / `demo123`
- **Landing comercio:** http://localhost:5183/comercio/sumate
- **Panel comercio:** http://localhost:5183/comercio/login · demo `demo@reciclaxp.app` / OTP `123456`
- **Producción:** https://soyalantapia.github.io/reciclaje/ (base `/reciclaje/`)

## Las 5 trampas que te van a hacer perder tiempo

1. **Base path distinto en dev y prod.** En dev es `/` → la landing es `/comercio/sumate`.
   En build es `/reciclaje/`. Si probás `/reciclaje/comercio/sumate` en dev, te da **404**.
2. **Service worker cachea producción.** Tras un deploy podés seguir viendo lo viejo.
   Probá en **incógnito** o recargá 2 veces. (Detalle en [08](08-DEV-DEPLOY.md).)
3. **Puerto 5183 con `strictPort: true`.** Si otro proyecto lo toma, el server no arranca.
   `lsof -ti tcp:5183 | xargs kill -9`.
4. **NO trabajes desde `~/Desktop/Programacion/reciclaje`** (es un symlink a iCloud y
   rompe los binarios nativos de esbuild). Trabajá en `~/dev/reciclaje`.
5. **Regla de honestidad:** prohibido inventar métricas, usuarios o testimonios en la UI.
   Ver [09-DECISIONES.md](09-DECISIONES.md) — es la regla más importante del proyecto.
