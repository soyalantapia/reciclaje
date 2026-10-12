import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint, Sponsor } from '@/types'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import MapPoints from './MapPoints'

// El mapa de Leaflet se reemplaza: acá se prueba la pantalla. Cada pin es un botón que dice si está elegido, y el mapa
// anota qué encuadre le piden y dónde está el hincha.
vi.mock('@/components/features/MapaDeCordoba', () => ({
  default: ({ puntos, elegido, onElegir, vista, miUbicacion }: {
    puntos: RecyclePoint[]; elegido: string | null; onElegir: (id: string) => void
    vista: { tipo: string; n: number }; miUbicacion: { lat: number; lng: number } | null
  }) => (
    <div data-testid="mapa" data-vista={`${vista.tipo}-${vista.n}`} data-ubicacion={miUbicacion ? `${miUbicacion.lat},${miUbicacion.lng}` : ''}>
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

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve(PUNTOS),
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

beforeEach(() => sessionStorage.clear())
afterEach(() => {
  vi.restoreAllMocks()
  delete (window.navigator as { geolocation?: Geolocation }).geolocation
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
})
