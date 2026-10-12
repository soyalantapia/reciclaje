import { readFileSync } from 'node:fs'
import type { ReactNode } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/types'
import { useSessionStore } from '@/store/session'
import Profile from '@/pages/Profile'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

/** «Reducir movimiento» del sistema: cada prueba lo prende o lo apaga. */
const sistema = vi.hoisted(() => ({ reducir: false }))

vi.mock('framer-motion', async (original) => ({
  ...(await original<typeof import('framer-motion')>()),
  useReducedMotion: () => sistema.reducir,
}))

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: { getContributions: () => Promise.resolve([]) },
}))

/**
 * framer-motion mide cada animación con `performance.now()`. Las pruebas no esperan: le adelantan la hora, así
 * dicen lo mismo en una máquina lenta o con otra suite corriendo al lado.
 */
const horaReal = performance.now.bind(performance)
let adelanto = 0

beforeEach(() => {
  sistema.reducir = false
  adelanto = 0
  vi.spyOn(performance, 'now').mockImplementation(() => horaReal() + adelanto)
})

afterEach(() => {
  vi.restoreAllMocks()
})

const cuadro = () => new Promise((resolve) => requestAnimationFrame(resolve))

/** Pasan `ms` de animación: unos cuadros para que arranque, la hora corre, y otros para que framer-motion pinte la nueva. */
async function pasar(ms: number) {
  await cuadro()
  await cuadro()
  adelanto += ms
  await cuadro()
  await cuadro()
}

/** Lo que dura de sobra un toque corto (100-150 ms): ya alcanza para que el apretado llegue a su tamaño. */
const UN_TOQUE_CORTO = 200
/** Lo que tarda de sobra todo en volver a su lugar. */
const VOLVER_A_SU_LUGAR = 600

describe('el césped', () => {
  // Alan, 11/10: «no me gusta el fondo con una celda pintada y la otra sí y la otra no».
  const css = readFileSync('src/index.css', 'utf8')
  const bloque = /\.bg-cancha\s*\{[^}]*\}/.exec(css)?.[0] ?? ''

  /** Dos posiciones iguales seguidas («28px … 28px», «50% … 50%») son un corte: de un color al otro sin degradé. */
  function cortesDuros(estilos: string): string[] {
    const posiciones = estilos.match(/-?\d*\.?\d+(?:px|%)/g) ?? []
    return posiciones.filter((p, i) => p === posiciones[i - 1])
  }

  it('es un verde liso con un degradé suave, sin franjas', () => {
    expect(bloque).not.toBe('')
    expect(bloque).not.toMatch(/repeating-/)
    expect(bloque).toMatch(/linear-gradient\(\s*180deg,\s*var\(--cancha-claro\),\s*var\(--cancha-oscuro\)\s*\)/)
  })

  it('no tiene paradas duras de color: cada color se funde con el siguiente', () => {
    expect(cortesDuros(bloque)).toEqual([])
  })

  it('el detector de cortes distingue un degradé de una franja (si no, la prueba de arriba pasaría de vacía)', () => {
    expect(cortesDuros('linear-gradient(180deg, var(--a) 0 28px, var(--b) 28px 56px)')).toEqual(['28px'])
    expect(cortesDuros('linear-gradient(180deg, var(--a) 50%, var(--b) 50%)')).toEqual(['50%'])
    expect(cortesDuros('linear-gradient(180deg, var(--a) 0%, var(--b) 100%)')).toEqual([])
    expect(cortesDuros('linear-gradient(180deg, var(--a), var(--b))')).toEqual([])
  })
})

describe('«Pasate a Premium»', () => {
  // Alan, 11/10: «el negro rompe mucho».
  const hincha: User = {
    id: 'u_retoques', name: 'Camila Ríos', email: 'camila@ejemplo.com', city: 'Córdoba', role: 'user',
    avatarColor: '#16a34a', level: 2, levelName: 'Brote', streakDays: 3, isPremium: false,
    joinedAt: '2026-05-01', reputationXp: 1200, spendableXp: 800,
  }

  beforeEach(() => {
    useSessionStore.setState({ user: hincha, isAuthenticated: true })
  })

  it('es una tarjeta dorada clara, sin fondo oscuro ni texto blanco, con su botón y el aviso de la demo', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    )
    const tarjeta = (await screen.findByText('Pasate a Premium')).closest<HTMLElement>('.rounded-2xl')
    if (!tarjeta) throw new Error('«Pasate a Premium» no está dentro de una tarjeta .rounded-2xl')

    const boton = within(tarjeta).getByRole('button', { name: 'Probar Premium' })
    expect(within(tarjeta).getByText('Demo: no se cobra.')).toBeInTheDocument()

    // Todo el subárbol, menos una clase: la variante `xp` del botón trae `text-ink-900` (letra oscura sobre ámbar, a propósito).
    const clases = [tarjeta, ...tarjeta.querySelectorAll('*')].flatMap((el) =>
      (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => !(el === boton && c === 'text-ink-900')),
    )
    expect(clases.filter((c) => /\btext-white\b|\bink-/.test(c))).toEqual([])
    // Y es la dorada clara de verdad, no un blanco cualquiera.
    expect(tarjeta.className).toContain('from-xp-50')
  })
})

/** Un dedo: en jsdom `isPrimary` viene en false y framer-motion no lo toma por un toque. */
const dedo = { isPrimary: true, pointerType: 'touch', button: 0 }
const apretar = (el: Element) => fireEvent.pointerDown(el, dedo)
const soltar = (el: Element) => fireEvent.pointerUp(el, dedo)
/** Un toque entero: apoya, levanta y el navegador manda el click. */
function tocar(el: Element) {
  apretar(el)
  soltar(el)
  fireEvent.click(el)
}
/** Una clase de relleno de Tailwind: p-3, px-3, py-2.5, pt-1… */
const CON_RELLENO = /(^|\s)p[xytblr]?-\d/

const enlace = (nombre: string) => screen.getByRole('link', { name: nombre })
/** El ícono de una pestaña: lo que se achica al apretar y lleva la cuenta de toques. */
const iconoDe = (nombre: string) => {
  const icono = enlace(nombre).querySelector<HTMLElement>('[data-icono]')
  if (!icono) throw new Error(`«${nombre}» no tiene ícono animado`)
  return icono
}
/** Lo que rebota dentro del ícono: se monta de nuevo en cada toque. */
const reboteDe = (nombre: string) => iconoDe(nombre).firstElementChild as HTMLElement
const etiquetaDe = (nombre: string) => within(enlace(nombre)).getByText(nombre)

function enUnaPantalla(menu: ReactNode, ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      {menu}
      <Routes>
        <Route path="*" element={<p>pantalla</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('la barra de abajo', () => {
  const verBarra = (ruta = '/') => enUnaPantalla(<BottomNav />, ruta)

  it('cada ícono va envuelto en su animación, y siguen las cinco etiquetas', () => {
    const { container } = verBarra()
    for (const etiqueta of ['Inicio', 'Mapa', 'Escanear', 'Beneficios', 'Perfil']) {
      expect(enlace(etiqueta)).toBeInTheDocument()
    }
    expect(container.querySelectorAll('[data-icono]')).toHaveLength(5)
  })

  it('tocar la etiqueta de otra pestaña navega y la marca como activa', () => {
    verBarra('/')
    expect(enlace('Inicio')).toHaveAttribute('aria-current', 'page')
    tocar(etiquetaDe('Mapa'))
    expect(enlace('Mapa')).toHaveAttribute('aria-current', 'page')
    expect(enlace('Inicio')).not.toHaveAttribute('aria-current')
  })

  it('apretar la etiqueta, no sólo el glifo, achica el ícono en un toque corto, y al soltar vuelve', async () => {
    verBarra('/')
    apretar(etiquetaDe('Mapa'))
    // Con los 0,45 s del rebote, a los 0,2 s el ícono todavía estaría a medio camino: el apretado tiene su propia transición.
    await pasar(UN_TOQUE_CORTO)
    expect(iconoDe('Mapa').style.transform).toBe('scale(0.85)')
    // Las otras pestañas no se enteran.
    expect(iconoDe('Perfil').style.transform).not.toContain('scale(0.85)')
    soltar(etiquetaDe('Mapa'))
    await pasar(VOLVER_A_SU_LUGAR)
    expect(iconoDe('Mapa').style.transform).toBe('none')
  })

  it('en Escanear se achica el círculo verde entero, y su ícono con él', async () => {
    const { container } = verBarra('/')
    const circulo = container.querySelector<HTMLElement>('[data-circulo]')
    if (!circulo) throw new Error('el círculo de Escanear no está')
    apretar(etiquetaDe('Escanear'))
    await pasar(UN_TOQUE_CORTO)
    expect(circulo.style.transform).toBe('scale(0.92)')
    expect(iconoDe('Escanear').style.transform).toMatch(/^scale\(0\.\d+\)$/)
    soltar(etiquetaDe('Escanear'))
    await pasar(VOLVER_A_SU_LUGAR)
    expect(circulo.style.transform).toBe('none')
  })

  it('cada toque cuenta, también en la pestaña en la que ya estás, y vuelve a montar el rebote', () => {
    verBarra('/')
    expect(iconoDe('Inicio')).toHaveAttribute('data-vez', '0')
    const rebote = reboteDe('Inicio')
    tocar(etiquetaDe('Inicio'))
    expect(iconoDe('Inicio')).toHaveAttribute('data-vez', '1')
    tocar(etiquetaDe('Inicio'))
    expect(iconoDe('Inicio')).toHaveAttribute('data-vez', '2')
    // Es la misma pestaña: no navegó a ningún lado, y aun así el rebote es otro nuevo.
    expect(enlace('Inicio')).toHaveAttribute('aria-current', 'page')
    expect(reboteDe('Inicio')).not.toBe(rebote)
    // La cuenta es de cada pestaña.
    for (const otra of ['Mapa', 'Escanear', 'Beneficios', 'Perfil']) {
      expect(iconoDe(otra)).toHaveAttribute('data-vez', '0')
    }
  })

  it('al tocar la pestaña en la que ya estás, el ícono rebota de nuevo y vuelve a su lugar', async () => {
    verBarra('/')
    // Al abrir la pantalla, la pestaña elegida rebota una vez: se la deja terminar para que no tape al del toque.
    await pasar(VOLVER_A_SU_LUGAR)
    expect(reboteDe('Inicio').style.transform).toBe('none')
    tocar(etiquetaDe('Inicio'))
    await pasar(225) // el rebote dura 0,45 s: a la mitad está arriba de todo
    expect(reboteDe('Inicio').style.transform).toMatch(/translateY\(-/)
    await pasar(VOLVER_A_SU_LUGAR)
    expect(reboteDe('Inicio').style.transform).toBe('none')
  })

  it('el botón del medio suelta su pulso al quedar elegido, y con «reducir movimiento» no', () => {
    const conMovimiento = verBarra('/escanear')
    const pulso = conMovimiento.container.querySelector('[data-circulo] span[aria-hidden]')
    expect(pulso).not.toBeNull()
    // Y cada toque en el botón del medio, estando ahí, lo suelta de nuevo.
    tocar(etiquetaDe('Escanear'))
    const otroPulso = conMovimiento.container.querySelector('[data-circulo] span[aria-hidden]')
    expect(otroPulso).not.toBeNull()
    expect(otroPulso).not.toBe(pulso)
    conMovimiento.unmount()

    sistema.reducir = true
    const quieta = verBarra('/escanear')
    expect(quieta.container.querySelector('[data-circulo]')).not.toBeNull()
    expect(quieta.container.querySelector('[data-circulo] span[aria-hidden]')).toBeNull()
  })

  it('con «reducir movimiento» no hay apretado ni rebote, pero tocar sigue navegando y contando', async () => {
    sistema.reducir = true
    const { container } = verBarra('/')
    apretar(etiquetaDe('Mapa'))
    await pasar(UN_TOQUE_CORTO)
    expect(iconoDe('Mapa').style.transform).toBe('')
    expect(container.querySelector<HTMLElement>('[data-circulo]')?.style.transform).toBe('')
    expect(reboteDe('Inicio').style.transform).toBe('')
    soltar(etiquetaDe('Mapa'))
    fireEvent.click(etiquetaDe('Mapa'))
    expect(enlace('Mapa')).toHaveAttribute('aria-current', 'page')
    expect(iconoDe('Mapa')).toHaveAttribute('data-vez', '1')
    await pasar(UN_TOQUE_CORTO)
    expect(reboteDe('Mapa').style.transform).toBe('')
  })

  it('el fondo de la pestaña elegida es uno solo y se va con ella; en Escanear no hay, porque el botón del medio ya se distingue', () => {
    const { container } = verBarra('/')
    const fondos = () => [...container.querySelectorAll<HTMLElement>('[data-pestana-activa]')]
    expect(fondos()).toHaveLength(1)
    expect(enlace('Inicio')).toContainElement(fondos()[0])
    tocar(etiquetaDe('Beneficios'))
    expect(fondos()).toHaveLength(1)
    expect(enlace('Beneficios')).toContainElement(fondos()[0])
    tocar(etiquetaDe('Escanear'))
    expect(fondos()).toHaveLength(0)
    // Y vuelve al salir del medio.
    tocar(etiquetaDe('Perfil'))
    expect(fondos()).toHaveLength(1)
    expect(enlace('Perfil')).toContainElement(fondos()[0])
  })

  it('con «reducir movimiento» el fondo de la elegida sigue marcándola: sólo no se desliza', () => {
    sistema.reducir = true
    const { container } = verBarra('/mapa')
    const fondos = [...container.querySelectorAll<HTMLElement>('[data-pestana-activa]')]
    expect(fondos).toHaveLength(1)
    expect(enlace('Mapa')).toContainElement(fondos[0])
  })

  it('lo que se aprieta ocupa todo el enlace y no suma paradas al teclado', () => {
    const { container } = verBarra('/')
    expect(container.querySelectorAll('a')).toHaveLength(5)
    // Cada enlace tiene una sola cosa adentro, su zona de apretado, y ningún relleno propio: no queda un borde sin cubrir.
    for (const a of container.querySelectorAll('a')) {
      expect(a.children).toHaveLength(1)
      expect(a.firstElementChild).toHaveAttribute('tabindex', '-1')
      expect(a.className).not.toMatch(CON_RELLENO)
    }
    // framer-motion le pone tabindex="0" a lo que se aprieta si no es un enlace: eso duplicaría cada parada del Tab.
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(0)
  })
})

describe('el menú lateral de la compu', () => {
  const verMenu = (ruta = '/') => enUnaPantalla(<SideNav />, ruta)

  it('cada ítem tiene su ícono animado y una zona de apretado que lo ocupa entero', () => {
    const { container } = verMenu()
    expect(container.querySelectorAll('nav [data-icono]')).toHaveLength(8)
    expect(container.querySelectorAll('nav a')).toHaveLength(8)
    // El relleno vive en la zona, no en el enlace: apretar en el borde del ítem también lo achica.
    for (const a of container.querySelectorAll('nav a')) {
      expect(a.children).toHaveLength(1)
      expect(a.firstElementChild).toHaveAttribute('tabindex', '-1')
      expect(a.className).not.toMatch(CON_RELLENO)
    }
  })

  it('apretar la etiqueta del ítem, no sólo el glifo, achica el ícono en un toque corto, y al soltar vuelve', async () => {
    verMenu('/')
    apretar(etiquetaDe('Ranking'))
    await pasar(UN_TOQUE_CORTO)
    expect(iconoDe('Ranking').style.transform).toBe('scale(0.85)')
    expect(iconoDe('Marcas').style.transform).not.toContain('scale(0.85)')
    soltar(etiquetaDe('Ranking'))
    await pasar(VOLVER_A_SU_LUGAR)
    expect(iconoDe('Ranking').style.transform).toBe('none')
  })

  it('cada toque cuenta, también en el ítem en el que ya estás, y navega al tocar otro', () => {
    verMenu('/')
    const rebote = reboteDe('Inicio')
    tocar(etiquetaDe('Inicio'))
    tocar(etiquetaDe('Inicio'))
    expect(iconoDe('Inicio')).toHaveAttribute('data-vez', '2')
    expect(reboteDe('Inicio')).not.toBe(rebote)
    tocar(etiquetaDe('Causas'))
    expect(enlace('Causas')).toHaveAttribute('aria-current', 'page')
    expect(iconoDe('Causas')).toHaveAttribute('data-vez', '1')
  })

  it('al tocar el ítem en el que ya estás, el ícono rebota de nuevo', async () => {
    verMenu('/')
    await pasar(VOLVER_A_SU_LUGAR)
    expect(reboteDe('Inicio').style.transform).toBe('none')
    tocar(etiquetaDe('Inicio'))
    await pasar(225)
    expect(reboteDe('Inicio').style.transform).toMatch(/translateY\(-/)
  })

  it('con «reducir movimiento» no se achica ni rebota, y no suma paradas al teclado', async () => {
    sistema.reducir = true
    const { container } = verMenu('/')
    apretar(etiquetaDe('Ranking'))
    await pasar(UN_TOQUE_CORTO)
    expect(iconoDe('Ranking').style.transform).toBe('')
    expect(reboteDe('Inicio').style.transform).toBe('')
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
})
