import type { ProjectIllustration } from '@/types'

interface Props {
  type: ProjectIllustration
  className?: string
}

/**
 * Ilustraciones SVG planas de los productos fabricados con material
 * reciclado. Se dibujan SIEMPRE a color: el efecto B&N→color lo aplica
 * <ImpactProgress> por CSS (filtro grayscale + clip-path), no acá.
 *
 * Importante: sin <defs>/ids internos (gradientes, filtros), porque el SVG
 * se renderiza DOS veces (capa gris + capa color) y los ids colisionarían.
 */
export function ProductIllustration({ type, className }: Props) {
  if (type === 'bench') return <BenchSVG className={className} />
  return <TotemSVG className={className} />
}

function BenchSVG({ className }: { className?: string }) {
  const seats = [0, 1, 2, 3, 4]
  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label="Banco de suplentes reciclado">
      <rect x="0" y="214" width="400" height="46" fill="#bbf7d0" />
      <rect x="0" y="214" width="400" height="6" fill="#86efac" />
      {/* estructura trasera */}
      <rect x="44" y="74" width="312" height="118" rx="10" fill="#27313f" />
      <rect x="44" y="74" width="312" height="118" rx="10" fill="#1f2937" opacity="0.4" />
      {/* techo / canopy */}
      <polygon points="22,76 378,76 356,38 44,38" fill="#E1122B" />
      <rect x="22" y="72" width="356" height="10" rx="5" fill="#ffffff" />
      {/* asientos */}
      {seats.map((i) => (
        <g key={i}>
          <rect x={62 + i * 60} y={116} width={50} height={44} rx={8} fill="#E1122B" />
          <rect x={62 + i * 60} y={116} width={50} height={12} rx={6} fill="#f0455a" />
          {/* tapitas que forman el asiento */}
          <circle cx={74 + i * 60} cy={146} r={4} fill="#0033A0" />
          <circle cx={87 + i * 60} cy={150} r={4} fill="#f59e0b" />
          <circle cx={100 + i * 60} cy={146} r={4} fill="#10b981" />
        </g>
      ))}
      {/* base y patas */}
      <rect x="50" y="160" width="300" height="14" rx="7" fill="#374151" />
      <rect x="74" y="174" width="12" height="42" fill="#374151" />
      <rect x="314" y="174" width="12" height="42" fill="#374151" />
    </svg>
  )
}

function TotemSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label="Mobiliario y cartelería reciclada">
      <rect x="0" y="214" width="400" height="46" fill="#bbf7d0" />
      <rect x="0" y="214" width="400" height="6" fill="#86efac" />
      {/* poste */}
      <rect x="192" y="150" width="16" height="70" rx="4" fill="#475569" />
      {/* tablero */}
      <rect x="132" y="34" width="136" height="128" rx="14" fill="#0033A0" />
      <rect x="132" y="34" width="136" height="128" rx="14" fill="#1d4ed8" opacity="0.25" />
      {/* disco reciclaje */}
      <circle cx="200" cy="78" r="30" fill="#ffffff" />
      <path d="M200 60 l10 17 h-20 z" fill="#10b981" />
      <path d="M186 86 l-9 16 18 0 z" fill="#10b981" />
      <path d="M214 86 l9 16 -18 0 z" fill="#10b981" />
      <circle cx="200" cy="80" r="7" fill="#0033A0" />
      {/* líneas de texto */}
      <rect x="150" y="120" width="100" height="10" rx="5" fill="#ffffff" />
      <rect x="162" y="138" width="76" height="8" rx="4" fill="#a7f3d0" />
      {/* banco reciclado al lado */}
      <rect x="40" y="170" width="84" height="14" rx="6" fill="#f59e0b" />
      <rect x="48" y="184" width="10" height="30" fill="#b45309" />
      <rect x="106" y="184" width="10" height="30" fill="#b45309" />
      <circle cx="58" cy="177" r="3.5" fill="#0033A0" />
      <circle cx="74" cy="177" r="3.5" fill="#10b981" />
      <circle cx="90" cy="177" r="3.5" fill="#E1122B" />
    </svg>
  )
}
