import { useMemo } from 'react'
import { toast } from 'sonner'
import { Download, Printer } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { pointDeepLink } from '@/lib/utils'
import { downloadQrPng, printQr } from '@/lib/qr'
import { QrImage } from '@/components/features/QrImage'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function CommercePoints() {
  const commerce = useSessionStore((s) => s.commerce)
  const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])

  const mine = useMemo(
    () => (points ?? []).filter((p) => p.sponsorId === commerce?.id),
    [points, commerce?.id],
  )

  if (!commerce) return null

  async function download(value: string, name: string) {
    await downloadQrPng(value, `qr-${name}.png`)
    toast.success('QR descargado 🔳')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Puntos / QR</h1>
        <p className="text-sm text-muted-foreground">
          El QR de cada uno de tus puntos. Descargalo o imprimilo para el local.
        </p>
      </div>

      {error && !points ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        [0, 1].map((i) => <Skeleton key={i} className="h-80 w-full" />)
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">📍</p>
          <p className="mt-2 font-bold">Todavía no tenés puntos configurados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coordiná con ReciclaXP la instalación de tu primer punto o máquina para empezar a
            recibir aportes.
          </p>
        </div>
      ) : (
        mine.map((p) => {
          const link = pointDeepLink(p.id)
          return (
            <div
              key={p.id}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-sm"
            >
              <p className="font-bold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.address}</p>
              <div className="my-4 rounded-2xl border border-border bg-white p-3">
                <QrImage value={link} size={190} />
              </div>
              <div className="flex w-full gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  block
                  onClick={() => download(link, p.id)}
                >
                  <Download size={15} /> Descargar
                </Button>
                <Button size="sm" variant="secondary" block onClick={() => printQr(link, p.name)}>
                  <Printer size={15} /> Imprimir
                </Button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
