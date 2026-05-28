import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  value: string
  size?: number
  className?: string
}

/** QR real y escaneable generado con `qrcode` (PNG data URL). */
export function QrImage({ value, size = 220, className }: Props) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0c1f1a', light: '#ffffff' },
    })
      .then((url) => active && setSrc(url))
      .catch(() => active && setSrc(null))
    return () => {
      active = false
    }
  }, [value, size])

  if (!src) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-hidden
      />
    )
  }
  return <img src={src} alt="Código QR" width={size} height={size} className={className} />
}
