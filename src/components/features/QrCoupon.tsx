import type { Coupon } from '@/types'
import { qrDataUri, formatDate } from '@/lib/utils'

export function QrCoupon({ coupon }: { coupon: Coupon }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-2xl">🎉</p>
      <p className="mt-1 font-bold">{coupon.benefitTitle}</p>
      <p className="text-sm text-muted-foreground">{coupon.sponsorName}</p>

      <div className="mt-4 rounded-2xl border border-border bg-white p-3">
        <img
          src={qrDataUri(coupon.qrPayload, 200)}
          alt="Cupón QR"
          width={200}
          height={200}
        />
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Código
      </p>
      <p className="text-2xl font-extrabold tracking-[0.2em] text-eco-700">{coupon.code}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Mostralo en el comercio · Válido hasta {formatDate(coupon.expiresAt)}
      </p>
    </div>
  )
}
