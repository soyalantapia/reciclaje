import { useEffect, useState } from 'react'
import { ApiError } from '@/services/api'
import { ERRORS } from '@/lib/copy'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Hook genérico para leer de la API mock. `deps` controla cuándo refetchear.
 * `fetcher` se omite a propósito de las deps (se recrea en cada render).
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const d = await fetcher()
        if (active) setData(d)
      } catch (e) {
        if (active) setError(e instanceof ApiError ? e.message : ERRORS.unknown)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, loading, error, reload: () => setNonce((n) => n + 1) }
}
