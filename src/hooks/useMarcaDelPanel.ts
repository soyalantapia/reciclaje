import type { CSSProperties } from 'react'
import { useSessionStore } from '@/store/session'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { estiloDeMarca } from '@/lib/marca'

/**
 * La marca de la institución que entró al panel, si la cargó en «Marca»: su escudo, su color y las
 * variables que pisan la paleta eco. Un comercio no tiene marca de club: devuelve null.
 */
export function useMarcaDelPanel(): { escudo?: string; color: string; estilo: CSSProperties } | null {
  const commerce = useSessionStore((s) => s.commerce)
  const marca = useMarcaDelClubStore((s) => (commerce ? s.marcas[commerce.id] : undefined))
  if (!commerce || !esInstitucion(commerce.category) || !marca) return null
  return { escudo: marca.escudo, color: marca.color, estilo: estiloDeMarca(marca.color) as CSSProperties }
}
