import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Sponsor } from '@/types'
import { EscudoInvalido } from '@/lib/escudo'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { useSessionStore } from '@/store/session'
import CommerceMarca from './CommerceMarca'

// jsdom no tiene canvas: leer la imagen se reemplaza; lo que se guarda y se muestra se prueba de verdad.
const preparar = vi.hoisted(() => vi.fn())
vi.mock('@/lib/escudo', async (original) => ({
  ...(await original<typeof import('@/lib/escudo')>()),
  prepararEscudo: preparar,
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
// Un escudo de mentira: no es el de ningún club.
const ESCUDO = 'data:image/png;base64,ESCUDO'
const archivo = () => new File(['x'], 'escudo.png', { type: 'image/png' })

function verMarca(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter initialEntries={['/comercio/marca']}>
      <Routes>
        <Route path="/comercio/marca" element={<CommerceMarca />} />
        <Route path="/comercio" element={<p>Resumen del panel</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useMarcaDelClubStore.setState({ marcas: {} })
  preparar.mockReset()
})

describe('la marca del club', () => {
  it('subir el escudo lo guarda con el color que sale de él, y se ve', async () => {
    preparar.mockResolvedValue({ escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    expect(await screen.findByRole('img', { name: 'Escudo de Talleres' })).toHaveAttribute('src', ESCUDO)
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#0b2d6b' })
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#0b2d6b')
  })

  it('si del escudo no sale un color, queda el que había', async () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#aa0000' })
    preparar.mockResolvedValue({ escudo: ESCUDO, color: null })
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    await screen.findByRole('img', { name: 'Escudo de Talleres' })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#aa0000' })
  })

  it('un archivo que no sirve dice por qué, y no guarda nada', async () => {
    preparar.mockRejectedValue(new EscudoInvalido('El escudo pesa más de 2 MB: probá con uno más liviano.'))
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    expect(await screen.findByRole('alert')).toHaveTextContent('pesa más de 2 MB')
    expect(useMarcaDelClubStore.getState().marcas).toEqual({})
  })

  it('el selector cambia el color', () => {
    verMarca()
    fireEvent.change(screen.getByLabelText('Color de la marca'), { target: { value: '#123456' } })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ color: '#123456' })
  })

  it('«Volver a los colores de ReciclaXP» borra la marca', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    fireEvent.click(screen.getByRole('button', { name: /Volver a los colores de ReciclaXP/ }))
    expect(useMarcaDelClubStore.getState().marcas).toEqual({})
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it('avisa que queda sólo en este navegador y que la marca es del club', () => {
    verMarca()
    expect(screen.getByText(/Se guarda sólo en este navegador: no se publica/)).toBeInTheDocument()
    expect(screen.getByText(/usalos con su permiso/)).toBeInTheDocument()
  })

  it('un comercio no tiene marca de club: lo manda al resumen', async () => {
    verMarca({ ...club, id: 's_cafe', category: 'comercio' })
    expect(await screen.findByText('Resumen del panel')).toBeInTheDocument()
  })
})

// El 600 de la paleta es el de los botones: si el texto blanco no se lee sobre el color de la marca,
// va más oscuro (colorLegible). Eso se avisa sólo cuando hay una marca con un color así.
describe('el aviso de que en los botones el color va más oscuro', () => {
  const AVISO = /En los botones va un poco más oscuro, para que el texto blanco se lea/

  it('sin marca no está: todavía no se eligió nada, y el verde de ReciclaXP no se presenta como una marca', () => {
    verMarca()
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument()
  })

  it('con un color claro, sobre el que el texto blanco no se lee, avisa', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#ffe14d' })
    verMarca()
    expect(screen.getByText(AVISO)).toBeInTheDocument()
  })

  it('con un color oscuro, que ya se lee con texto blanco, no hace falta', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { color: '#0b2d6b' })
    verMarca()
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument()
  })

  // El verde de ReciclaXP es el «todavía no eligió el suyo»: no pisa la paleta, así que no hay nada que oscurecer.
  it('con el verde de ReciclaXP y un escudo, tampoco: el panel no lo oscurece', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#059669' })
    verMarca()
    expect(screen.getByRole('img', { name: 'Escudo de Talleres' })).toHaveAttribute('src', ESCUDO)
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument()
  })

  it('un escudo del que no sale ningún color (blanco y gris) no deja el aviso, aunque quede guardado el verde', async () => {
    preparar.mockResolvedValue({ escudo: ESCUDO, color: null })
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    await screen.findByRole('img', { name: 'Escudo de Talleres' })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#059669' })
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#059669')
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument()
  })
})

// Lo que el navegador tiene guardado puede no respetar la forma: una versión vieja, o alguien que lo tocó.
// La pantalla de la marca tiene que abrir igual, con el verde de ReciclaXP, para poder arreglarlo desde ahí.
describe('si lo guardado en el navegador viene roto', () => {
  /** Lo que podría haber en el store si se lee algo que no respeta el tipo. */
  const guardadoRoto = (marcas: unknown) => useMarcaDelClubStore.setState({ marcas } as never)

  it('sin ninguna marca (marcas: null), abre con el verde de ReciclaXP y sin escudo', () => {
    guardadoRoto(null)
    verMarca()
    expect(screen.getByRole('heading', { level: 1, name: 'La marca de Talleres' })).toBeInTheDocument()
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#059669')
    expect(screen.queryByRole('img', { name: 'Escudo de Talleres' })).not.toBeInTheDocument()
  })

  it.each([
    ['sin color', { escudo: ESCUDO }],
    ['con el color en un número', { escudo: ESCUDO, color: 123 }],
  ])('una marca %s abre con el verde de ReciclaXP, conserva el escudo y no avisa nada', (_, marca) => {
    guardadoRoto({ s_club: marca })
    verMarca()
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#059669')
    expect(screen.getByRole('img', { name: 'Escudo de Talleres' })).toHaveAttribute('src', ESCUDO)
    expect(screen.queryByText(/En los botones va un poco más oscuro/)).not.toBeInTheDocument()
  })

  it('elegir un color desde ahí lo arregla', () => {
    guardadoRoto({ s_club: { escudo: ESCUDO, color: 123 } })
    verMarca()
    fireEvent.change(screen.getByLabelText('Color de la marca'), { target: { value: '#123456' } })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#123456' })
  })
})

// Lo que el brief no fija y que, si se rompe, se nota recién en el uso: el escudo que se pierde al
// cambiar el color, el botón que queda trabado, el aviso de error que no se va.
describe('la pantalla en uso', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sin marca muestra el verde de ReciclaXP y no ofrece volver a él', () => {
    verMarca()
    expect(screen.getByLabelText('Color de la marca')).toHaveValue('#059669')
    expect(screen.getByText('#059669')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Volver a los colores de ReciclaXP/ })).not.toBeInTheDocument()
  })

  it('sin escudo ofrece subirlo y deja la inicial; con escudo, ofrece cambiarlo', () => {
    const { unmount } = verMarca()
    expect(screen.getByRole('button', { name: /Subir el escudo/ })).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument()
    unmount()
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    expect(screen.getByRole('button', { name: /Cambiar el escudo/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Subir el escudo/ })).not.toBeInTheDocument()
  })

  it('cambiar el color conserva el escudo que ya se subió', () => {
    useMarcaDelClubStore.getState().guardar('s_club', { escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    fireEvent.change(screen.getByLabelText('Color de la marca'), { target: { value: '#123456' } })
    expect(useMarcaDelClubStore.getState().marcas.s_club).toEqual({ escudo: ESCUDO, color: '#123456' })
    expect(screen.getByRole('img', { name: 'Escudo de Talleres' })).toHaveAttribute('src', ESCUDO)
    // Y el código que se lee al lado del selector es el elegido.
    expect(screen.getByText('#123456')).toBeInTheDocument()
  })

  it('mientras lee el escudo no deja subir otro, y cuando termina vuelve a dejar', async () => {
    let terminar!: (leido: { escudo: string; color: string | null }) => void
    preparar.mockReturnValue(new Promise((resolve) => (terminar = resolve)))
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    expect(screen.getByRole('button', { name: /Subir el escudo/ })).toBeDisabled()
    terminar({ escudo: ESCUDO, color: '#0b2d6b' })
    await screen.findByRole('img', { name: 'Escudo de Talleres' })
    await waitFor(() => expect(screen.getByRole('button', { name: /Cambiar el escudo/ })).toBeEnabled())
  })

  it('el campo de archivo, que está oculto, no es una parada del Tab y mientras se lee el escudo queda deshabilitado', async () => {
    let terminar!: (leido: { escudo: string; color: string | null }) => void
    preparar.mockReturnValue(new Promise((resolve) => (terminar = resolve)))
    verMarca()
    const campo = screen.getByLabelText('Archivo del escudo')
    // El botón «Subir el escudo» es la única entrada con teclado; el campo sólo lo abre el botón.
    expect(campo).toHaveAttribute('tabindex', '-1')
    expect(campo).toBeEnabled()
    fireEvent.change(campo, { target: { files: [archivo()] } })
    expect(campo).toBeDisabled()
    terminar({ escudo: ESCUDO, color: '#0b2d6b' })
    await screen.findByRole('img', { name: 'Escudo de Talleres' })
    await waitFor(() => expect(campo).toBeEnabled())
  })

  it('el campo acepta los cuatro tipos de imagen del escudo y la ayuda dice el tope de peso', () => {
    verMarca()
    expect(screen.getByLabelText('Archivo del escudo')).toHaveAttribute('accept', 'image/png,image/jpeg,image/svg+xml,image/webp')
    expect(screen.getByText('PNG, JPG, SVG o WebP, hasta 2 MB.')).toBeInTheDocument()
  })

  it('el aviso de error se va cuando se sube un escudo que sirve', async () => {
    preparar.mockRejectedValueOnce(new EscudoInvalido('El escudo pesa más de 2 MB: probá con uno más liviano.'))
    preparar.mockResolvedValueOnce({ escudo: ESCUDO, color: '#0b2d6b' })
    verMarca()
    const entrada = screen.getByLabelText('Archivo del escudo')
    fireEvent.change(entrada, { target: { files: [archivo()] } })
    await screen.findByRole('alert')
    fireEvent.change(entrada, { target: { files: [archivo()] } })
    await screen.findByRole('img', { name: 'Escudo de Talleres' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('si falla algo que no es del escudo, avisa sin mostrar el texto técnico y no guarda nada', async () => {
    preparar.mockRejectedValue(new Error('SecurityError: The operation is insecure.'))
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [archivo()] } })
    const aviso = await screen.findByRole('alert')
    expect(aviso).toHaveTextContent('No se pudo leer el escudo. Probá con otra imagen.')
    expect(aviso).not.toHaveTextContent('SecurityError')
    expect(useMarcaDelClubStore.getState().marcas).toEqual({})
  })

  it('el cartel dice si el color salió del escudo o si hay que elegirlo', async () => {
    const exito = vi.spyOn(toast, 'success')
    preparar.mockResolvedValueOnce({ escudo: ESCUDO, color: '#0b2d6b' })
    preparar.mockResolvedValueOnce({ escudo: ESCUDO, color: null })
    verMarca()
    const entrada = screen.getByLabelText('Archivo del escudo')
    fireEvent.change(entrada, { target: { files: [archivo()] } })
    await waitFor(() => expect(exito).toHaveBeenLastCalledWith('Listo: el panel ya usa tu escudo y su color'))
    fireEvent.change(entrada, { target: { files: [archivo()] } })
    await waitFor(() => expect(exito).toHaveBeenLastCalledWith('Listo: subimos el escudo. Elegí el color abajo.'))
    expect(exito).toHaveBeenCalledTimes(2)
  })

  it('si no se eligió ningún archivo, no pasa nada', () => {
    verMarca()
    fireEvent.change(screen.getByLabelText('Archivo del escudo'), { target: { files: [] } })
    expect(preparar).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(useMarcaDelClubStore.getState().marcas).toEqual({})
  })
})
