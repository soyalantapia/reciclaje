const escapar = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * La placa de la Huella Verde que descarga el panel. Sale de la app (se comparte en redes o se imprime), así que lleva
 * el aviso de datos de ejemplo, como toda pantalla con números de la demo.
 */
export function placaHuellaVerde(nombre: string, puntaje: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="28" fill="#065f46"/><text x="300" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" letter-spacing="3" fill="#a7f3d0" font-weight="700">HUELLA VERDE</text><text x="300" y="156" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" font-weight="800">${escapar(nombre)}</text><circle cx="300" cy="248" r="62" fill="#10b981"/><text x="300" y="264" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" fill="#06281f" font-weight="800">${puntaje}</text><text x="300" y="342" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="#a7f3d0">Comprometido con el reciclaje · ReciclaXP</text><text x="300" y="374" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6ee7b7">Datos de ejemplo · demo de ReciclaXP</text></svg>`
}
