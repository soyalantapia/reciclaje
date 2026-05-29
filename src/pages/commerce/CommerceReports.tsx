import { useMemo } from 'react'
import { toast } from 'sonner'
import { Download, FileText, Printer } from 'lucide-react'
import type { SponsorMetrics } from '@/types'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useCreatedCommerceStore } from '@/store/createdCommerce'
import { metricsFor } from '@/lib/metrics'
import { downloadBlob, formatNumber, objectsToCsv } from '@/lib/utils'
import { ErrorState } from '@/components/features/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function metricRows(m: SponsorMetrics): { metrica: string; valor: number }[] {
  return [
    { metrica: 'Usuarios activos', valor: m.activeUsers },
    { metrica: 'Aportes', valor: m.contributions },
    { metrica: 'XP emitidos', valor: m.xpEmitted },
    { metrica: 'Beneficios canjeados', valor: m.benefitsRedeemed },
    { metrica: 'Kg recuperados', valor: m.kgRecovered },
    { metrica: 'Tapitas recuperadas', valor: m.capsRecovered },
    { metrica: 'Huella Verde (0-100)', valor: m.greenScore },
    ...m.monthlySeries.map((s) => ({ metrica: `Aportes ${s.label}`, valor: s.value })),
    ...m.byPoint.map((p) => ({ metrica: `Punto: ${p.point}`, valor: p.contributions })),
  ]
}

function printReport(m: SponsorMetrics, name: string) {
  const w = window.open('', '_blank', 'width=760,height=900')
  if (!w) return
  const rows = metricRows(m)
    .map(
      (r) =>
        `<tr><td style="padding:9px 14px;border-bottom:1px solid #eee">${r.metrica}</td>` +
        `<td style="padding:9px 14px;border-bottom:1px solid #eee;text-align:right;font-weight:700">${formatNumber(r.valor)}</td></tr>`,
    )
    .join('')
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Reporte ${name}</title></head>` +
      `<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;color:#0c1f1a;padding:40px">` +
      `<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #059669;padding-bottom:12px">` +
      `<h1 style="margin:0;font-size:22px">Reporte de impacto · ${name}</h1>` +
      `<span style="color:#059669;font-weight:800">ReciclaXP</span></div>` +
      `<p style="color:#555">Resumen de impacto ambiental y comunidad — uso RSE / auditoría.</p>` +
      `<table style="width:100%;border-collapse:collapse;margin-top:8px">${rows}</table>` +
      `<p style="margin-top:24px;color:#888;font-size:12px">Generado con ReciclaXP · datos del período actual.</p>` +
      `</body></html>`,
  )
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 350)
}

export default function CommerceReports() {
  const commerce = useSessionStore((s) => s.commerce)
  const createdCommerce = useCreatedCommerceStore((s) => s.commerce)
  const createdPoint = useCreatedCommerceStore((s) => s.point)
  const { data: points, loading, error, reload } = useApi(() => api.getPoints(), [])

  const m = useMemo(() => {
    if (!commerce || !points) return null
    const extra = createdCommerce?.id === commerce.id && createdPoint ? [createdPoint] : []
    return metricsFor(commerce, [...points, ...extra])
  }, [commerce, points, createdCommerce, createdPoint])

  if (!commerce) return null
  if (error && !m) return <ErrorState message={error} onRetry={reload} />
  if (loading || !m) return <Skeleton className="h-64 w-full" />

  function downloadCsv() {
    downloadBlob(`reporte-${commerce!.slug}.csv`, objectsToCsv(metricRows(m!)), 'text/csv;charset=utf-8')
    toast.success('Reporte CSV descargado 📄')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          Llevate tu impacto para presentar RSE o auditoría.
        </p>
      </div>

      {/* Preview de lo que incluye */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-eco-600" />
          <p className="font-bold">Reporte de impacto · {commerce.name}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {metricRows(m)
            .slice(0, 7)
            .map((r) => (
              <div key={r.metrica} className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">{r.metrica}</span>
                <span className="font-bold">{formatNumber(r.valor)}</span>
              </div>
            ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          + detalle por mes y por punto. Datos del período actual.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={downloadCsv}>
          <Download size={18} /> Descargar CSV
        </Button>
        <Button size="lg" variant="secondary" onClick={() => printReport(m, commerce.name)}>
          <Printer size={18} /> Imprimir / PDF
        </Button>
      </div>
    </div>
  )
}
