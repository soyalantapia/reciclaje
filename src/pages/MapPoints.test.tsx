import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint, Sponsor } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import MapPoints from './MapPoints'

// El mapa de Leaflet se reemplaza: acá se prueba la pantalla. Cada pin es un botón que dice si está elegido, y el mapa
// anota qué encuadre le piden, cuántos vuelos le pidieron y dónde está el hincha.
vi.mock('@/components/features/MapaDeCordoba', () => ({
  default: ({ puntos, elegido, onElegir, vista, vuelo, miUbicacion }: {
    puntos: RecyclePoint[]; elegido: string | null; onElegir: (id: string) => void
    vista: { tipo: string; n: number }; vuelo: number; miUbicacion: { lat: number; lng: number } | null
  }) => (
    <div data-testid="mapa" data-vista={`${vista.tipo}-${vista.n}`} data-vuelo={vuelo} data-ubicacion={miUbicacion ? `${miUbicacion.lat},${miUbicacion.lng}` : ''}>
      {puntos.map((p) => (
        <button key={p.id} aria-pressed={p.id === elegido} onClick={() => onElegir(p.id)}>
          pin {p.name}
        </button>
      ))}
    </div>
  ),
}))

const marca: Sponsor = { id: 's_cafe', name: 'Café Andino', slug: 'cafe', category: 'comercio', brandColor: '#7c3aed', tagline: '', greenScore: 70, kgRecovered: 100 }
const punto = (id: string, name: string, lat: number, lng: number, openNow: boolean, materiales: RecyclePoint['acceptedMaterials']): RecyclePoint => ({
  id, name, sponsorId: 's_cafe', type: 'deposito', address: `${name} 123`, city: 'Córdoba', lat, lng, acceptedMaterials: materiales, openNow,
})
const PUNTOS = [
  punto('p_sede', 'Sede', -31.415995, -64.183657, true, ['tapitas', 'vidrio']),
  punto('p_espana', 'Plaza España', -31.428564, -64.184875, false, ['tapitas', 'papel']),
  punto('p_kempes', 'Kempes', -31.368847, -64.246145, true, ['plastico']),
]

/** Los puntos que devuelve la red en cada prueba: arranca con los tres, y una prueba puede vaciarla. */
let red: RecyclePoint[] = PUNTOS

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve(red),
    getSponsors: () => Promise.resolve([marca]),
  },
}))

function verMapa() {
  return render(
    <MemoryRouter initialEntries={['/mapa']}>
      <Routes>
        <Route path="/mapa" element={<MapPoints />} />
        <Route path="/escanear" element={<p>Pantalla de escanear</p>} />
      </Routes>
    </MemoryRouter>,
  )
}
/** Lo que la pantalla le pasó al mapa: el encuadre que pide («centro-0», «todos-1»…) y la ubicación del hincha. */
const elMapa = () => screen.getByTestId('mapa')
/** La lista de puntos, debajo del mapa. */
const lista = () => screen.getByRole('list', { name: 'Puntos de la red' })
const nombresDeLaLista = () => within(lista()).getAllByRole('listitem').map((li) => li.querySelector('p')?.textContent)

/** Simula la ubicación del navegador sin reemplazar `navigator` entero (React y sonner lo leen). */
function conUbicacion(getCurrentPosition: Geolocation['getCurrentPosition']) {
  Object.defineProperty(window.navigator, 'geolocation', { configurable: true, value: { getCurrentPosition } })
}
/** El navegador da esas coordenadas apenas se le pide la ubicación. */
function ubicadoEn(latitude: number, longitude: number) {
  conUbicacion(((ok: PositionCallback) => ok({ coords: { latitude, longitude } } as GeolocationPosition)) as unknown as Geolocation['getCurrentPosition'])
}
/** El navegador no contesta hasta que la prueba llame a `responder`: sirve para ver qué muestra la pantalla mientras espera. */
function ubicacionQueTarda() {
  const pedidos: { ok: PositionCallback; mal: PositionErrorCallback }[] = []
  const getCurrentPosition = vi.fn((ok: PositionCallback, mal: PositionErrorCallback) => {
    pedidos.push({ ok, mal })
  })
  conUbicacion(getCurrentPosition as unknown as Geolocation['getCurrentPosition'])
  return {
    getCurrentPosition,
    responder: (latitude: number, longitude: number) => {
      act(() => {
        pedidos.at(-1)!.ok({ coords: { latitude, longitude } } as GeolocationPosition)
      })
    },
    fallar: (code: number) => {
      act(() => {
        pedidos.at(-1)!.mal({ code } as GeolocationPositionError)
      })
    },
  }
}
/** jsdom no trae `scrollIntoView`: se lo define en el prototipo para espiarlo (el `afterEach` lo saca). */
function espiarElScroll() {
  const espia = vi.fn()
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, writable: true, value: espia })
  return espia
}

beforeEach(() => {
  sessionStorage.clear()
  red = PUNTOS
})
afterEach(() => {
  vi.restoreAllMocks()
  delete (window.navigator as { geolocation?: Geolocation }).geolocation
  delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
})

describe('el mapa de Córdoba', () => {
  it('muestra los puntos en el mapa y en la lista, con los abiertos primero', async () => {
    verMapa()
    expect(await screen.findByRole('button', { name: 'pin Sede' })).toBeInTheDocument()
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
  })

  it('tocar un punto de la lista lo elige en el mapa y abre su tarjeta, con «Cómo llegar» a Google Maps', async () => {
    verMapa()
    fireEvent.click(await within(await screen.findByRole('list', { name: 'Puntos de la red' })).findByRole('button', { name: /Plaza España/ }))
    expect(screen.getByRole('button', { name: 'pin Plaza España' })).toHaveAttribute('aria-pressed', 'true')
    const tarjeta = screen.getByRole('region', { name: 'Plaza España' })
    const llegar = within(tarjeta).getByRole('link', { name: /Cómo llegar/ })
    expect(llegar).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=-31.428564,-64.184875')
    expect(llegar).toHaveAttribute('target', '_blank')
    expect(within(tarjeta).getByText(/Cerrado/)).toBeInTheDocument()
  })

  it('«Reciclar acá» deja el punto pendiente y va a Escanear', async () => {
    verMapa()
    fireEvent.click(await screen.findByRole('button', { name: 'pin Sede' }))
    fireEvent.click(within(screen.getByRole('region', { name: 'Sede' })).getByRole('button', { name: /Reciclar acá/ }))
    expect(await screen.findByText('Pantalla de escanear')).toBeInTheDocument()
    expect(sessionStorage.getItem(claveDeAlmacenamiento('scan-point'))).toBe('p_sede')
  })

  it('los chips filtran el mapa y la lista; sin resultados lo dice y «Ver todos» los vuelve a mostrar', async () => {
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    fireEvent.click(screen.getByRole('button', { name: 'Abiertos ahora' }))
    expect(screen.queryByRole('button', { name: 'pin Plaza España' })).not.toBeInTheDocument()
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes'])
    fireEvent.click(screen.getByRole('button', { name: 'Vidrio' }))
    expect(nombresDeLaLista()).toEqual(['Sede'])
    fireEvent.click(screen.getByRole('button', { name: 'Plástico' }))
    expect(nombresDeLaLista()).toEqual(['Kempes'])
    fireEvent.click(screen.getByRole('button', { name: 'Abiertos ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Plástico' }))
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
  })

  it('«Cerca mío» con permiso ordena por distancia y la escribe en cada punto', async () => {
    const getCurrentPosition = vi.fn((ok: PositionCallback) =>
      ok({ coords: { latitude: -31.4286, longitude: -64.1849 } } as GeolocationPosition),
    )
    conUbicacion(getCurrentPosition as unknown as Geolocation['getCurrentPosition'])
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
    expect(within(lista()).getByText('a 1,4 km')).toBeInTheDocument()
    expect(within(lista()).getByText(/^a \d+ m$/)).toBeInTheDocument()
  })

  it('«Cerca mío» desde el estadio pone primero el punto abierto que más cerca queda', async () => {
    // Estando en el Kempes, el estadio pasa delante de la sede: sin la ubicación el orden era otro.
    ubicadoEn(-31.369, -64.246)
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(nombresDeLaLista()).toEqual(['Kempes', 'Sede', 'Plaza España'])
  })

  it('«Cerca mío» sin permiso lo dice, y lejos de Córdoba avisa y no cambia nada', async () => {
    const error = vi.spyOn(toast, 'error')
    const info = vi.spyOn(toast, 'info')
    const deniega = vi.fn((_ok: PositionCallback, mal?: PositionErrorCallback | null) => mal?.({ code: 1 } as GeolocationPositionError))
    conUbicacion(deniega as unknown as Geolocation['getCurrentPosition'])
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/permiso de ubicación/))

    const enBuenosAires = vi.fn((ok: PositionCallback) => ok({ coords: { latitude: -34.6037, longitude: -58.3816 } } as GeolocationPosition))
    conUbicacion(enBuenosAires as unknown as Geolocation['getCurrentPosition'])
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(info).toHaveBeenCalledWith(expect.stringMatching(/lejos de Córdoba/))
    // Sin ubicación no hay distancias: ninguna línea empieza con «a » y un número.
    expect(within(lista()).queryByText(/^a \d/)).toBeNull()
  })

  it('sin ningún punto que cumpla los filtros lo dice, y «Ver todos» vacía los filtros y vuelve a mostrarlos', async () => {
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    fireEvent.click(screen.getByRole('button', { name: 'Abiertos ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Papel' }))
    // El único punto con papel (la Plaza España) está cerrado.
    const aviso = screen.getByText('Ningún punto cumple esos filtros.')
    expect(screen.queryByRole('list', { name: 'Puntos de la red' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^pin / })).not.toBeInTheDocument()
    fireEvent.click(within(aviso).getByRole('button', { name: 'Ver todos' }))
    expect(screen.queryByText('Ningún punto cumple esos filtros.')).not.toBeInTheDocument()
    expect(nombresDeLaLista()).toEqual(['Sede', 'Kempes', 'Plaza España'])
    expect(screen.getByRole('button', { name: 'Abiertos ahora' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Papel' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('elegir un pin marca su tarjeta en la lista, y la cruz cierra la del mapa', async () => {
    verMapa()
    fireEvent.click(await screen.findByRole('button', { name: 'pin Kempes' }))
    expect(within(lista()).getByRole('button', { name: /Kempes/ })).toHaveAttribute('aria-pressed', 'true')
    expect(within(lista()).getByRole('button', { name: /Sede/ })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(within(screen.getByRole('region', { name: 'Kempes' })).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('region', { name: 'Kempes' })).not.toBeInTheDocument()
    expect(within(lista()).getByRole('button', { name: /Kempes/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('«Ver todos», sobre el mapa, le pide que encuadre todos los puntos, cada vez que se toca', async () => {
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    expect(elMapa()).toHaveAttribute('data-vista', 'centro-0')
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }))
    expect(elMapa()).toHaveAttribute('data-vista', 'todos-1')
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }))
    expect(elMapa()).toHaveAttribute('data-vista', 'todos-2')
  })

  it('«Cerca mío» le pasa al mapa dónde estás; lejos de Córdoba el mapa no se entera', async () => {
    ubicadoEn(-34.6037, -58.3816)
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(elMapa()).toHaveAttribute('data-ubicacion', '')

    ubicadoEn(-31.4286, -64.1849)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(elMapa()).toHaveAttribute('data-ubicacion', '-31.4286,-64.1849')
  })

  // En el celular el mapa queda arriba y la lista abajo: tocar un punto de la lista abría la tarjeta fuera de la pantalla.
  it('tocar un punto de la lista sube hasta el mapa, para ver la tarjeta; tocar un pin no mueve la pantalla', async () => {
    const scrollIntoView = espiarElScroll()
    verMapa()
    const enLaLista = (nombre: RegExp) => within(lista()).getByRole('button', { name: nombre })
    await screen.findByRole('button', { name: 'pin Sede' })

    fireEvent.click(enLaLista(/Plaza España/))
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    // Sube hasta el mapa y nada más que lo justo: en la compu, donde el mapa está fijo y a la vista, no se mueve nada.
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByRole('region', { name: 'Mapa de Córdoba' }))
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })

    // El mismo punto, otra vez: el hincha puede haber bajado de nuevo a la lista y vuelve a necesitar el mapa.
    fireEvent.click(enLaLista(/Plaza España/))
    expect(scrollIntoView).toHaveBeenCalledTimes(2)

    // Desde un pin el mapa ya está a la vista: no hay nada que subir.
    scrollIntoView.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'pin Sede' }))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('en un navegador sin scrollIntoView (jsdom lo es), tocar un punto de la lista igual lo elige y no se cae', async () => {
    // Un error en el toque no rompe la prueba: llega a la ventana. Vitest sólo lo da por «no atendido» si nadie escucha.
    const caidas: unknown[] = []
    const alCaer = (evento: ErrorEvent) => {
      evento.preventDefault()
      caidas.push(evento.error)
    }
    window.addEventListener('error', alCaer)
    try {
      expect(Element.prototype.scrollIntoView).toBeUndefined()
      verMapa()
      fireEvent.click(await within(await screen.findByRole('list', { name: 'Puntos de la red' })).findByRole('button', { name: /Plaza España/ }))
      expect(screen.getByRole('region', { name: 'Plaza España' })).toBeInTheDocument()
      expect(caidas).toEqual([])
    } finally {
      window.removeEventListener('error', alCaer)
    }
  })

  it('el mapa mide menos en el celular, para dejar lugar donde deslizar la página, y deja sitio al encabezado fijo', async () => {
    verMapa()
    const mapa = await screen.findByRole('region', { name: 'Mapa de Córdoba' })
    // 48vh y no 58vh: Leaflet se queda con el deslizar sobre el mapa, así que alrededor tiene que quedar página.
    expect(mapa).toHaveClass('h-[48vh]', 'min-h-80', 'lg:h-[70vh]')
    expect(mapa).not.toHaveClass('h-[58vh]')
    // Al subir hasta él, el encabezado fijo (arriba, sólo en el celular) no tiene que taparlo...
    expect(mapa).toHaveClass('scroll-mt-20')
    // ...pero en la compu no hay encabezado y el mapa queda fijo a 24 px del borde: con ese margen de 80 px parece cortado
    // y cada toque en la lista empuja la página 56 px (medido en Chrome, a 1280×800).
    expect(mapa).toHaveClass('lg:scroll-mt-0')
  })

  it('elegir un punto —del pin o de la lista, aunque ya sea el elegido— le pide al mapa que vuele hasta él; cerrar la tarjeta no', async () => {
    verMapa()
    const pin = await screen.findByRole('button', { name: 'pin Sede' })
    expect(elMapa()).toHaveAttribute('data-vuelo', '0')

    fireEvent.click(pin)
    expect(elMapa()).toHaveAttribute('data-vuelo', '1')
    fireEvent.click(pin)
    expect(elMapa()).toHaveAttribute('data-vuelo', '2')
    fireEvent.click(within(lista()).getByRole('button', { name: /Sede/ }))
    expect(elMapa()).toHaveAttribute('data-vuelo', '3')
    fireEvent.click(within(lista()).getByRole('button', { name: /Kempes/ }))
    expect(elMapa()).toHaveAttribute('data-vuelo', '4')

    fireEvent.click(within(screen.getByRole('region', { name: 'Kempes' })).getByRole('button', { name: 'Cerrar' }))
    expect(elMapa()).toHaveAttribute('data-vuelo', '4')
  })

  it('«Cerca mío» pide una ubicación que alcance adentro de un local: sin alta precisión, con 10 s de espera y aceptando una de hasta 1 min', async () => {
    const getCurrentPosition = vi.fn((ok: PositionCallback) => ok({ coords: { latitude: -31.4286, longitude: -64.1849 } } as GeolocationPosition))
    conUbicacion(getCurrentPosition as unknown as Geolocation['getCurrentPosition'])
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ })))
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
  })

  it('mientras «Cerca mío» espera, el botón dice «Buscando…» y no se puede tocar otra vez; al contestar vuelve a ser «Cerca mío»', async () => {
    const { getCurrentPosition, responder } = ubicacionQueTarda()
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    expect(screen.getByRole('button', { name: /Cerca mío/ })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ }))
    const buscando = screen.getByRole('button', { name: /Buscando…/ })
    expect(buscando).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Cerca mío/ })).not.toBeInTheDocument()
    fireEvent.click(buscando)
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)

    responder(-31.4286, -64.1849)
    expect(screen.getByRole('button', { name: /Cerca mío/ })).toBeEnabled()
    expect(screen.queryByRole('button', { name: /Buscando…/ })).not.toBeInTheDocument()
    expect(elMapa()).toHaveAttribute('data-ubicacion', '-31.4286,-64.1849')
  })

  it('si «Cerca mío» falla, el botón vuelve a poder tocarse; y con el permiso denegado el aviso manda a revisar el permiso', async () => {
    const error = vi.spyOn(toast, 'error')
    const { fallar } = ubicacionQueTarda()
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ }))
    expect(screen.getByRole('button', { name: /Buscando…/ })).toBeDisabled()

    fallar(1)
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('No pudimos ubicarte: revisá el permiso de ubicación del navegador.')
    expect(screen.getByRole('button', { name: /Cerca mío/ })).toBeEnabled()
    expect(elMapa()).toHaveAttribute('data-ubicacion', '')
  })

  // Con la ubicación no disponible o el tiempo agotado el permiso no tiene la culpa: mandar a revisarlo confundiría.
  it.each([
    [2, 'la ubicación no está disponible'],
    [3, 'se agotó el tiempo'],
  ])('si «Cerca mío» falla porque %i (%s), pide probar de nuevo en vez de culpar al permiso', async (code) => {
    const error = vi.spyOn(toast, 'error')
    const { fallar } = ubicacionQueTarda()
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ }))

    fallar(code)
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('No pudimos ubicarte ahora. Probá de nuevo en un momento.')
    expect(error).not.toHaveBeenCalledWith(expect.stringMatching(/permiso/))
    expect(screen.getByRole('button', { name: /Cerca mío/ })).toBeEnabled()
  })

  it('en un navegador que no comparte la ubicación, «Cerca mío» lo dice y no se queda buscando', async () => {
    const error = vi.spyOn(toast, 'error')
    verMapa()
    await screen.findByRole('button', { name: 'pin Sede' })
    expect(window.navigator.geolocation).toBeUndefined()

    fireEvent.click(screen.getByRole('button', { name: /Cerca mío/ }))
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('Este navegador no comparte la ubicación.')
    expect(screen.getByRole('button', { name: /Cerca mío/ })).toBeEnabled()
    expect(screen.queryByRole('button', { name: /Buscando…/ })).not.toBeInTheDocument()
  })

  it('con la red vacía dice que todavía no hay puntos, y no ofrece un «Ver todos» que no haría nada', async () => {
    red = []
    verMapa()
    // Mientras la red no contestó no se sabe si está vacía: no se anuncia nada todavía.
    expect(screen.queryByText('Todavía no hay puntos en la red.')).not.toBeInTheDocument()
    const aviso = await screen.findByText('Todavía no hay puntos en la red.')
    expect(within(aviso).queryByRole('button')).toBeNull()
    expect(screen.queryByText('Ningún punto cumple esos filtros.')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Puntos de la red' })).not.toBeInTheDocument()

    // Aunque se prenda un filtro, la red sigue vacía: no es que los filtros no dejen nada.
    fireEvent.click(screen.getByRole('button', { name: 'Abiertos ahora' }))
    expect(screen.getByText('Todavía no hay puntos en la red.')).toBeInTheDocument()
    expect(screen.queryByText('Ningún punto cumple esos filtros.')).not.toBeInTheDocument()
  })
})
