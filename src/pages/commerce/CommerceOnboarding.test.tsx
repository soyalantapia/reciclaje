import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import CommerceOnboarding from './CommerceOnboarding'

function verElAlta() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="*" element={<CommerceOnboarding />} />
      </Routes>
    </MemoryRouter>,
  )
}

function escribir(etiqueta: string, valor: string) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
}

function siguiente() {
  fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
}

beforeEach(() => {
  useCreatedCommerceStore.setState({ commerce: null, point: null })
})

describe('el alta de un comercio', () => {
  it('sin ciudad ni dirección elegida en un mapa, el punto nuevo queda en Nueva Córdoba', () => {
    verElAlta()
    escribir('Nombre del comercio', 'Café de Prueba')
    escribir('Email', 'hola@cafedeprueba.com')
    siguiente()
    escribir('Nombre del punto', 'Café de Prueba · Centro')
    siguiente()
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/ }))

    const { point } = useCreatedCommerceStore.getState()
    // Paseo del Buen Pastor: es donde se ve el punto hasta que se elija otro lugar.
    expect(point).toMatchObject({ name: 'Café de Prueba · Centro', city: 'Córdoba', lat: -31.424083, lng: -64.18642 })
    expect(point).not.toHaveProperty('x')
    expect(point).not.toHaveProperty('y')
  })

  it('la ciudad se sugiere como Córdoba, que es la que queda si se deja vacía', () => {
    verElAlta()
    expect(screen.getByLabelText('Ciudad')).toHaveAttribute('placeholder', 'Córdoba')
  })
})
