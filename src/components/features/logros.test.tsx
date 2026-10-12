// Los logros en pantalla: el perfil los lista con su progreso y el festejo muestra el que se ganó.
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sonarLogro } from '@/lib/sonido'
import type { Logro } from '@/lib/logros'
import { LogroDesbloqueado } from './LogroDesbloqueado'
import { LogrosDelPerfil } from './LogrosDelPerfil'

vi.mock('@/lib/sonido', () => ({ sonarLogro: vi.fn() }))

const logros: Logro[] = [
  { id: 'primera', titulo: 'Primera tapita', detalle: 'Hiciste tu primer aporte.', ganado: true, actual: 1, meta: 1 },
  { id: 'cancha', titulo: 'Hincha de cancha', detalle: 'Dejá tapitas en el Punto R del Estadio en día de partido.', ganado: false, actual: 0, meta: 1 },
  { id: 'mil', titulo: '1.000 tapitas', detalle: 'Llegá a 1.000 tapitas en el banco.', ganado: false, actual: 690, meta: 1000 },
]

describe('logros en pantalla', () => {
  it('el perfil cuenta los ganados y muestra el progreso de los que tienen meta', () => {
    render(<LogrosDelPerfil logros={logros} />)
    const seccion = screen.getByRole('region', { name: 'Tus logros' })
    expect(within(seccion).getByText('1 de 3')).toBeInTheDocument()
    expect(within(seccion).getByText('690 / 1.000')).toBeInTheDocument()
    // Un logro de sí o no (meta 1) no lleva barra.
    expect(within(seccion).queryByText('0 / 1')).toBeNull()
    expect(seccion.querySelectorAll('[data-ganado="true"]')).toHaveLength(1)
  })

  it('el festejo anuncia el logro y lleva a «Tus logros»', () => {
    render(
      <MemoryRouter>
        <LogroDesbloqueado logro={{ ...logros[1], ganado: true, detalle: 'Dejaste tapitas en el Estadio en día de partido.' }} />
      </MemoryRouter>,
    )
    const aviso = screen.getByRole('status')
    expect(aviso.textContent).toMatch(/¡Logro desbloqueado!.*Hincha de cancha.*día de partido/)
    expect(screen.getByRole('link', { name: 'Ver tus logros' }).getAttribute('href')).toBe('/perfil#logros')
    // Suena cuando entra la medalla.
    expect(sonarLogro).toHaveBeenCalledTimes(1)
  })
})
