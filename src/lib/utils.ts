import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MaterialType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 12.450 → "12.450" (separador de miles es-AR). */
export function formatNumber(n: number): string {
  return n.toLocaleString('es-AR')
}

/** XP con sufijo. 1450 → "1.450 XP". */
export function formatXp(n: number): string {
  return `${formatNumber(n)} XP`
}

export function formatDate(date: string | Date, locale = 'es-AR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const days = Math.floor(h / 24)
  if (days < 7) return `hace ${days} d`
  return formatDate(d)
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((part / total) * 100))
}

export const MATERIAL_LABEL: Record<MaterialType, string> = {
  tapitas: 'Tapitas',
  plastico: 'Plástico',
  vidrio: 'Vidrio',
  papel: 'Papel',
  aluminio: 'Aluminio',
}

export const MATERIAL_EMOJI: Record<MaterialType, string> = {
  tapitas: '🔵',
  plastico: '♻️',
  vidrio: '🫙',
  papel: '📄',
  aluminio: '🥫',
}

/**
 * Genera un SVG de QR placeholder determinístico a partir del payload.
 * No es un QR escaneable real — alcanza para la demo / handoff a backend.
 */
export function buildPlaceholderQrSvg(payload: string, size = 220): string {
  let h = 5381
  for (let i = 0; i < payload.length; i++) {
    h = (h * 33) ^ payload.charCodeAt(i)
  }
  const cells = 21
  const cell = Math.floor(size / cells)
  let rects = ''
  let seed = h >>> 0
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const isFinder =
        (x < 7 && y < 7) ||
        (x >= cells - 7 && y < 7) ||
        (x < 7 && y >= cells - 7)
      let on: boolean
      if (isFinder) {
        const fx = x < 7 ? x : x - (cells - 7)
        const fy = y < 7 ? y : y - (cells - 7)
        on =
          fx === 0 ||
          fx === 6 ||
          fy === 0 ||
          fy === 6 ||
          (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)
      } else {
        seed = (seed * 1664525 + 1013904223) >>> 0
        on = (seed & 1) === 1
      }
      if (on) {
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" rx="1" fill="#0c1f1a"/>`
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#ffffff"/>${rects}</svg>`
}

/** data: URI lista para usar en <img src>. */
export function qrDataUri(payload: string, size = 220): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildPlaceholderQrSvg(payload, size))}`
}

/** Código alfanumérico corto tipo cupón. */
export function shortCode(len = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}
