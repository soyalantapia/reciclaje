import { ESCENARIO, type Escenario } from './escenario'

/**
 * Cómo le habla el panel a quien entra. Un club o un estadio no son un comercio: no tienen
 * «clientes», ni «vidriera», ni «local». Antes sólo el menú lo distinguía y el resto de las
 * pantallas del panel de la institución decía «comercio».
 */
export interface Vocabulario {
  /** «Panel del comercio» o «Panel de la institución». */
  panel: string
  /** «del comercio» o «de la institución». */
  delQuien: string
  /** «tu comercio» o «tu institución». */
  tuQuien: string
  /** A quiénes les habla: «tus clientes» o «tu comunidad». */
  comunidad: string
  /** Dónde se pega el QR de un punto. */
  dondeVaElQr: string
  /** Dónde se muestra la placa de la Huella Verde. */
  dondeVaLaPlaca: string
  /** Los botones de las otras cuentas de prueba del login. */
  otrosDemo: string
  /** El enlace del login para quien todavía no está en la red. */
  noEsta: string
  /** La bajada del acceso al panel desde el perfil del hincha. */
  gestiona: string
  /** El enlace al panel desde el login del hincha. */
  accesoAlPanel: string
  /** El enlace a los QR de prueba desde la pantalla de escanear. */
  qrParaProbar: string
}

const COMERCIO: Vocabulario = {
  panel: 'Panel del comercio',
  delQuien: 'del comercio',
  tuQuien: 'tu comercio',
  comunidad: 'tus clientes',
  dondeVaElQr: 'el local',
  dondeVaLaPlaca: 'tu vidriera y tus redes',
  otrosDemo: 'Otros comercios demo',
  noEsta: '🏪 ¿Tu comercio no está? Conocé la red y registrate →',
  gestiona: 'Gestioná tu comercio adherido (demo)',
  accesoAlPanel: '🏪 ¿Sos comercio? Ingresá a tu panel →',
  qrParaProbar: '¿Sos comercio? Generá tu QR para probar',
}

const INSTITUCION: Vocabulario = {
  panel: 'Panel de la institución',
  delQuien: 'de la institución',
  tuQuien: 'tu institución',
  comunidad: 'tu comunidad',
  dondeVaElQr: 'cada punto',
  dondeVaLaPlaca: 'tus redes y tus espacios',
  otrosDemo: 'Otros paneles de la demo',
  noEsta: '🏟️ ¿Tu institución no está? Conocé la red y sumate →',
  gestiona: 'Gestioná tu institución en la red (demo)',
  accesoAlPanel: '🏟️ ¿Sos de una institución? Ingresá a tu panel →',
  qrParaProbar: '¿Sos de una institución? Generá tu QR para probar',
}

export function esInstitucion(categoria?: string): boolean {
  return categoria === 'club' || categoria === 'estadio'
}

export function vocabularioDelPanel(categoria?: string): Vocabulario {
  return esInstitucion(categoria) ? INSTITUCION : COMERCIO
}

/**
 * El de las pantallas que se ven antes de entrar al panel (el login, el perfil del hincha): en la
 * demo del club, el panel es el de una institución.
 */
export function vocabularioDelEscenario(escenario: Escenario = ESCENARIO): Vocabulario {
  return escenario === 'club' ? INSTITUCION : COMERCIO
}
