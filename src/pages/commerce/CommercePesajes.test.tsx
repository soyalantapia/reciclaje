import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecyclePoint, Sponsor } from '@/types'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { usePesajesStore } from '@/store/pesajesDelClub'
import { useSessionStore } from '@/store/session'
import CommercePesajes from './CommercePesajes'

const punto = (id: string, name: string, sponsorId = 's_club'): RecyclePoint => ({
  id, name, sponsorId, type: 'deposito', address: '', city: 'Córdoba', lat: 0, lng: 0,
  acceptedMaterials: ['tapitas'], openNow: true,
})
const puntos = [
  punto('p_club_estadio', 'Punto R · Estadio'),
  punto('p_club_sede', 'Punto R · Sede social'),
  punto('p_cafe', 'Café Lúmen', 's_cafe'),
]

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: { getPoints: () => Promise.resolve(puntos) },
}))

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}

function verPesajes() {
  useSessionStore.setState({ commerce: club })
  return render(
    <MemoryRouter>
      <CommercePesajes />
    </MemoryRouter>,
  )
}

const escribir = (campo: string, valor: string) => fireEvent.change(screen.getByLabelText(campo), { target: { value: valor } })

beforeEach(() => {
  usePesajesStore.setState({ pesajes: [] })
  useCreatedCommerceStore.setState({ commerce: null, point: null })
})
afterEach(() => vi.restoreAllMocks())

describe('Pesajes del panel del club', () => {
  it('ofrece sólo los Punto R del club y, sin pesajes, explica para qué sirve el primero', async () => {
    verPesajes()
    const opciones = await screen.findAllByRole('option')
    expect(opciones.map((o) => o.textContent)).toEqual(['Punto R · Estadio', 'Punto R · Sede social'])
    expect(screen.getByText(/El primero completa la etapa «Pesaje del lote»/)).toBeInTheDocument()
  })

  it('guarda el pesaje con kilos con coma, lo lista con sus tapitas y avisa que la hinchada ya lo ve', async () => {
    const exito = vi.spyOn(toast, 'success')
    verPesajes()
    await screen.findAllByRole('option')
    escribir('Partido', 'Talleres vs. Belgrano')
    escribir('Fecha', '2026-10-12')
    escribir('Punto R', 'p_club_sede')
    escribir('Kilos', '12,5')
    expect(screen.getByText('≈ 2.975 tapitas, a 238 por kilo')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Guardar pesaje/ }))

    expect(usePesajesStore.getState().pesajes).toEqual([
      expect.objectContaining({ partido: 'Talleres vs. Belgrano', fecha: '2026-10-12', puntoId: 'p_club_sede', kilos: 12.5, tapitas: 2975 }),
    ])
    expect(exito).toHaveBeenCalledWith(expect.stringContaining('la hinchada ya ve el pesaje'))
    const lista = screen.getByRole('heading', { name: 'Pesajes cargados' }).closest('section')!
    expect(within(lista).getByText('Talleres vs. Belgrano')).toBeInTheDocument()
    expect(within(lista).getByText('12,5 kg')).toBeInTheDocument()
    expect(within(lista).getByText('2.975 tapitas')).toBeInTheDocument()
    // Los kilos se vacían para cargar el próximo punto; el partido y la fecha quedan.
    expect(screen.getByLabelText('Kilos')).toHaveValue('')
    expect(screen.getByLabelText('Partido')).toHaveValue('Talleres vs. Belgrano')
  })

  it('no guarda sin partido ni sin kilos válidos', async () => {
    const error = vi.spyOn(toast, 'error')
    verPesajes()
    await screen.findAllByRole('option')
    escribir('Kilos', '10')
    fireEvent.click(screen.getByRole('button', { name: /Guardar pesaje/ }))
    expect(error).toHaveBeenLastCalledWith('Poné qué partido fue')
    escribir('Partido', 'Talleres vs. Belgrano')
    escribir('Kilos', '0')
    fireEvent.click(screen.getByRole('button', { name: /Guardar pesaje/ }))
    expect(error).toHaveBeenLastCalledWith('Poné los kilos que marcó la balanza')
    expect(usePesajesStore.getState().pesajes).toEqual([])
  })

  it('se puede eliminar un pesaje cargado por error', async () => {
    verPesajes()
    await screen.findAllByRole('option')
    escribir('Partido', 'Talleres vs. Belgrano')
    escribir('Kilos', '3')
    fireEvent.click(screen.getByRole('button', { name: /Guardar pesaje/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el pesaje de Talleres vs. Belgrano' }))
    expect(usePesajesStore.getState().pesajes).toEqual([])
  })
})
