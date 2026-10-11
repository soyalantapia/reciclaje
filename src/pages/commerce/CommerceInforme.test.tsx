import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Contribution, Coupon, ImpactProject, RecyclePoint, Sponsor, TraceEvent, User } from '@/types'
import { useActivityStore } from '@/store/activity'
import { useCommerceProductsStore } from '@/store/commerceProducts'
import { useCouponsStore } from '@/store/coupons'
import { useSessionStore } from '@/store/session'
import { AVISO_DE_EJEMPLO } from '@/lib/reporte'
import { SIN_PESAJES } from '@/lib/informe'
import { NOTA_DEL_REPORTE } from '@/lib/reporteSustentabilidad'
import CommerceInforme from './CommerceInforme'

const club: Sponsor = {
  id: 's_club', name: 'Talleres', slug: 'club', category: 'club', brandColor: '#059669', tagline: '',
  greenScore: 64, kgRecovered: 180,
}
const punto = (id: string, name: string): RecyclePoint => ({
  id, name, sponsorId: 's_club', type: 'deposito', address: '', city: 'Córdoba', x: 0, y: 0,
  acceptedMaterials: ['tapitas', 'plastico'], openNow: true,
})
// Un Punto R de otra marca de la red: el informe del club no lo cuenta como suyo.
const puntos = [
  punto('p_club_estadio', 'Punto R · Estadio'),
  punto('p_club_sede', 'Punto R · Sede social'),
  { ...punto('p_cafe', 'Café Lúmen · Mostrador'), sponsorId: 's_cafe' },
]
const banco = {
  id: 'pr_banco_club', title: 'Banco de suplentes con el plástico de la hinchada', sponsorId: 's_club',
  sponsorName: 'Talleres', description: '', material: 'tapitas', unitLabel: 'tapitas', goalUnits: 300000,
  collectedUnits: 42840, myContributionUnits: 640, estimatedDate: '2027-03-31', illustration: 'bench',
  milestones: [
    { label: 'Recolección', done: false },
    { label: 'Pesaje y retiro', done: false },
  ],
  topContributors: [
    { name: 'Facu R.', units: 3120, avatarColor: '#0ea5e9' },
    { name: 'Camila R.', units: 640, avatarColor: '#059669' },
  ],
} as ImpactProject
const traza: TraceEvent[] = [
  { stage: 'aporte', title: 'Tu aporte', detail: '640 tapitas.', date: '2026-10-04', done: true },
  {
    stage: 'validacion', title: 'Pesaje del lote',
    detail: 'Al cierre de cada partido, el personal del club pesa lo juntado y lo carga en el panel.',
    date: null, done: false, operator: 'Talleres',
  },
]

// La descarga del CSV se mira sin tocar el navegador: jsdom no tiene URL.createObjectURL.
const descargar = vi.hoisted(() => vi.fn())
vi.mock('@/lib/utils', async (original) => ({
  ...(await original<typeof import('@/lib/utils')>()),
  downloadBlob: descargar,
}))

vi.mock('@/services/api', async (original) => ({
  ...(await original<typeof import('@/services/api')>()),
  api: {
    getPoints: () => Promise.resolve(puntos),
    getSponsors: () => Promise.resolve([club, { ...club, id: 's_cafe', name: 'Café Lúmen', category: 'comercio', greenScore: 70 }]),
    // Como el simulador: los del seed más los que publicó el club.
    getProjects: () => Promise.resolve([banco, ...useCommerceProductsStore.getState().creados]),
    getProjectTrace: () => Promise.resolve(traza),
  },
}))

function verElInforme(sponsor: Sponsor = club) {
  useSessionStore.setState({ commerce: sponsor })
  return render(
    <MemoryRouter>
      <CommerceInforme />
    </MemoryRouter>,
  )
}

const seccion = async (titulo: string) => (await screen.findByRole('heading', { name: titulo })).closest('section')!

beforeAll(() => {
  // jsdom no trae IntersectionObserver: las animaciones al entrar en pantalla lo usan.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

beforeEach(() => {
  useActivityStore.setState({ sessionContributions: [] })
  useCouponsStore.setState({ coupons: [] })
  useCommerceProductsStore.setState({ creados: [] })
  useSessionStore.setState({ user: null })
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.classList.remove('dark')
})

describe('informe para la Comisión Directiva', () => {
  it('lleva el título, la fecha de emisión y el aviso de datos de ejemplo, arriba y al pie', async () => {
    const { container } = verElInforme()
    expect(await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })).toBeInTheDocument()
    expect(screen.getByText(/Emitido el/)).toBeInTheDocument()
    expect(screen.getByText(AVISO_DE_EJEMPLO)).toBeInTheDocument()
    expect(container.querySelector('footer')?.textContent).toContain('Datos de ejemplo de la demo')
  })

  it('pone los números del panel: kilos, tapitas, aportes, hinchas y la Huella Verde con su puesto', async () => {
    verElInforme()
    const numeros = await seccion('En números')
    const t = numeros.textContent ?? ''
    expect(t).toContain('Kilos recuperados180')
    expect(t).toContain('Tapitas42.840')
    expect(t).toContain('Aportes828')
    expect(t).toContain('Hinchas que participaron este mes162')
    expect(t).toContain('Beneficios canjeados28')
    expect(t).toContain('Huella Verde64 de 100')
    expect(await within(numeros).findByText(/Puesto 2 de 2 en la red/)).toBeInTheDocument()
  })

  it('suma lo que la hinchada hizo en esta sesión, con las mismas cuentas que el resumen', async () => {
    const aporte: Contribution = {
      id: 'c_sesion', userId: 'u1', pointId: 'p_club_estadio', pointName: 'Punto R · Estadio', sponsorId: 's_club',
      sponsorName: 'Talleres', material: 'tapitas', units: 50, xpEarned: 10, projectId: 'pr_banco_club',
      status: 'validado', createdAt: new Date().toISOString(),
    }
    const canje: Coupon = {
      id: 'k_sesion', benefitId: 'b1', benefitTitle: 'Entrada', sponsorName: 'Talleres', code: 'ABC123',
      qrPayload: 'x', expiresAt: '2027-01-01',
    }
    useActivityStore.setState({ sessionContributions: [aporte] })
    useCouponsStore.setState({ coupons: [canje] })
    verElInforme()
    const t = (await seccion('En números')).textContent ?? ''
    expect(t).toContain('Aportes829')
    expect(t).toContain('Tapitas42.890')
    expect(t).toContain('Beneficios canjeados29')
  })

  it('muestra cada producto con su dibujo, su avance, dónde junta y en qué etapa está', async () => {
    verElInforme()
    const productos = await seccion('Lo que construye la hinchada')
    expect(productos.textContent).toContain('42.840 de 300.000 tapitas · 14% · meta 1.261 kg')
    expect(productos.querySelector('svg[data-forma="banco"]')).not.toBeNull()
    expect(await within(productos).findByText(/Junta en: Punto R · Estadio, Punto R · Sede social/)).toBeInTheDocument()
    expect(productos.textContent).toContain('Etapa actual: Recolección')
  })

  it('entre los que más aportan, quien usa la demo suma lo de todos los productos', async () => {
    const butacas = {
      ...banco, id: 'pr_nuevo_1', title: 'Butacas para la platea', goalUnits: 119000, collectedUnits: 0,
      myContributionUnits: 0, estimatedDate: '', topContributors: [], forma: 'butacas', puntoId: 'p_club_sede',
    } as ImpactProject
    useCommerceProductsStore.setState({ creados: [butacas] })
    useSessionStore.setState({ user: { name: 'Camila Ríos' } as User })
    useActivityStore.setState({
      sessionContributions: [
        {
          id: 'c_s1', userId: 'u', pointId: 'p_club_sede', pointName: 'Punto R · Sede social', sponsorId: 's_club',
          sponsorName: 'Talleres', material: 'tapitas', units: 50, xpEarned: 100, projectId: 'pr_nuevo_1',
          status: 'validado', createdAt: '2026-10-10T12:00:00.000Z',
        } as Contribution,
      ],
    })
    verElInforme()
    const top = await seccion('Los que más aportan')
    // 640 en el banco y 50 en las butacas: en el informe figura con todo lo suyo.
    expect(await within(top).findByText('690 tapitas')).toBeInTheDocument()
  })

  it('«Partido por partido» muestra la tabla con sus columnas y sin ningún número de partido', async () => {
    verElInforme()
    const partidos = await seccion('Partido por partido')
    expect([...partidos.querySelectorAll('th')].map((th) => th.textContent)).toEqual([
      'Partido', 'Fecha', 'Kilos', 'Tapitas', 'Hinchas',
    ])
    const celdas = partidos.querySelectorAll('tbody td')
    expect(celdas).toHaveLength(1)
    expect(celdas[0].textContent).toBe(SIN_PESAJES)
  })

  it('pone a los que más aportan y lo que sigue: la próxima etapa y las cuatro del piloto', async () => {
    verElInforme()
    const top = (await seccion('Los que más aportan')).textContent ?? ''
    expect(top.indexOf('Facu R.')).toBeLessThan(top.indexOf('Camila R.'))
    expect(top).toContain('3.120 tapitas')
    const sigue = await seccion('Lo que sigue')
    expect(await within(sigue).findByText(/pesaje del lote/)).toBeInTheDocument()
    expect(sigue.textContent).toContain('a cargo de Talleres')
    for (const etapa of ['Preparación', 'Lanzamiento controlado', 'Operación en partidos', 'Evaluación y decisión']) {
      expect(sigue.textContent).toContain(etapa)
    }
  })

  it('ordena los datos para el Reporte de Sustentabilidad del club, por dimensión y con su referencia', async () => {
    verElInforme()
    const reporte = await seccion('Para el Reporte de Sustentabilidad de Talleres')
    for (const dimension of ['Ambiental', 'Comunitaria', 'Infraestructura']) {
      expect(within(reporte).getByText(dimension)).toBeInTheDocument()
    }
    // Cada dimensión encabeza su grupo de filas, y cada indicador encabeza su fila.
    expect(within(reporte).getByRole('rowheader', { name: 'Ambiental' })).toHaveAttribute('scope', 'rowgroup')
    const plastico = within(reporte).getByRole('rowheader', { name: /^Plástico recuperado para reciclar/ }).closest('tr')!
    expect(plastico.textContent).toContain('180 kg (0,18 t)')
    expect(plastico.textContent).toContain('GRI 306-4 · ODS 12.5')
    // Los Punto R son los de la institución, no los de toda la red.
    const puntosR = within(reporte).getByRole('rowheader', { name: /^Puntos de recolección/ }).closest('tr')!
    expect(within(puntosR).getAllByRole('cell')[0]).toHaveTextContent(/^2$/)
    const hinchas = within(reporte).getByText('Hinchas que participaron este mes').closest('tr')!
    expect(hinchas.textContent).toContain('162')
    expect(hinchas.textContent).toContain('GRI 413-1')
    expect(reporte.textContent).toContain('(meta 1.261 kg)')
    expect(reporte.textContent).toContain('42.840 de 300.000 tapitas · 14%')
    expect(reporte.textContent).toContain(NOTA_DEL_REPORTE)
    expect(reporte.textContent).not.toMatch(/certific|verificab|verificad|auditad/i)
  })

  it('dos productos con el mismo nombre son dos filas, sin que React repita una clave', async () => {
    const errores = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const butacas = (id: string, puntoId: string) =>
        ({
          ...banco, id, title: 'Butacas para la platea', goalUnits: 119000, collectedUnits: 0, myContributionUnits: 0,
          estimatedDate: '', topContributors: [], forma: 'butacas', puntoId,
        }) as ImpactProject
      useCommerceProductsStore.setState({ creados: [butacas('pr_nuevo_1', 'p_club_sede'), butacas('pr_nuevo_2', 'p_club_estadio')] })
      verElInforme()
      const reporte = await seccion('Para el Reporte de Sustentabilidad de Talleres')
      expect(await within(reporte).findAllByRole('rowheader', { name: /^Butacas para la platea/ })).toHaveLength(2)
      expect(errores.mock.calls.flat().join(' ')).not.toMatch(/same key/)
    } finally {
      errores.mockRestore()
    }
  })

  it('«Descargar indicadores (CSV)» baja la planilla con el aviso de datos de ejemplo, y no sale al imprimir', async () => {
    descargar.mockClear()
    verElInforme()
    const boton = await screen.findByRole('button', { name: /Descargar indicadores \(CSV\)/ })
    expect(boton.closest('[data-no-imprimir]')).not.toBeNull()
    fireEvent.click(boton)
    expect(descargar).toHaveBeenCalledOnce()
    const [nombre, contenido, tipo] = descargar.mock.calls[0]
    expect(nombre).toBe('indicadores-reporte-sustentabilidad-club.csv')
    expect(contenido).toContain(AVISO_DE_EJEMPLO)
    expect(contenido).toContain('Ambiental,Plástico recuperado para reciclar,180,kg,GRI 306-4 · ODS 12.5')
    expect(tipo).toBe('text/csv;charset=utf-8')
  })

  it('«Descargar PDF» abre la ventana del navegador para guardarlo, y sus botones no se imprimen', async () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
    verElInforme()
    const boton = await screen.findByRole('button', { name: /^Descargar PDF$/ })
    expect(boton.closest('[data-no-imprimir]')).not.toBeNull()
    fireEvent.click(boton)
    expect(imprimir).toHaveBeenCalledOnce()
  })

  // «Descargar PDF» no baja un archivo: abre la ventana de impresión del navegador. La ayuda lo dice, y como
  // vive junto a los botones no sale en el papel.
  it('junto a los botones dice que se abre la ventana del navegador para elegir «Guardar como PDF», y no se imprime', async () => {
    verElInforme()
    await screen.findByRole('button', { name: /^Descargar PDF$/ })
    const ayuda = screen.getByText('Se abre la ventana del navegador: elegí «Guardar como PDF».')
    expect(ayuda.closest('[data-no-imprimir]')).not.toBeNull()
    // Está en el mismo bloque que los botones de arriba, no en el cuerpo del informe.
    expect(ayuda.closest('[data-no-imprimir]')).toBe(screen.getByRole('button', { name: /^Descargar PDF$/ }).closest('[data-no-imprimir]'))
    expect(ayuda.closest('article')).toBeNull()
  })

  it('«Descargar CSV» baja el reporte con el aviso de datos de ejemplo', async () => {
    descargar.mockClear()
    verElInforme()
    const boton = await screen.findByRole('button', { name: /^Descargar CSV$/ })
    expect(boton.closest('[data-no-imprimir]')).not.toBeNull()
    fireEvent.click(boton)
    expect(descargar).toHaveBeenCalledOnce()
    const [nombre, contenido, tipo] = descargar.mock.calls[0]
    expect(nombre).toBe('informe-club.csv')
    expect(contenido).toContain(AVISO_DE_EJEMPLO)
    expect(tipo).toBe('text/csv;charset=utf-8')
  })

  it('ya no tiene el link «Reportes»: el informe es la pantalla de Reportes', async () => {
    verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    expect(screen.queryByRole('link', { name: /Reportes/ })).not.toBeInTheDocument()
  })

  it('en modo oscuro se imprime en claro, y después vuelve al oscuro', async () => {
    document.documentElement.classList.add('dark')
    verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    window.dispatchEvent(new Event('beforeprint'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    window.dispatchEvent(new Event('afterprint'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('si llegan dos avisos de imprimir seguidos, el oscuro igual vuelve', async () => {
    document.documentElement.classList.add('dark')
    verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    window.dispatchEvent(new Event('beforeprint'))
    window.dispatchEvent(new Event('beforeprint'))
    window.dispatchEvent(new Event('afterprint'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('en modo claro, imprimir lo deja claro', async () => {
    verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    window.dispatchEvent(new Event('beforeprint'))
    window.dispatchEvent(new Event('afterprint'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('si se sale del informe a mitad de la impresión, vuelve el oscuro', async () => {
    document.documentElement.classList.add('dark')
    const { unmount } = verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    window.dispatchEvent(new Event('beforeprint'))
    unmount()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('el PDF se propone con el nombre del informe, y al salir vuelve el título de la app', async () => {
    document.title = 'ReciclaXP'
    const { unmount } = verElInforme()
    await screen.findByRole('heading', { level: 1, name: 'Informe para la Comisión Directiva' })
    expect(document.title).toBe('Informe para la Comisión Directiva · Talleres')
    unmount()
    expect(document.title).toBe('ReciclaXP')
  })

  it('un comercio no tiene informe: lo manda a Reportes', async () => {
    // Con rutas de verdad y esperando la redirección: sin eso la prueba daba verde aunque faltara
    // la guarda, porque al mirar la pantalla todavía cargaba y no había título.
    useSessionStore.setState({ commerce: { ...club, id: 's_cafe', category: 'comercio' } })
    render(
      <MemoryRouter initialEntries={['/comercio/informe']}>
        <Routes>
          <Route path="/comercio/informe" element={<CommerceInforme />} />
          <Route path="/comercio/reportes" element={<p>Pantalla de Reportes</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Pantalla de Reportes')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Informe para la Comisión Directiva' })).not.toBeInTheDocument()
  })
})
