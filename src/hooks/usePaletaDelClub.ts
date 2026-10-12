import { useLayoutEffect } from 'react'
import { useMarcaDelPanel } from '@/hooks/useMarcaDelPanel'
import { esColorPropio, estiloDeMarca } from '@/lib/marca'

/**
 * Pone la paleta de la marca del club en <html> mientras la pantalla está abierta, y la saca al salir.
 * Los Modal se montan en document.body, fuera del panel: por eso va en <html> y no en un contenedor.
 * Es un efecto de layout para que se saque en el mismo cuadro en que se sale: el login no pinta ni un
 * cuadro con los colores del club. Sin un color propio (el verde de ReciclaXP) no hay nada que poner.
 * Lo usan el panel y la pantalla del estadio, que vive fuera del panel.
 */
export function usePaletaDelClub() {
  const marca = useMarcaDelPanel()
  const colorDeLaMarca = marca && esColorPropio(marca.color) ? marca.color : undefined
  useLayoutEffect(() => {
    if (!colorDeLaMarca) return
    const raiz = document.documentElement
    const variables = Object.entries(estiloDeMarca(colorDeLaMarca))
    for (const [nombre, valor] of variables) raiz.style.setProperty(nombre, valor)
    return () => {
      for (const [nombre] of variables) raiz.style.removeProperty(nombre)
    }
  }, [colorDeLaMarca])
}
