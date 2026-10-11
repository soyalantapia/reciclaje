import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BottomNav } from './BottomNav'

describe('el césped', () => {
  // Alan, 11/10: «no me gusta el fondo con una celda pintada y la otra sí y la otra no».
  const css = readFileSync('src/index.css', 'utf8')
  const bloque = css.slice(css.indexOf('.bg-cancha'), css.indexOf('}', css.indexOf('.bg-cancha')) + 1)

  it('es un verde liso con un degradé suave, sin franjas', () => {
    expect(bloque).not.toMatch(/repeating-linear-gradient/)
    expect(bloque).toMatch(/linear-gradient\(\s*180deg,\s*var\(--cancha-claro\),\s*var\(--cancha-oscuro\)\s*\)/)
  })
})

describe('«Pasate a Premium»', () => {
  // Alan, 11/10: «el negro rompe mucho».
  const perfil = readFileSync('src/pages/Profile.tsx', 'utf8')
  const tarjeta = perfil.slice(perfil.indexOf('Pasate a Premium') - 600, perfil.indexOf('Pasate a Premium'))

  it('no usa el degradé casi negro ni el texto blanco', () => {
    expect(tarjeta).not.toMatch(/from-ink-800|to-ink-900|text-white/)
    expect(tarjeta).toMatch(/from-xp-50/)
  })
})

describe('la barra de abajo', () => {
  function verBarra(ruta = '/') {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <BottomNav />
        <Routes>
          <Route path="*" element={<p>pantalla</p>} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('cada ícono va envuelto en su animación, y siguen las cinco etiquetas', () => {
    const { container } = verBarra()
    for (const etiqueta of ['Inicio', 'Mapa', 'Escanear', 'Beneficios', 'Perfil']) {
      expect(screen.getByRole('link', { name: etiqueta })).toBeInTheDocument()
    }
    expect(container.querySelectorAll('[data-icono]')).toHaveLength(5)
  })

  it('tocar un ícono navega y lo marca como activo', () => {
    verBarra('/')
    fireEvent.click(screen.getByRole('link', { name: 'Mapa' }))
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('aria-current', 'page')
  })
})
