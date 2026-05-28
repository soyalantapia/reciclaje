import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { CameraOff } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  onDecode: (text: string) => void
}

function humanize(e: unknown): string {
  const name = (e as { name?: string })?.name
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Permiso de cámara denegado. Activalo o elegí el punto abajo.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'NotReadableError')
    return 'No encontramos una cámara disponible. Elegí el punto abajo.'
  return 'No pudimos abrir la cámara. Elegí el punto abajo.'
}

/** Lector de QR por cámara real (@zxing/browser). Requiere https o localhost. */
export function QrScanner({ onDecode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onDecodeRef = useRef(onDecode)
  const [status, setStatus] = useState<'starting' | 'scanning' | 'error'>('starting')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    onDecodeRef.current = onDecode
  }, [onDecode])

  useEffect(() => {
    let controls: IScannerControls | null = null
    let cancelled = false
    let decoded = false
    const reader = new BrowserQRCodeReader()
    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !decoded) {
          decoded = true
          onDecodeRef.current(result.getText())
        }
      })
      .then((c) => {
        if (cancelled) {
          c.stop()
          return
        }
        controls = c
        setStatus('scanning')
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setStatus('error')
          setErrorMsg(humanize(e))
        }
      })
    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl bg-ink-900">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />

      {status === 'scanning' && (
        <>
          {['left-4 top-4', 'right-4 top-4', 'left-4 bottom-4', 'right-4 bottom-4'].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} h-8 w-8 rounded-md border-eco-400`}
              style={{
                borderTopWidth: pos.includes('top') ? 3 : 0,
                borderBottomWidth: pos.includes('bottom') ? 3 : 0,
                borderLeftWidth: pos.includes('left') ? 3 : 0,
                borderRightWidth: pos.includes('right') ? 3 : 0,
              }}
            />
          ))}
          <motion.div
            className="absolute inset-x-8 h-0.5 bg-eco-400 shadow-[0_0_12px_2px] shadow-eco-400"
            initial={{ top: '12%' }}
            animate={{ top: ['12%', '88%', '12%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {status === 'starting' && (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/70">
          Activando cámara…
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 grid place-items-center bg-ink-900 p-6 text-center">
          <div className="text-white/80">
            <CameraOff size={36} className="mx-auto mb-2 text-white/50" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  )
}
