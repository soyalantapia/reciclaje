import { Boxes, CheckCircle2, Factory, MapPin, PackageCheck, Recycle, Truck, type LucideIcon } from 'lucide-react'
import type { TraceStage } from '@/types'

/** El ícono de cada etapa del recorrido del material. */
export const ICONO_DE_ETAPA: Record<TraceStage, LucideIcon> = {
  aporte: MapPin,
  validacion: CheckCircle2,
  lote: Boxes,
  retiro: Truck,
  clasificacion: Recycle,
  transformacion: Factory,
  producto: PackageCheck,
}
