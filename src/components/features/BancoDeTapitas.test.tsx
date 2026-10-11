import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FormaDelProducto } from '@/types'
import { BancoDeTapitas } from './BancoDeTapitas'

const FORMAS: FormaDelProducto[] = ['banco', 'butacas', 'arco', 'libre']

describe('BancoDeTapitas: las formas', () => {
  it('sin forma es el banco de siempre', () => {
    const { container } = render(<BancoDeTapitas progreso={0.5} propias={0} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-forma')).toBe('banco')
    expect(svg.getAttribute('viewBox')).toBe('0 0 166 90')
    expect(svg.getAttribute('aria-label')).toBe('Banco de tapitas: 40 de 80 encendidas')
  })

  it('cada forma nombra lo que dibuja', () => {
    const nombres = FORMAS.map((forma) => {
      const { container } = render(<BancoDeTapitas forma={forma} progreso={0.5} propias={0} />)
      return container.querySelector('svg')!.getAttribute('aria-label')
    })
    expect(nombres).toEqual([
      'Banco de tapitas: 40 de 80 encendidas',
      'Butacas de tapitas: 40 de 80 encendidas',
      'Arco de tapitas: 40 de 80 encendidas',
      'Producto de tapitas: 40 de 80 encendidas',
    ])
  })

  it.each(FORMAS)('en «%s» las 80 tapitas entran enteras en el dibujo', (forma) => {
    const { container } = render(<BancoDeTapitas forma={forma} progreso={1} propias={0} />)
    const [, , ancho, alto] = container.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number)
    const tapitas = [...container.querySelectorAll('circle')]
    expect(tapitas).toHaveLength(80)
    for (const c of tapitas) {
      const cx = Number(c.getAttribute('cx'))
      const cy = Number(c.getAttribute('cy'))
      const r = Number(c.getAttribute('r'))
      expect(cx - r).toBeGreaterThanOrEqual(0)
      expect(cy - r).toBeGreaterThanOrEqual(0)
      expect(cx + r).toBeLessThanOrEqual(ancho)
      expect(cy + r).toBeLessThanOrEqual(alto)
    }
  })

  it('en el arco, ninguna tapita pisa los palos ni el travesaño', () => {
    const { container } = render(<BancoDeTapitas forma="arco" progreso={1} propias={0} />)
    for (const c of container.querySelectorAll('circle')) {
      const cx = Number(c.getAttribute('cx'))
      const cy = Number(c.getAttribute('cy'))
      const r = Number(c.getAttribute('r'))
      expect(cx - r).toBeGreaterThan(7)
      expect(cx + r).toBeLessThan(178 - 7)
      expect(cy - r).toBeGreaterThan(7)
    }
  })

  it.each([
    ['banco', '0 0 166 90'],
    ['butacas', '0 0 190 90'],
    ['arco', '0 0 178 72'],
    ['libre', '0 0 166 66'],
  ] as const)('el dibujo «%s» mide %s', (forma, viewBox) => {
    const { container } = render(<BancoDeTapitas forma={forma} progreso={0} propias={0} />)
    expect(container.querySelector('svg')!.getAttribute('viewBox')).toBe(viewBox)
  })

  it('una forma que no se conoce (guardada por otra versión) se dibuja como banco y no rompe la pantalla', () => {
    const { container } = render(<BancoDeTapitas forma={'cestos' as FormaDelProducto} progreso={0.5} propias={0} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 166 90')
    expect(svg.getAttribute('aria-label')).toBe('Banco de tapitas: 40 de 80 encendidas')
    expect(container.querySelectorAll('circle')).toHaveLength(80)
  })

  it('las butacas son cuatro respaldos de cuatro columnas, con un hueco entre uno y otro', () => {
    const { container } = render(<BancoDeTapitas forma="butacas" progreso={1} propias={0} />)
    const columnas = [...new Set([...container.querySelectorAll('circle')].map((c) => Number(c.getAttribute('cx'))))]
    const pasos = columnas.slice(1).map((x, i) => x - columnas[i])
    expect(pasos).toEqual([10, 10, 10, 18, 10, 10, 10, 18, 10, 10, 10, 18, 10, 10, 10])
  })
})
