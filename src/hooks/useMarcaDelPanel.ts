import type { CSSProperties } from 'react'
import { useSessionStore } from '@/store/session'
import { useMarcaDelClubStore } from '@/store/marcaDelClub'
import { esInstitucion } from '@/lib/vocabulario'
import { COLOR_DE_RECICLAXP, esColorPropio, estiloDeMarca } from '@/lib/marca'
import { marcaOficial } from '@/lib/logos'

/**
 * La marca de la institución que entró al panel, si la cargó en «Marca»: su escudo, su color y las
 * variables que pisan la paleta eco. Un comercio no tiene marca de club: devuelve null.
 *
 * El verde de ReciclaXP es el «todavía no eligió el suyo» (un escudo del que no salió ningún color se
 * guarda con él): no pisa la paleta, así que `estilo` queda vacío y sólo se ve el escudo. Lo guardado en
 * el navegador puede venir roto: sin marcas, o con una marca sin color, no tira; esa marca toma ese verde.
 */
export function useMarcaDelPanel(): { escudo?: string; color: string; estilo: CSSProperties } | null {
  const commerce = useSessionStore((s) => s.commerce)
  const guardada = useMarcaDelClubStore((s) => (commerce ? s.marcas?.[commerce.id] : undefined))
  // Lo que cargó en «Marca» manda; si no cargó nada, la marca oficial que trae la demo (el escudo de Talleres).
  const marca = guardada ?? (commerce ? marcaOficial(commerce) ?? undefined : undefined)
  if (!commerce || !esInstitucion(commerce.category) || !marca) return null
  const color = typeof marca.color === 'string' ? marca.color : COLOR_DE_RECICLAXP
  return { escudo: marca.escudo, color, estilo: esColorPropio(color) ? (estiloDeMarca(color) as CSSProperties) : {} }
}
