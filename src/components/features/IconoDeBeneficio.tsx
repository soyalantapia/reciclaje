import { useId } from 'react'
import type { Benefit } from '@/types'
import { marcaOficial } from '@/lib/logos'

/**
 * El ícono de un beneficio: su emoji, salvo la camiseta del club.
 *
 * El 👕 se ve celeste en iPhone y en Mac, que en Córdoba es el color de Belgrano. Para la camiseta de
 * un club con marca oficial (hoy sólo Talleres) se dibuja una camiseta a rayas con el color del club.
 */
export function IconoDeBeneficio({ benefit }: { benefit: Pick<Benefit, 'emoji' | 'sponsorId' | 'sponsorName'> }) {
  const marca = benefit.emoji === '👕' ? marcaOficial({ id: benefit.sponsorId, name: benefit.sponsorName }) : null
  if (!marca) return <>{benefit.emoji}</>
  return <CamisetaARayas color={marca.color} />
}

function CamisetaARayas({ color }: { color: string }) {
  const recorte = `camiseta-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const contorno = 'M9 4 L15 2 Q20 6 25 2 L31 4 L38 11 L33 16 L30 13 L30 37 L10 37 L10 13 L7 16 L2 11 Z'
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" role="img" aria-label="Camiseta del club">
      <defs>
        <clipPath id={recorte}>
          <path d={contorno} />
        </clipPath>
      </defs>
      <path d={contorno} fill="#ffffff" />
      <g clipPath={`url(#${recorte})`} fill={color}>
        {[0, 8, 16, 24, 32].map((x) => (
          <rect key={x} x={x + 4} y="0" width="4" height="40" />
        ))}
      </g>
      <path d={contorno} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
