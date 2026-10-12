import { useLayoutEffect } from 'react'
import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'
import { ESCENARIO } from '@/lib/escenario'
import { AZUL_DE_TALLERES, esTalleres } from '@/lib/logos'
import { esColorPropio, estiloDeMarca } from '@/lib/marca'

/**
 * Pone la paleta de un color en <html> mientras la pantalla está abierta, y la saca al salir. Los Modal
 * se montan en document.body, fuera de cualquier contenedor: por eso va en <html>. Es un efecto de
 * layout para que se saque en el mismo cuadro en que se sale. Sin un color propio (el verde de
 * ReciclaXP) no hay nada que poner.
 */
export function usePaleta(color: string | undefined) {
  const propio = color && esColorPropio(color) ? color : undefined
  useLayoutEffect(() => {
    if (!propio) return
    const raiz = document.documentElement
    const variables = Object.entries(estiloDeMarca(propio))
    for (const [nombre, valor] of variables) raiz.style.setProperty(nombre, valor)
    return () => {
      for (const [nombre] of variables) raiz.style.removeProperty(nombre)
    }
  }, [propio])
}

/** La paleta de la marca de la institución que entró al panel. La usan el panel y la pantalla del estadio. */
export function usePaletaDelClub() {
  usePaleta(useMarcaDelPanel()?.color)
}

/**
 * La paleta de la app del hincha: en la demo del club, si el club es Talleres, su azul. En la demo
 * general, la app es de toda la red y queda con el verde de ReciclaXP.
 */
export function colorDeLaAppDelHincha(escenario = ESCENARIO, nombre?: string): string | undefined {
  return escenario === 'club' && esTalleres(nombre) ? AZUL_DE_TALLERES : undefined
}

export function usePaletaDeLaAppDelHincha() {
  usePaleta(colorDeLaAppDelHincha())
}
