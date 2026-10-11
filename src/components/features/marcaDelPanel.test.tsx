// La marca que el club carga en «Marca» se ve en todo su panel: los colores, en el contenedor; el
// escudo, en la barra lateral, en el encabezado del celular y en el informe. Sin marca, como siempre.
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { estiloDeMarca } from '@/lib/marca'
import { router } from '@/routes'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve([]),
    getSponsors: () => Promise.resolve([]),
    getProjects: () => Promise.resolve([]),
    getProjectTrace: () => Promise.resolve([]),
  },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
// Un escudo de mentira: no es el de ningún club.
const ESCUDO = 'data:image/png;base64,ESCUDO'

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
})

/** Espera el título: si la prueba termina antes de que cargue, la carga diferida queda colgada. */
async function abrirElPanelEn(ruta: string, titulo: string, sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  const vista = render(<RouterProvider router={createMemoryRouter(router.routes, { initialEntries: [ruta] })} />)
  // La pantalla carga diferida (~0,3 s en frío): con la máquina ocupada, el segundo que se espera por defecto queda justo.
  await screen.findByRole('heading', { level: 1, name: titulo }, { timeout: 3000 })
  return vista
}

/** Lo mismo, y devuelve sólo el contenedor de lo que se montó. */
async function verElPanelEn(ruta: string, titulo: string, sponsor: Sponsor = club) {
  return (await abrirElPanelEn(ruta, titulo, sponsor)).container
}

/** El contenedor que lleva la paleta de la marca, si la hay. */
const conMarca = (c: HTMLElement) => c.querySelector<HTMLElement>('[style*="--eco-600"]')

describe('la marca del club en su panel', () => {
  it('con marca, el panel toma su color y muestra el escudo en los dos menús y en el informe', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)?.style.getPropertyValue('--eco-600')).toBe('#0b2d6b')
    // La barra lateral, el encabezado del celular y el encabezado del informe.
    expect(screen.getAllByRole('img', { name: 'Escudo de Talleres' })).toHaveLength(3)
  })

  it('con color y sin escudo, toma el color y deja la inicial', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).not.toBeNull()
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it('sin marca, todo como siempre: sin variables y sin escudo', async () => {
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).toBeNull()
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  // Un escudo del que no sale ningún color (blanco y gris) se guarda con el verde de ReciclaXP, que es el
  // «todavía no eligió el suyo»: el panel no se oscurece como si el club hubiera elegido ese color.
  it('con el escudo y el verde de ReciclaXP, el escudo se ve y el panel no lleva ninguna variable', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#059669' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).toBeNull()
    expect(c.querySelectorAll('[style*="--eco-"]')).toHaveLength(0)
    expect(screen.getAllByRole('img', { name: 'Escudo de Talleres' })).toHaveLength(3)
  })

  it('un comercio no toma una marca de club', async () => {
    useMarcaDelClubStore.getState().guardar('s_cafe', { color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Reportes', { ...club, id: 's_cafe', name: 'Café', category: 'comercio' })
    expect(conMarca(c)).toBeNull()
  })

  it('la ruta real /comercio/marca existe y cuelga del panel', async () => {
    await verElPanelEn('/comercio/marca', 'La marca de Talleres')
  })
})

// Los Modal se montan con un portal en <body>, fuera del contenedor del panel (components/ui/modal.tsx):
// los abren Campañas, Beneficios y Productos, y sus botones son del color de la marca. Por eso, mientras
// el panel con marca está abierto, la paleta va también en <html>.
describe('la paleta de la marca en <html>, para lo que se monta fuera del panel', () => {
  const raiz = document.documentElement
  const PALETA = Object.keys(estiloDeMarca('#0b2d6b'))
  /** Las variables de la paleta eco que <html> lleva puestas en este momento. */
  const variablesEnLaRaiz = () => PALETA.filter((nombre) => raiz.style.getPropertyValue(nombre) !== '')

  it('con marca, <html> lleva la paleta entera mientras el panel está abierto y queda limpio al salir', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    const { unmount } = await abrirElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(raiz.style.getPropertyValue('--eco-600')).toBe('#0b2d6b')
    // Las 11 variables, con los mismos valores que lleva el contenedor.
    for (const [nombre, valor] of Object.entries(estiloDeMarca('#0b2d6b'))) {
      expect(raiz.style.getPropertyValue(nombre)).toBe(valor)
    }

    unmount()
    expect(raiz.style.getPropertyValue('--eco-600')).toBe('')
    expect(variablesEnLaRaiz()).toEqual([])
  })

  it('sin marca, <html> no lleva ninguna', async () => {
    await abrirElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(variablesEnLaRaiz()).toEqual([])
  })

  it('un comercio no deja la marca de un club en <html>', async () => {
    useMarcaDelClubStore.getState().guardar('s_cafe', { color: '#0b2d6b' })
    await abrirElPanelEn('/comercio/reportes', 'Reportes', { ...club, id: 's_cafe', name: 'Café', category: 'comercio' })
    expect(variablesEnLaRaiz()).toEqual([])
  })

  it('si el club cambia su color con el panel abierto, <html> toma el nuevo y no deja nada del anterior', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    await abrirElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')

    act(() => useMarcaDelClubStore.getState().guardar('s_club', { color: '#aa0000' }))
    for (const [nombre, valor] of Object.entries(estiloDeMarca('#aa0000'))) {
      expect(raiz.style.getPropertyValue(nombre)).toBe(valor)
    }
  })

  it('si el club vuelve a los colores de ReciclaXP con el panel abierto, <html> queda limpio', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(variablesEnLaRaiz()).toHaveLength(PALETA.length)

    act(() => useMarcaDelClubStore.getState().quitar('s_club'))
    expect(variablesEnLaRaiz()).toEqual([])
    expect(conMarca(c)).toBeNull()
  })

  it('con el escudo y el verde de ReciclaXP, <html> no lleva ninguna variable', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#059669' })
    await abrirElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(variablesEnLaRaiz()).toEqual([])
  })

  it('si el club pasa de un color propio al verde de ReciclaXP con el panel abierto, <html> y el panel quedan sin paleta', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(variablesEnLaRaiz()).toHaveLength(PALETA.length)
    expect(conMarca(c)).not.toBeNull()

    act(() => useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#059669' }))
    expect(variablesEnLaRaiz()).toEqual([])
    expect(conMarca(c)).toBeNull()
    expect(screen.getAllByRole('img', { name: 'Escudo de Talleres' })).toHaveLength(3)
  })

  it('un Modal del panel, que cuelga de <body> y no del panel, también ve el color de la marca', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    const c = await verElPanelEn('/comercio/productos', 'Productos')
    fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo producto' })

    // Está fuera del contenedor que lleva la paleta…
    const panel = conMarca(c)
    expect(panel).not.toBeNull()
    expect(panel!.contains(dialogo)).toBe(false)
    // …y aun así su botón verde tiene el color del club.
    expect(getComputedStyle(dialogo).getPropertyValue('--eco-600')).toBe('#0b2d6b')
  })
})

// Lo que el brief no fijaba del escudo: qué se ve en cada lugar, con y sin marca.
describe('el escudo y la inicial del club en su panel', () => {
  /** Los cuadrados con la inicial: el de la barra lateral y el del encabezado del celular. */
  const iniciales = () => {
    const cuadrados = screen.getAllByText('T')
    expect(cuadrados).toHaveLength(2)
    return cuadrados
  }

  it('el escudo que subió el club es el que se ve en los tres lugares, y cabe sin deformarse', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    const escudos = screen.getAllByRole('img', { name: 'Escudo de Talleres' })
    expect(escudos).toHaveLength(3)
    for (const escudo of escudos) {
      expect(escudo).toHaveAttribute('src', ESCUDO)
      // Se ajusta a su cuadro: un escudo apaisado o alto no se estira.
      expect(escudo).toHaveClass('object-contain')
    }
  })

  it('el escudo del informe va en su encabezado, que es lo que sale en el PDF', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    const encabezado = screen.getByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' }).closest('header')!
    expect(within(encabezado).getByRole('img', { name: 'Escudo de Talleres' })).toHaveAttribute('src', ESCUDO)
  })

  it('con el escudo, la inicial no se muestra', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(screen.queryByText('T')).not.toBeInTheDocument()
  })

  it('sin marca, la inicial va en un cuadrado del color que el club ya tenía', async () => {
    await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva', { ...club, brandColor: '#aa0000' })
    for (const inicial of iniciales()) {
      expect(inicial).toHaveStyle({ backgroundColor: '#aa0000' })
      expect(inicial).not.toHaveClass('bg-eco-600')
    }
  })

  it('con color y sin escudo, la inicial va en un cuadrado del color de la marca', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva', { ...club, brandColor: '#aa0000' })
    for (const inicial of iniciales()) {
      // El fondo es el 600 de la paleta de la marca; el color de antes no lo pisa.
      expect(inicial).toHaveClass('bg-eco-600')
      expect(inicial.style.backgroundColor).toBe('')
      expect(getComputedStyle(inicial).getPropertyValue('--eco-600')).toBe('#0b2d6b')
    }
  })

  it('la inicial es decorativa: el nombre del club ya está al lado, y no se lee dos veces', async () => {
    await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    for (const inicial of iniciales()) expect(inicial).toHaveAttribute('aria-hidden', 'true')
  })
})

// Lo que el navegador tiene guardado puede no respetar la forma: una versión vieja, o alguien que lo tocó.
// Antes, una marca sin color, con el color en un número o sin ninguna marca (marcas: null) tumbaba el panel
// entero y mostraba la pantalla de error; ahora abre igual, con el verde de ReciclaXP.
describe('si lo guardado en el navegador viene roto, el panel abre igual', () => {
  /** Lo que podría haber en el store si se lee algo que no respeta el tipo. */
  const guardadoRoto = (marcas: unknown) => useMarcaDelClubStore.setState({ marcas } as never)

  it('sin ninguna marca (marcas: null), el informe abre sin variables y sin escudo', async () => {
    guardadoRoto(null)
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).toBeNull()
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it('sin ninguna marca (marcas: null), «Marca» abre con el verde de ReciclaXP', async () => {
    guardadoRoto(null)
    await verElPanelEn('/comercio/marca', 'La marca de Talleres')
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#059669')
  })

  it.each([
    ['sin color', { escudo: ESCUDO }],
    ['con el color en un número', { escudo: ESCUDO, color: 123 }],
  ])('una marca %s: el escudo se ve y el panel no lleva ninguna variable', async (_, marca) => {
    guardadoRoto({ s_club: marca })
    const c = await verElPanelEn('/comercio/reportes', 'Informe para la Comisión Directiva')
    expect(conMarca(c)).toBeNull()
    expect(screen.getAllByRole('img', { name: 'Escudo de Talleres' })).toHaveLength(3)
    expect(document.documentElement.style.getPropertyValue('--eco-600')).toBe('')
  })
})
