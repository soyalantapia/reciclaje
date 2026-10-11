import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
})
