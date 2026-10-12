import { fireEvent, render, screen } from '@testing-library/react'
import L from 'leaflet'
import type { ComponentProps } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint, Sponsor } from '@/types'
import MapaDeCordoba from './MapaDeCordoba'

// Acá va Leaflet de verdad (la prueba de la pantalla lo reemplaza). jsdom no calcula tamaños y Leaflet
// encuadra con el del contenedor: sin uno, el zoom da NaN y se cae. Se le da el de un celular.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 360 })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 480 })
})
afterEach(() => vi.restoreAllMocks())

const marca: Sponsor = { id: 's_cafe', name: 'Café Andino', slug: 'cafe', category: 'comercio', brandColor: '#7c3aed', tagline: '', greenScore: 70, kgRecovered: 100 }
const punto = (id: string, name: string, lat: number, lng: number): RecyclePoint => ({
  id, name, sponsorId: 's_cafe', type: 'deposito', address: `${name} 123`, city: 'Córdoba', lat, lng, acceptedMaterials: ['tapitas'], openNow: true,
})
const SEDE = punto('p_sede', 'Sede', -31.415995, -64.183657)
const ESPANA = punto('p_espana', 'Plaza España', -31.428564, -64.184875)

/** El mapa como lo arma la pantalla al abrirse; cada prueba cambia lo que le interesa. */
const elMapa = (props: Partial<ComponentProps<typeof MapaDeCordoba>> = {}) => (
  <MapaDeCordoba
    puntos={[SEDE, ESPANA]}
    marcas={new Map([[marca.id, marca]])}
    elegido={null}
    onElegir={() => {}}
    miUbicacion={null}
    vista={{ tipo: 'centro', n: 0 }}
    vuelo={0}
    {...props}
  />
)
const verElMapa = (props: Partial<ComponentProps<typeof MapaDeCordoba>> = {}) => render(elMapa(props))

describe('el mapa de Leaflet', () => {
  it('pone un pin por punto, con su nombre, y tocarlo lo elige', () => {
    const onElegir = vi.fn()
    verElMapa({ onElegir })
    expect(screen.getAllByRole('button', { name: /Sede|Plaza España/ })).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Plaza España' }))
    expect(onElegir).toHaveBeenCalledTimes(1)
    expect(onElegir).toHaveBeenCalledWith('p_espana')
  })

  it('el pin lleva el color de su marca, y el elegido es más grande y el mapa va hasta él', () => {
    const flyTo = vi.spyOn(L.Map.prototype, 'flyTo')
    const { rerender } = verElMapa()
    const pin = () => screen.getByRole('button', { name: 'Sede' })
    expect(pin().innerHTML).toContain('background:#7c3aed')
    expect(pin().style.width).toBe('30px')
    expect(flyTo).not.toHaveBeenCalled()

    rerender(elMapa({ elegido: 'p_sede' }))
    expect(pin().style.width).toBe('40px')
    expect(flyTo).toHaveBeenCalledTimes(1)
    expect(flyTo).toHaveBeenCalledWith([SEDE.lat, SEDE.lng], expect.any(Number), expect.anything())
    expect(flyTo.mock.calls[0][1]).toBeGreaterThanOrEqual(15)
  })

  it('volver a tocar el punto ya elegido vuelve a llevar el mapa hasta él, aunque se lo haya movido', () => {
    const flyTo = vi.spyOn(L.Map.prototype, 'flyTo')
    const { rerender } = verElMapa()
    rerender(elMapa({ elegido: 'p_sede', vuelo: 1 }))
    expect(flyTo).toHaveBeenCalledTimes(1)

    // El mismo punto, otro toque (la pantalla sube `vuelo`): el hincha pudo haber movido el mapa y quiere volver a él.
    rerender(elMapa({ elegido: 'p_sede', vuelo: 2 }))
    expect(flyTo).toHaveBeenCalledTimes(2)
    expect(flyTo).toHaveBeenLastCalledWith([SEDE.lat, SEDE.lng], expect.any(Number), expect.anything())

    // Sin un toque nuevo no vuela: ni al volver a dibujarse ni al filtrar.
    rerender(elMapa({ elegido: 'p_sede', vuelo: 2 }))
    rerender(elMapa({ puntos: [SEDE], elegido: 'p_sede', vuelo: 2 }))
    expect(flyTo).toHaveBeenCalledTimes(2)
  })

  it('«Ver todos» con un solo punto no se acerca hasta el máximo', () => {
    // Con un punto el recuadro no tiene área: sin tope, el mapa se iría al zoom 19, que es el de la calle misma.
    const fitBounds = vi.spyOn(L.Map.prototype, 'fitBounds')
    verElMapa({ puntos: [SEDE], vista: { tipo: 'todos', n: 1 } })
    const mapa = fitBounds.mock.contexts.at(-1) as L.Map
    expect(fitBounds).toHaveBeenLastCalledWith([[SEDE.lat, SEDE.lng], [SEDE.lat, SEDE.lng]], expect.objectContaining({ maxZoom: 16 }))
    expect(mapa.getZoom()).toBe(16)
  })

  it('filtrar no mueve el mapa: sólo se encuadra cuando se pide', () => {
    const fitBounds = vi.spyOn(L.Map.prototype, 'fitBounds')
    const { rerender } = verElMapa()
    const encuadresAlAbrir = fitBounds.mock.calls.length
    rerender(elMapa({ puntos: [SEDE] }))
    expect(screen.queryByRole('button', { name: 'Plaza España' })).not.toBeInTheDocument()
    expect(fitBounds).toHaveBeenCalledTimes(encuadresAlAbrir)
  })

  it('cita a OpenStreetMap, que es obligatorio, y tiene los botones de zoom en español', () => {
    verElMapa()
    expect(screen.getByRole('link', { name: 'OpenStreetMap' })).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright')
    expect(screen.getByRole('button', { name: 'Acercar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alejar' })).toBeInTheDocument()
  })
})
