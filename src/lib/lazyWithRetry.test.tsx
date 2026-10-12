import { Component, Suspense, type ComponentType, type ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { claveDeAlmacenamiento } from '@/lib/escenario'
import { lazyWithRetry } from './lazyWithRetry'

/** La marca de «ya se recargó una vez por un pedazo que no estaba»: dura lo que la pestaña. */
const MARCA = claveDeAlmacenamiento('chunk-reload')
/** Lo que dice el navegador cuando un deploy cambió los pedazos y el viejo ya no existe. */
const SIN_EL_PEDAZO = new Error('Failed to fetch dynamically imported module')

/** Deja ver el error que la pantalla perezosa hace subir: sin una barrera, React tumbaría el árbol entero. */
class Barrera extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    return this.state.error ? <p>Se cayó: {this.state.error.message}</p> : this.props.children
  }
}

function verLaPantalla(pedazo: () => Promise<{ default: ComponentType }>) {
  const Pantalla = lazyWithRetry(pedazo)
  return render(
    <Barrera>
      <Suspense fallback={<p>Cargando…</p>}>
        <Pantalla />
      </Suspense>
    </Barrera>,
  )
}

let recargar: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  // jsdom no deja espiar `location.reload` (no se puede redefinir): se reemplaza `location` entero.
  recargar = vi.fn()
  vi.stubGlobal('location', { ...window.location, reload: recargar })
  // React cuenta en la consola el error que atrapa la barrera: acá es lo esperado.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('lazyWithRetry', () => {
  it('si el pedazo llega, muestra la pantalla y no recarga nada', async () => {
    verLaPantalla(() => Promise.resolve({ default: () => <p>La pantalla</p> }))
    expect(await screen.findByText('La pantalla')).toBeInTheDocument()
    expect(recargar).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(MARCA)).toBeNull()
  })

  it('si el pedazo no está (un deploy lo cambió), recarga la página una vez, deja la marca y sigue en «Cargando…»', async () => {
    verLaPantalla(() => Promise.reject(SIN_EL_PEDAZO))
    await waitFor(() => expect(recargar).toHaveBeenCalledTimes(1))
    expect(sessionStorage.getItem(MARCA)).toBe('1')
    // Mientras la página se recarga no hay nada que mostrar ni que avisar.
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
    expect(screen.queryByText(/Se cayó/)).not.toBeInTheDocument()
  })

  it('si ya se recargó una vez y vuelve a fallar, no recarga en bucle: el error sube', async () => {
    sessionStorage.setItem(MARCA, '1')
    verLaPantalla(() => Promise.reject(SIN_EL_PEDAZO))
    expect(await screen.findByText('Se cayó: Failed to fetch dynamically imported module')).toBeInTheDocument()
    expect(recargar).not.toHaveBeenCalled()
  })
})
