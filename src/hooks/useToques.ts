import { useCallback, useState } from 'react'

/**
 * Cuenta los toques de cada botón de una barra de navegación (la de abajo y el menú lateral de la
 * compu). Con la cuenta, el ícono rebota en cada toque, también el de la pestaña en la que ya estás.
 */
export function useToques() {
  const [toques, setToques] = useState<Record<string, number>>({})

  const tocar = useCallback((boton: string) => {
    setToques((antes) => ({ ...antes, [boton]: (antes[boton] ?? 0) + 1 }))
  }, [])

  return { tocar, vezDe: (boton: string) => toques[boton] ?? 0 }
}
