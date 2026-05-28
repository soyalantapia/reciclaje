import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  length?: number
  onComplete?: (value: string) => void
  autoFocus?: boolean
}

/** Input de código OTP de N casillas (numérico), con avance de foco, backspace y pegado. */
export function OtpInput({ value, onChange, length = 6, onComplete, autoFocus }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  function emit(next: string) {
    onChange(next)
    if (next.length === length && /^\d+$/.test(next)) onComplete?.(next)
  }

  function handleChange(i: number, raw: string) {
    const d = raw.replace(/\D/g, '').slice(-1)
    const arr = value.split('')
    while (arr.length < length) arr.push('')
    arr[i] = d
    emit(arr.join('').replace(/\s+$/g, ''))
    if (d && i < length - 1) refs.current[i + 1]?.focus()
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!text) return
    e.preventDefault()
    emit(text)
    refs.current[Math.min(text.length, length - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          aria-label={`Dígito ${i + 1}`}
          className={cn(
            'h-14 w-11 rounded-xl border border-input bg-card text-center text-2xl font-extrabold text-foreground',
            'focus-visible:border-eco-500 focus-visible:ring-2 focus-visible:ring-eco-500/40',
          )}
        />
      ))}
    </div>
  )
}
