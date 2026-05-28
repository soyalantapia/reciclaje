import { useMemo } from 'react'
import { toast } from 'sonner'
import { Download, Printer, QrCode } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import type { Sponsor } from '@/types'
import { pointDeepLink } from '@/lib/utils'
import { downloadQrPng, printQr } from '@/lib/qr'
import { QrImage } from '@/components/features/QrImage'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function CommerceQr() {
  const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])
  const { data: sponsors } = useApi(() => api.getSponsors(), [])

  const sponsorMap = useMemo(() => {
    const m = new Map<string, Sponsor>()
    sponsors?.forEach((s) => m.set(s.id, s))
    return m
  }, [sponsors])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">QR de comercios</h1>
        <p className="text-sm text-muted-foreground">
          El QR de cada punto de la red. Escaneá uno con la app para iniciar el circuito completo.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-eco-200 bg-eco-50 p-3 text-sm text-eco-800 dark:border-eco-700/40 dark:bg-eco-900/20 dark:text-eco-200">
        <Printer size={18} className="mt-0.5 shrink-0" />
        Mostralos en otra pantalla o imprimilos en el punto. Funcionan con la cámara de la app y
        con la cámara nativa del teléfono (abren el aporte de ese comercio).
      </div>

      {error && !points ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-3">
          {loading && [0, 1].map((i) => <Skeleton key={i} className="h-72 w-full" />)}
          {points?.map((p) => {
            const sponsor = sponsorMap.get(p.sponsorId)
            const link = pointDeepLink(p.id)
            return (
              <div
                key={p.id}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: sponsor?.brandColor ?? '#059669' }}
                  >
                    <QrCode size={16} />
                  </span>
                  <span className="text-sm font-bold">{sponsor?.name}</span>
                </div>
                <p className="mt-1 text-sm font-semibold">{p.name}</p>

                <div className="my-4 rounded-2xl border border-border bg-white p-3">
                  <QrImage value={link} size={200} />
                </div>

                <div className="mb-3 flex w-full gap-2">
                  <Button
                    size="sm"
                    block
                    onClick={() => {
                      downloadQrPng(link, `qr-${p.id}.png`)
                      toast.success('QR descargado 🔳')
                    }}
                  >
                    <Download size={15} /> Descargar
                  </Button>
                  <Button size="sm" variant="secondary" block onClick={() => printQr(link, p.name)}>
                    <Printer size={15} /> Imprimir
                  </Button>
                </div>

                <p className="break-all rounded-lg bg-muted px-3 py-1.5 text-[11px] text-muted-foreground">
                  {link}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
